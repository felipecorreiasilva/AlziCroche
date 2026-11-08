import { Request, Response } from 'express';
import efi from '../config/efi';
import { OrderModel } from '../models/Order';

export class EfiController {

  // Método principal unificado que faz o checkout completo
  static async processPayment(req: Request, res: Response) {
    try {
      const { user_id, customer, address, shipping, items, subtotal, total, payment } = req.body;

      if (!payment || !payment.method) {
        return res.status(400).json({ error: 'Forma de pagamento não informada.' });
      }

      // 1. Cria o pedido previamente no banco de dados com status 'pending'
      const orderTxid = `alzicroche_${Date.now()}`;
      const newOrder = await OrderModel.create({
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
        shipping_service: shipping?.service || 'PAC',
        shipping_cost: Number(shipping?.cost || 0),
        subtotal: Number(subtotal),
        total: Number(total),
        payment_method: payment.method,
        status: 'pending',
        items: items
      });

      // 2. PROCESSAMENTO PIX
      if (payment.method === 'pix') {
        const pixKey = process.env.EFI_PIX_KEY;
        if (!pixKey) {
          return res.status(500).json({ error: 'Chave Pix não configurada no servidor.' });
        }

        const bodyPix = {
          calendario: {
            expiracao: 3600
          },
          valor: {
            original: Number(total).toFixed(2)
          },
          chave: pixKey,
          solicitacaoPagador: `Pedido AlziCrochê #${newOrder.id || orderTxid}`
        };

        // Chamada oficial idêntica ao seu outro projeto funcional
        const cobResponse = await (efi as any).pixCreateImmediateCharge({}, bodyPix);
        const qrcodeResponse = await efi.pixGenerateQRCode({ id: cobResponse.loc.id });

        return res.status(201).json({
          success: true,
          method: 'pix',
          orderId: newOrder.id || orderTxid,
          pix: {
            txid: cobResponse.txid,
            qrcode: qrcodeResponse.imagemQrcode,
            copiaECola: qrcodeResponse.qrcode,
          },
        });
      }

      // 3. PROCESSAMENTO CARTÃO DE CRÉDITO / DÉBITO
      if (payment.method === 'credit_card' || payment.method === 'debit_card') {
        const { card_details } = payment;
        
        if (!card_details || !card_details.number || !card_details.expiry || !card_details.cvv || !card_details.name) {
          return res.status(400).json({ error: 'Dados do cartão incompletos.' });
        }

        const [mes, ano] = card_details.expiry.split('/');

        const formattedItems = items.map((item: any) => ({
          name: item.name || `Produto #${item.product_id}`,
          value: Math.round(Number(item.price) * 100),
          amount: item.quantity
        }));

        const bodyCard = {
          items: formattedItems,
          payment: {
            [payment.method]: {
              payment_token: card_details.payment_token || "",
              card_number: card_details.number.replace(/\s/g, ''),
              expiration_month: mes,
              expiration_year: `20${ano}`,
              cvv: card_details.cvv,
              billingAddress: {
                street: address.address,
                number: address.number,
                neighborhood: address.neighborhood,
                zipcode: address.cep.replace(/\D/g, ''),
                city: address.city,
                state: address.state
              }
            }
          }
        };

        const response = await (efi as any).createCharge({}, bodyCard);

        if (newOrder && newOrder.id && typeof OrderModel.updateStatus === 'function') {
          await OrderModel.updateStatus(newOrder.id, 'approved');
        }

        return res.status(200).json({
          success: true,
          method: payment.method,
          orderId: newOrder.id,
          data: response,
          message: 'Pagamento com cartão processado com sucesso!',
        });
      }

      return res.status(400).json({ error: 'Método de pagamento inválido.' });

    } catch (error: any) {
      console.error('Erro detalhado Efí:', JSON.stringify(error?.data || error, null, 2));
      return res.status(500).json({ 
        error: error?.data?.mensagem || error?.data?.message || 'Erro interno ao processar o pagamento.' 
      });
    }
  }
}