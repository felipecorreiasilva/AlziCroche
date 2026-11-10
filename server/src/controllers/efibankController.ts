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

  // ---------------------------------------------------------
  // 4. WEBHOOK PIX (Recebe a notificação da Efí quando pago)
  // ---------------------------------------------------------
  static async webhook(req: Request, res: Response) {
    try {
      const pixPagamentos = req.body.pix;

      if (pixPagamentos && pixPagamentos.length > 0) {
        for (const pagamento of pixPagamentos) {
          const txid = pagamento.txid;
          const valorPago = pagamento.valor;
          console.log(`💰 Pix recebido! TXID: ${txid}, Valor: ${valorPago}`);

          if (txid) {
            const order = await OrderModel.findByTxid(txid);

            if (order) {
              await OrderModel.updateStatus(order.id, 'paid');
              console.log(`✅ Pedido #${order.id} atualizado para 'paid' via Webhook Pix.`);
            } else {
              console.warn(`⚠️ Nenhum pedido encontrado para o TXID: ${txid}`);
            }
          }
        }
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Erro ao processar webhook da Efí:', error);
      return res.status(500).json({ error: 'Erro interno no webhook.' });
    }
  }

  // ---------------------------------------------------------
  // 5. CONFIGURAR WEBHOOK NA EFÍ
  // ---------------------------------------------------------
  static async configurarWebhook(req: Request, res: Response) {
    try {
      const { webhookUrl } = req.body;
      const pixKey = process.env.EFI_PIX_KEY;

      if (!webhookUrl || !pixKey) {
        return res.status(400).json({ error: 'A URL do webhook e a chave Pix são obrigatórias.' });
      }

      await (efi as any).pixConfigWebhook({ chave: pixKey }, { webhookUrl });

      return res.status(200).json({ message: 'Webhook configurado com sucesso na Efí!' });
    } catch (error: any) {
      console.error('Erro ao configurar webhook:', error?.data || error);
      return res.status(500).json({ error: 'Erro ao registar webhook.' });
    }
  }
}