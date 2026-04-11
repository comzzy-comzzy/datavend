require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { paymentMiddleware, x402ResourceServer } = require('@x402/express');
const { ExactStellarScheme } = require('@x402/stellar/exact/server');
const { HTTPFacilitatorClient } = require('@x402/core/server');

const app = express();
app.use(cors());
app.use('/freighter.js', express.static('/root/datavend/frontend/freighter.js'));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Setup x402 facilitator
const facilitatorClient = new HTTPFacilitatorClient({
  url: 'https://channels.openzeppelin.com/x402',
  createAuthHeaders: async () => {
    const headers = { Authorization: `Bearer ${process.env.OPENZEPPELIN_API_KEY}` };
    return { verify: headers, settle: headers, supported: headers };
  },
});

const resourceServer = new x402ResourceServer(facilitatorClient).register(
  'stellar:pubnet',
  new ExactStellarScheme()
);

// x402 payment middleware - only on /data routes
app.use(
  paymentMiddleware(
    {
      'GET /data/wallet/:address': {
        accepts: [
          {
            scheme: 'exact',
            price: '$0.01',
            network: 'stellar:pubnet',
            payTo: process.env.STELLAR_PUBLIC_KEY,
          },
        ],
        description: 'AI-powered Stellar wallet analysis',
        mimeType: 'application/json',
      },
    },
    resourceServer
  )
);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'DataVend agent is running' });
});

// Shared wallet fetch function
async function fetchWalletData(address) {
  const response = await axios.get(
    `https://horizon.stellar.org/accounts/${address}`
  );
  const account = response.data;
  const balances = account.balances.map(b => ({
    asset: b.asset_type === 'native' ? 'XLM' : b.asset_code,
    balance: b.balance,
  }));

  const claudeResponse = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are DataVend, an AI agent that analyzes Stellar blockchain wallet data. Here is wallet data for ${address}: ${JSON.stringify(balances)}. Give a short, clear summary of this wallet. Mention total assets, notable balances, and any observations. Keep it under 100 words.`,
        },
      ],
    },
    {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    }
  );

  return {
    address,
    balances,
    sequence: account.sequence,
    last_modified_ledger: account.last_modified_ledger,
    ai_summary: claudeResponse.data.content[0].text,
  };
}

// FREE demo endpoint - no payment required
app.get('/demo/wallet/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const data = await fetchWalletData(address);
    res.json({ ...data, demo: true });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(400).json({ error: 'Wallet not found or invalid address' });
  }
});

// PAID endpoint - requires x402 payment
app.get('/data/wallet/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const data = await fetchWalletData(address);
    res.json({ ...data, demo: false });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(400).json({ error: 'Wallet not found or invalid address' });
  }
});

app.listen(PORT, () => {
  console.log(`DataVend running on port ${PORT}`);
});
