import { Request, Response } from 'express';
import efi from '../config/efi';
import { OrderModel } from '../models/Order';

export class EfiController {

  // Método principal unificado que roteia para a função correta
  static async processPayment(req: Request, res: Response) {
    try {
      const { payment } = req.body;

      if (!payment || !payment.method) {
        return res.status(400).json({ error: 'Forma de pagamento não informada.' });
      }

      if (payment.method === 'pix') {
        return await EfiController.handlePixPayment(req, res);
      }

      if (payment.method === 'credit_card') {
        return await EfiController.handleCreditCardPayment(req, res);
      }

      if (payment.method === 'debit_card') {
        return await EfiController.handleDebitCardPayment(req, res);
      }

      return res.status(400).json({ error: 'Método de pagamento inválido.' });

    } catch (error: any) {
      console.error('Erro ao processar pagamento na Efí:', error.data || error.message);
      return res.status(500).json({ 
        error: error.data?.message || error.data?.mensaje || error.message || 'Erro interno ao processar o pagamento.' 
      });
    }
  }

  // 1. Função dedicada para Pix
  private static async handlePixPayment(req: Request, res: Response) {
    const { user_id, customer, address, shipping, items, subtotal, total } = req.body;
    const txid = `alzicroche${Date.now()}`;

    const body = {
      calendario: {
        expiracao: 3600, // 1 hora
      },
      valor: {
        original: Number(total).toFixed(2),
      },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: `Pedido AlziCrochê - Total: R$ ${Number(total).toFixed(2)}`,
      devedor: {
        cpf: customer.cpf.replace(/\D/g, ''),
        nome: customer.name,
      },
    };

    // Cria a cobrança imediata na Efí
    const chargeResponse = await (efi as any).pixCreateImmediateCharge({ txid }, body);
    const qrCodeResponse = await efi.pixGenerateQRCode({ id: chargeResponse.loc.id });

    // Salva o pedido no PostgreSQL com status 'pending'
    await OrderModel.create({
      user_id: user_id || null,
      txid: chargeResponse.txid,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_cpf: customer.cpf,
      customer_phone: customer.phone,
      cep: address.cep,
      address: address.address,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      shipping_service: shipping.service || 'PAC',
      shipping_cost: Number(shipping.cost || 0),
      subtotal: Number(subtotal),
      total: Number(total),
      payment_method: 'pix',
      status: 'pending',
      items: items
    });

    return res.status(201).json({
      success: true,
      method: 'pix',
      orderId: txid,
      pix: {
        txid: chargeResponse.txid,
        qrcode: qrCodeResponse.imagemQrcode,
        copiaECola: qrCodeResponse.qrcode,
      },
    });
  }

  // 2. Função dedicada para Cartão de Crédito
  private static async handleCreditCardPayment(req: Request, res: Response) {
    const { user_id, customer, address, shipping, items, subtotal, total, payment } = req.body;
    const { card_details } = payment;

    if (!card_details || !card_details.number || !card_details.expiry || !card_details.cvv || !card_details.name) {
      return res.status(400).json({ error: 'Dados do cartão de crédito incompletos.' });
    }

    const [mes, ano] = card_details.expiry.split('/');
    const orderTxid = `cc_${Date.now()}`;

    const creditCardPayload = {
      items: items.map((item: any) => ({
        name: `Produto #${item.product_id}`,
        value: Math.round(Number(item.price) * 100),
        amount: item.quantity,
      })),
      customer: {
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf.replace(/\D/g, ''),
        phone_number: customer.phone.replace(/\D/g, ''),
      },
      billing: {
        address: {
          street: address.address,
          number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zipcode: address.cep.replace(/\D/g, ''),
        },
      },
      payment: {
        credit_card: {
          installments: 1,
          payment_token: "",
          card_number: card_details.number.replace(/\s/g, ''),
          expiration_month: mes,
          expiration_year: `20${ano}`,
          cvv: card_details.cvv,
          customer: {
            name: card_details.name,
            email: customer.email,
            cpf: customer.cpf.replace(/\D/g, ''),
            birthdate: "1990-01-01",
            phone_number: customer.phone.replace(/\D/g, ''),
          },
        },
      },
    };

    const response = await (efi as any).chargePay({ id: 0 }, creditCardPayload);

    // Salva o pedido no PostgreSQL (status aprovado ou pendente conforme retorno da Efí)
    await OrderModel.create({
      user_id: user_id || null,
      txid: orderTxid,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_cpf: customer.cpf,
      customer_phone: customer.phone,
      cep: address.cep,
      address: address.address,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      shipping_service: shipping.service || 'PAC',
      shipping_cost: Number(shipping.cost || 0),
      subtotal: Number(subtotal),
      total: Number(total),
      payment_method: 'credit_card',
      status: 'approved', // Ajuste conforme a resposta real da API de cartões da Efí
      items: items
    });

    return res.status(201).json({
      success: true,
      method: 'credit_card',
      orderId: orderTxid,
      data: response,
      message: 'Pagamento com cartão de crédito processado com sucesso!',
    });
  }

  // 3. Função dedicada para Cartão de Débito
  private static async handleDebitCardPayment(req: Request, res: Response) {
    const { user_id, customer, address, shipping, items, subtotal, total, payment } = req.body;
    const { card_details } = payment;

    if (!card_details || !card_details.number || !card_details.expiry || !card_details.cvv || !card_details.name) {
      return res.status(400).json({ error: 'Dados do cartão de débito incompletos.' });
    }

    const [mes, ano] = card_details.expiry.split('/');
    const orderTxid = `deb_${Date.now()}`;

    const debitCardPayload = {
      items: items.map((item: any) => ({
        name: `Produto #${item.product_id}`,
        value: Math.round(Number(item.price) * 100),
        amount: item.quantity,
      })),
      customer: {
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf.replace(/\D/g, ''),
        phone_number: customer.phone.replace(/\D/g, ''),
      },
      payment: {
        debit_card: {
          card_number: card_details.number.replace(/\s/g, ''),
          expiration_month: mes,
          expiration_year: `20${ano}`,
          cvv: card_details.cvv,
          callback_url: "https://seusite.com.br/checkout/success" 
        },
      },
    };

    const response = await (efi as any).chargePay({ id: 0 }, debitCardPayload);

    // Salva o pedido no PostgreSQL
    await OrderModel.create({
      user_id: user_id || null,
      txid: orderTxid,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_cpf: customer.cpf,
      customer_phone: customer.phone,
      cep: address.cep,
      address: address.address,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      shipping_service: shipping.service || 'PAC',
      shipping_cost: Number(shipping.cost || 0),
      subtotal: Number(subtotal),
      total: Number(total),
      payment_method: 'debit_card',
      status: 'pending',
      items: items
    });

    return res.status(201).json({
      success: true,
      method: 'debit_card',
      orderId: orderTxid,
      data: response,
      message: 'Solicitação de débito gerada com sucesso!',
    });
  }
}