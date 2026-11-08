import type { Request, Response } from 'express';
import { MelhorEnvioService } from '../services/melhorEnvioService';

export class MelhorEnvioController {
  static async calculate(req: Request, res: Response): Promise<void> {
    try {
      const { postal_code_destination, products } = req.body;

      if (!postal_code_destination) {
        res.status(400).json({ error: 'O CEP de destino é obrigatório.' });
        return;
      }

      if (!products || !Array.isArray(products) || products.length === 0) {
        res.status(400).json({ error: 'A lista de produtos para cálculo de frete é obrigatória.' });
        return;
      }

      const shippingRates = await MelhorEnvioService.calculateShipping({
        postal_code_destination,
        products,
      });

      res.status(200).json(shippingRates);
    } catch (error: any) {
      console.error('Erro no controller de frete:', error);
      res.status(500).json({ error: error.message || 'Erro interno ao calcular o frete.' });
    }
  }
}