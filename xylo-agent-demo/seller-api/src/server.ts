import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { x402Paywall } from '@xylofacilitator/middleware/express';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const XYLO_API_KEY = process.env.XYLO_API_KEY!;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://api.xylonet.xyz';

if (!XYLO_API_KEY || XYLO_API_KEY === 'xyl_your_api_key_here') {
  console.error('\n❌ Missing XYLO_API_KEY! Get one by registering on XyloFacilitator.\n');
  console.error('   1. Go to your XyloFacilitator dashboard');
  console.error('   2. Register as a developer');
  console.error('   3. Copy your API key into .env\n');
  process.exit(1);
}

// Health check (free, no payment)
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'XyloFacilitator Seller API Demo',
    endpoints: [
      { path: '/api/weather/:city', price: '$0.01', method: 'GET' },
      { path: '/api/summarize', price: '$0.02', method: 'POST' },
      { path: '/api/crypto-price/:symbol', price: '$0.005', method: 'GET' },
    ]
  });
});

// ─── ENDPOINT 1: Weather API ($0.01 per call) ───────────────────────────────

app.get('/api/weather/:city', x402Paywall({
  apiKey: XYLO_API_KEY,
  priceUsd: 0.01,
  facilitatorUrl: FACILITATOR_URL,
  description: 'Real-time weather data for any city',
}), (req, res) => {
  const city = req.params.city;
  const x402 = (req as any).x402;
  
  // Mock weather data (in real app, call a weather API)
  const weatherData: Record<string, any> = {
    dubai: { temp: 42, humidity: 35, condition: 'Sunny', wind: '15 km/h NW' },
    london: { temp: 18, humidity: 72, condition: 'Cloudy', wind: '20 km/h SW' },
    tokyo: { temp: 28, humidity: 65, condition: 'Partly Cloudy', wind: '10 km/h E' },
    mumbai: { temp: 33, humidity: 80, condition: 'Humid', wind: '12 km/h S' },
    newyork: { temp: 24, humidity: 55, condition: 'Clear', wind: '8 km/h NE' },
  };

  const data = weatherData[city.toLowerCase()] || {
    temp: Math.floor(Math.random() * 35) + 5,
    humidity: Math.floor(Math.random() * 60) + 30,
    condition: ['Sunny', 'Cloudy', 'Rainy', 'Windy'][Math.floor(Math.random() * 4)],
    wind: `${Math.floor(Math.random() * 30)} km/h`,
  };

  res.json({
    city: city.charAt(0).toUpperCase() + city.slice(1),
    ...data,
    unit: 'celsius',
    timestamp: new Date().toISOString(),
    payment: {
      txHash: x402?.txHash,
      paidBy: x402?.from,
      amount: '$0.01 USDC',
    },
  });
});

// ─── ENDPOINT 2: Text Summarization ($0.02 per call) ────────────────────────

app.post('/api/summarize', x402Paywall({
  apiKey: XYLO_API_KEY,
  priceUsd: 0.02,
  facilitatorUrl: FACILITATOR_URL,
  description: 'AI-powered text summarization',
}), (req, res) => {
  const { text } = req.body;
  const x402 = (req as any).x402;

  if (!text) {
    res.status(400).json({ error: 'Missing "text" field in request body' });
    return;
  }

  // Simple summarization (mock - in real app, call OpenAI or similar)
  const words = text.split(/\s+/);
  const summary = words.length > 20 
    ? words.slice(0, Math.ceil(words.length * 0.3)).join(' ') + '...'
    : text;

  res.json({
    original_length: text.length,
    summary_length: summary.length,
    summary,
    compression_ratio: `${Math.round((1 - summary.length / text.length) * 100)}%`,
    timestamp: new Date().toISOString(),
    payment: {
      txHash: x402?.txHash,
      paidBy: x402?.from,
      amount: '$0.02 USDC',
    },
  });
});

// ─── ENDPOINT 3: Crypto Price Feed ($0.005 per call) ────────────────────────

app.get('/api/crypto-price/:symbol', x402Paywall({
  apiKey: XYLO_API_KEY,
  priceUsd: 0.005,
  facilitatorUrl: FACILITATOR_URL,
  description: 'Real-time crypto price data',
}), (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const x402 = (req as any).x402;

  // Mock price data
  const prices: Record<string, any> = {
    BTC: { price: 67432.50, change24h: 2.3 },
    ETH: { price: 3521.80, change24h: -0.8 },
    ARC: { price: 1.25, change24h: 5.2 },
    USDC: { price: 1.00, change24h: 0.0 },
    SOL: { price: 142.60, change24h: 1.5 },
  };

  const data = prices[symbol] || {
    price: Math.random() * 100,
    change24h: (Math.random() - 0.5) * 10,
  };

  res.json({
    symbol,
    ...data,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    source: 'XyloNet Price Oracle',
    payment: {
      txHash: x402?.txHash,
      paidBy: x402?.from,
      amount: '$0.005 USDC',
    },
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Seller API Demo running on http://localhost:${PORT}`);
  console.log(`\n📡 Paywalled Endpoints:`);
  console.log(`   GET  /api/weather/:city       → $0.01 USDC`);
  console.log(`   POST /api/summarize           → $0.02 USDC`);
  console.log(`   GET  /api/crypto-price/:sym   → $0.005 USDC`);
  console.log(`\n🆓 Free Endpoints:`);
  console.log(`   GET  /health                  → Service info`);
  console.log(`\n💰 Payments settle via XyloFacilitator at ${FACILITATOR_URL}`);
  console.log(`   99% goes to you, 1% platform fee\n`);
});
