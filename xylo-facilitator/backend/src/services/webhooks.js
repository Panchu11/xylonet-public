/**
 * Webhook Delivery Engine
 * Delivers events to developer-registered webhook URLs with HMAC-SHA256 signing and retry.
 *
 * Signature format:
 *   X-XyloFacilitator-Signature: sha256=<hex>
 *   Signed content = `${timestamp}.${body}`  (timestamp is Unix epoch seconds)
 *
 * Receiver-side replay protection (recommended):
 *   Reject payloads where abs(now - X-Webhook-Timestamp) > 300 seconds (5 minutes).
 */

const crypto = require('crypto');

/**
 * Deliver a webhook event to all matching developer webhooks
 * @param {object} supabase - Supabase client
 * @param {string} developerId - Developer UUID
 * @param {string} eventType - Event type (e.g., 'payment.settled', 'route.created')
 * @param {object} payload - Event payload
 */
async function deliverWebhook(supabase, developerId, eventType, payload) {
  if (!supabase) return;

  try {
    // Look up developer's webhook configs
    const { data: developer } = await supabase
      .from('xf_developers')
      .select('webhook_url, webhook_secret, webhook_events')
      .eq('id', developerId)
      .single();

    if (!developer?.webhook_url) return;

    // Check if this event type is subscribed
    const subscribedEvents = developer.webhook_events || ['payment.settled'];
    if (!subscribedEvents.includes(eventType) && !subscribedEvents.includes('*')) return;

    const deliveryId = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000); // Unix epoch seconds

    const body = JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload
    });

    // HMAC-SHA256 signature over "timestamp.body" — timestamp binds the signature
    // to a specific point in time, enabling receivers to reject stale replays.
    const secret = developer.webhook_secret || developerId;
    const signedPayload = `${timestamp}.${body}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Attempt delivery with retries
    const maxAttempts = 3;
    let lastError = null;
    let deliveryStatus = 'failed';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(developer.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-XyloFacilitator-Signature': `sha256=${signature}`,
            'X-XyloFacilitator-Event': eventType,
            'X-XyloFacilitator-Delivery': deliveryId,
            'X-Webhook-ID': deliveryId,
            'X-Webhook-Timestamp': String(timestamp),
            'User-Agent': 'XyloFacilitator-Webhook/1.0'
          },
          body,
          signal: AbortSignal.timeout(10000) // 10s timeout
        });

        if (response.ok) {
          deliveryStatus = 'sent';
          lastError = null;
          break;
        }

        lastError = `HTTP ${response.status}`;
      } catch (err) {
        lastError = err.message;
      }

      // Exponential backoff before retry
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Record delivery attempt
    await supabase.from('xf_webhook_events').insert({
      developer_id: developerId,
      event_type: eventType,
      payload: payload,
      delivery_url: developer.webhook_url,
      delivery_status: deliveryStatus,
      attempts: deliveryStatus === 'sent' ? 1 : maxAttempts,
      last_error: lastError
    }).catch(() => {}); // Non-critical, don't throw

  } catch (error) {
    console.error('[Webhook] Delivery error:', error.message);
  }
}

module.exports = { deliverWebhook };
