import { Request, Response } from 'express';
import efi from '../config/efi';

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
    const { customer, total } = req.body;
    const txid = `alzicroche${Date.now()}`;

    const body = {
      calendario: {
        expiracao: 3600, // 1 hora
      },
      valor: {
        original: total.toFixed(2),
      },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: `Pedido AlziCrochê - Total: R$ ${total.toFixed(2)}`,
      devedor: {
        cpf: customer.cpf.replace(/\D/g, ''),
        nome: customer.name,
      },
    };

    const chargeResponse = await (efi as any).pixCreateImmediateCharge({ txid }, body);
    const qrCodeResponse = await efi.pixGenerateQRCode({ id: chargeResponse.loc.id });

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
    const { customer, address, items, total, payment } = req.body;
    const { card_details } = payment;

    if (!card_details || !card_details.number || !card_details.expiry || !card_details.cvv || !card_details.name) {
      return res.status(400).json({ error: 'Dados do cartão de crédito incompletos.' });
    }

    // Quebra a validade (MM/AA) em mês e ano
    const [mes, ano] = card_details.expiry.split('/');

    // Montagem do payload padrão exigido pela API de Cartão da Efí
    const creditCardPayload = {
      items: items.map((item: any) => ({
        name: `Produto #${item.product_id}`,
        value: Math.round(Number(item.price) * 100), // Valor em centavos
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
          installments: 1, // Ajuste se for permitir parcelamento futuramente
          payment_token: "", // Caso utilize tokenização via JS da Efí, insira aqui
          card_number: card_details.number.replace(/\s/g, ''),
          expiration_month: mes,
          expiration_year: `20${ano}`, // Garante formato AAAA
          cvv: card_details.cvv,
          customer: {
            name: card_details.name,
            email: customer.email,
            cpf: customer.cpf.replace(/\D/g, ''),
            birthdate: "1990-01-01", // Se necessário pelo cadastro ou coletado no form
            phone_number: customer.phone.replace(/\D/g, ''),
          },
        },
      },
    };

    // Exemplo de chamada para o endpoint de cobrança por cartão na SDK da Efí:
    // (Certifique-se de validar se a sua aplicação na Efí possui o escopo de Cobranças/Cartão habilitado)
    const response = await (efi as any).chargePay({ id: 0 }, creditCardPayload); // Substitua o parâmetro 'id' pelo ID da cobrança gerada prévia se aplicável na sua regra

    return res.status(201).json({
      success: true,
      method: 'credit_card',
      orderId: `cc_${Date.now()}`,
      data: response,
      message: 'Pagamento com cartão de crédito processado com sucesso!',
    });
  }

  // 3. Função dedicada para Cartão de Débito
  private static async handleDebitCardPayment(req: Request, res: Response) {
    const { customer, address, items, total, payment } = req.body;
    const { card_details } = payment;

    if (!card_details || !card_details.number || !card_details.expiry || !card_details.cvv || !card_details.name) {
      return res.status(400).json({ error: 'Dados do cartão de débito incompletos.' });
    }

    const [mes, ano] = card_details.expiry.split('/');

    // Payload específico para transações de débito (geralmente requer URL de redirecionamento 3DS / Authenticated Debit)
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
          // Débito online / 3DS costuma exigir url de retorno para autenticação do banco
          callback_url: "https://seusite.com.br/checkout/success" 
        },
      },
    };

    // Chamada correspondente na SDK da Efí para débito
    const response = await (efi as any).chargePay({ id: 0 }, debitCardPayload);

    return res.status(201).json({
      success: true,
      method: 'debit_card',
      orderId: `deb_${Date.now()}`,
      data: response,
      message: 'Solicitação de débito gerada com sucesso!',
    });
  }
}