import type { Context, MiddlewareHandler } from 'hono';
import type { PaywallConfig } from './types';
import { parsePaymentHeader, buildPaymentRequired, settlePayment, validatePaymentAmount, validatePaymentRecipient } from './core';

export type { PaywallConfig } from './types';

/**
 * Hono middleware that gates a route behind an x402 paywall.
 *
 * Usage:
 * ```ts
 * import { Hono } from 'hono';
 * import { x402Paywall } from '@xylofacilitator/middleware/hono';
 *
 * const app = new Hono();
 *
 * app.get('/api/weather', x402Paywall({
 *   apiKey: process.env.XYLO_API_KEY!,
 *   priceUsd: 0.01,
 *   description: 'Weather forecast API'
 * }), (c) => {
 *   return c.json({ weather: 'sunny' });
 * });
 * ```
 */
export function x402Paywall(config: PaywallConfig): MiddlewareHandler {
  return async (c: Context, next) => {
    // Check for payment header
    const paymentHeader = c.req.header('x-payment') || c.req.header('authorization');
    const payment = parsePaymentHeader(paymentHeader);

    if (!payment) {
      return c.json(buildPaymentRequired(config), 402);
    }

    // Validate payment amount
    if (!validatePaymentAmount(payment, config.priceUsd)) {
      return c.json({
        ...buildPaymentRequired(config),
        error: 'Insufficient payment',
        required: String(Math.floor(config.priceUsd * 1e6)),
        provided: payment.value,
      }, 402);
    }

    // Validate recipient
    if (!validatePaymentRecipient(payment)) {
      return c.json({
        ...buildPaymentRequired(config),
        error: 'Invalid payment recipient',
      }, 402);
    }

    // Delegate settlement to XyloFacilitator backend
    try {
      const result = await settlePayment(payment, config);
      // Attach receipt headers
      c.header('X-Payment-Receipt', result.txHash);
      c.header('X-Payment-Amount', String(result.amount));
      // Attach settlement info for handler use
      c.set('x402', {
        txHash: result.txHash,
        from: result.from,
        amount: result.amountUSD,
        blockNumber: result.blockNumber,
      });
      await next();
    } catch (error: any) {
      return c.json({
        ...buildPaymentRequired(config),
        error: 'Payment settlement failed',
        details: error.message,
      }, 402);
    }
  };
}
