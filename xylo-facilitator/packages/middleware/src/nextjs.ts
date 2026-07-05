import type { PaywallConfig } from './types';
import { parsePaymentHeader, buildPaymentRequired, settlePayment, validatePaymentAmount, validatePaymentRecipient } from './core';

export type { PaywallConfig } from './types';

/**
 * Next.js API route wrapper that gates a handler behind an x402 paywall.
 *
 * Usage (App Router):
 * ```ts
 * import { withX402 } from '@xylofacilitator/middleware/nextjs';
 *
 * const handler = async (req: Request) => {
 *   return Response.json({ weather: 'sunny' });
 * };
 *
 * export const GET = withX402({
 *   apiKey: process.env.XYLO_API_KEY!,
 *   priceUsd: 0.01,
 * }, handler);
 * ```
 */
export function withX402(
  config: PaywallConfig,
  handler: (req: Request, context?: any) => Promise<Response> | Response
) {
  return async (req: Request, context?: any): Promise<Response> => {
    // Check for payment header
    const paymentHeader = req.headers.get('x-payment') || req.headers.get('authorization');
    const payment = parsePaymentHeader(paymentHeader);

    if (!payment) {
      return Response.json(buildPaymentRequired(config), { status: 402 });
    }

    // Validate payment amount
    if (!validatePaymentAmount(payment, config.priceUsd)) {
      return Response.json({
        ...buildPaymentRequired(config),
        error: 'Insufficient payment',
        required: String(Math.floor(config.priceUsd * 1e6)),
        provided: payment.value,
      }, { status: 402 });
    }

    // Validate recipient
    if (!validatePaymentRecipient(payment)) {
      return Response.json({
        ...buildPaymentRequired(config),
        error: 'Invalid payment recipient',
      }, { status: 402 });
    }

    // Delegate settlement to XyloFacilitator backend
    try {
      const result = await settlePayment(payment, config);

      // Call the actual handler
      const response = await handler(req, context);

      // Clone response to add payment headers
      const headers = new Headers(response.headers);
      headers.set('X-Payment-Receipt', result.txHash);
      headers.set('X-Payment-Amount', String(result.amount));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error: any) {
      return Response.json({
        ...buildPaymentRequired(config),
        error: 'Payment settlement failed',
        details: error.message,
      }, { status: 402 });
    }
  };
}
