import type { Request, Response, NextFunction } from 'express';
import type { PaywallConfig } from './types';
import { parsePaymentHeader, buildPaymentRequired, settlePayment, validatePaymentAmount, validatePaymentRecipient } from './core';

export type { PaywallConfig } from './types';

/**
 * Express middleware that gates a route behind an x402 paywall.
 *
 * Usage:
 * ```ts
 * import { x402Paywall } from '@xylofacilitator/middleware/express';
 *
 * app.get('/api/weather', x402Paywall({
 *   apiKey: process.env.XYLO_API_KEY!,
 *   priceUsd: 0.01,
 *   description: 'Weather forecast API'
 * }), (req, res) => {
 *   res.json({ weather: 'sunny' });
 * });
 * ```
 */
export function x402Paywall(config: PaywallConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check for payment header
    const paymentHeader = (req.headers['x-payment'] || req.headers['authorization']) as string | undefined;
    const payment = parsePaymentHeader(paymentHeader);

    if (!payment) {
      // No payment - return 402
      res.status(402).json(buildPaymentRequired(config));
      return;
    }

    // Validate payment amount
    if (!validatePaymentAmount(payment, config.priceUsd)) {
      res.status(402).json({
        ...buildPaymentRequired(config),
        error: 'Insufficient payment',
        required: String(Math.floor(config.priceUsd * 1e6)),
        provided: payment.value,
      });
      return;
    }

    // Validate recipient
    if (!validatePaymentRecipient(payment)) {
      res.status(402).json({
        ...buildPaymentRequired(config),
        error: 'Invalid payment recipient',
      });
      return;
    }

    // Delegate settlement to XyloFacilitator backend
    try {
      const result = await settlePayment(payment, config);
      // Attach receipt to response headers
      res.setHeader('X-Payment-Receipt', result.txHash);
      res.setHeader('X-Payment-Amount', String(result.amount));
      // Attach settlement info to request for handler use
      (req as any).x402 = {
        txHash: result.txHash,
        from: result.from,
        amount: result.amountUSD,
        blockNumber: result.blockNumber,
      };
      next();
    } catch (error: any) {
      res.status(402).json({
        ...buildPaymentRequired(config),
        error: 'Payment settlement failed',
        details: error.message,
      });
    }
  };
}
