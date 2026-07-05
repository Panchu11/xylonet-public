import { createXyloClient } from '@xylofacilitator/sdk';
import { privateKeyToAccount } from 'viem/accounts';
import OpenAI from 'openai';
import type { Account } from 'viem';

export interface AgentConfig {
  account: Account;
  openaiKey: string;
  facilitatorUrl: string;
  sellerApiUrl: string;
}

// Available tools the agent can use
const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather data for a city. Costs $0.01 USDC per call via x402 payment.',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name (e.g., dubai, london, tokyo)' }
        },
        required: ['city']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'summarize_text',
      description: 'Summarize a text passage. Costs $0.02 USDC per call via x402 payment.',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The text to summarize' }
        },
        required: ['text']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_crypto_price',
      description: 'Get current price of a cryptocurrency. Costs $0.005 USDC per call via x402 payment.',
      parameters: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Crypto symbol (e.g., BTC, ETH, ARC, SOL)' }
        },
        required: ['symbol']
      }
    }
  }
];

export class XyloAgent {
  private xyloClient;
  private openai: OpenAI;
  private sellerApiUrl: string;
  private messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  constructor(config: AgentConfig) {
    this.xyloClient = createXyloClient({
      account: config.account,
      facilitatorUrl: config.facilitatorUrl,
      autoFund: true,
    });

    this.openai = new OpenAI({ apiKey: config.openaiKey });
    this.sellerApiUrl = config.sellerApiUrl.replace(/\/$/, '');

    // System prompt
    this.messages = [{
      role: 'system',
      content: `You are an AI agent with a crypto wallet on Arc Network. You can pay for API services using USDC via the x402 protocol. When users ask questions that require data, use the available tools to fetch paid data. Each API call costs a small amount of USDC which is automatically paid from your wallet. Be helpful and concise in your responses. Always mention how much the data cost when you use a paid API.`
    }];
  }

  get address() {
    return this.xyloClient.address;
  }

  async chat(userMessage: string): Promise<string> {
    this.messages.push({ role: 'user', content: userMessage });

    // Initial completion with tools
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: this.messages,
      tools: TOOLS,
      tool_choice: 'auto',
    });

    let assistantMessage = response.choices[0].message;
    this.messages.push(assistantMessage);

    // Handle tool calls
    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      for (const toolCall of assistantMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        let result: string;

        try {
          switch (toolCall.function.name) {
            case 'get_weather':
              result = await this.callWeatherApi(args.city);
              break;
            case 'summarize_text':
              result = await this.callSummarizeApi(args.text);
              break;
            case 'get_crypto_price':
              result = await this.callCryptoPriceApi(args.symbol);
              break;
            default:
              result = JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` });
          }
        } catch (error: any) {
          result = JSON.stringify({ error: error.message });
        }

        this.messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      // Get next response after tool results
      const followUp = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: this.messages,
        tools: TOOLS,
        tool_choice: 'auto',
      });

      assistantMessage = followUp.choices[0].message;
      this.messages.push(assistantMessage);
    }

    return assistantMessage.content || '(No response)';
  }

  private async callWeatherApi(city: string): Promise<string> {
    console.log(`   💳 Paying $0.01 USDC for weather data (${city})...`);
    const response = await this.xyloClient.fetch(`${this.sellerApiUrl}/api/weather/${city}`);
    const data = await response.json();
    
    if (response.status !== 200) {
      throw new Error(`Weather API error: ${JSON.stringify(data)}`);
    }
    
    const receipt = response.headers.get('x-payment-receipt');
    if (receipt) {
      console.log(`   ✅ Paid! TX: ${receipt.slice(0, 18)}...`);
    }
    
    return JSON.stringify(data);
  }

  private async callSummarizeApi(text: string): Promise<string> {
    console.log(`   💳 Paying $0.02 USDC for text summarization...`);
    const response = await this.xyloClient.fetch(`${this.sellerApiUrl}/api/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    
    if (response.status !== 200) {
      throw new Error(`Summarize API error: ${JSON.stringify(data)}`);
    }
    
    const receipt = response.headers.get('x-payment-receipt');
    if (receipt) {
      console.log(`   ✅ Paid! TX: ${receipt.slice(0, 18)}...`);
    }
    
    return JSON.stringify(data);
  }

  private async callCryptoPriceApi(symbol: string): Promise<string> {
    console.log(`   💳 Paying $0.005 USDC for price data (${symbol})...`);
    const response = await this.xyloClient.fetch(`${this.sellerApiUrl}/api/crypto-price/${symbol}`);
    const data = await response.json();
    
    if (response.status !== 200) {
      throw new Error(`Price API error: ${JSON.stringify(data)}`);
    }
    
    const receipt = response.headers.get('x-payment-receipt');
    if (receipt) {
      console.log(`   ✅ Paid! TX: ${receipt.slice(0, 18)}...`);
    }
    
    return JSON.stringify(data);
  }

  /** Reset conversation history */
  reset() {
    this.messages = [this.messages[0]]; // Keep system prompt
  }
}
