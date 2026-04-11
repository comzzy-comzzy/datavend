# DataVend — AI-Powered Stellar Data Agent

> An autonomous AI agent that sells on-chain Stellar wallet data per query using the x402 payment protocol on Stellar mainnet.

Live at: https://datavend.tech
Frontend: https://datavend-three.vercel.app

---

## What is DataVend?

DataVend is a pay-per-query AI agent built on Stellar. Anyone can query any Stellar wallet address and receive an AI-powered analysis — token balances, transaction history, portfolio breakdown, and a Claude AI summary — all in one HTTP request.

Payments are handled autonomously via the x402 protocol on Stellar. No accounts, no subscriptions, no API keys. The payment IS the credential.

---

## How it works

1. User enters a Stellar wallet address
2. Frontend calls the DataVend API at `https://datavend.tech`
3. Backend responds with `HTTP 402 Payment Required` + payment instructions
4. User signs a $0.01 USDC payment via Freighter wallet (x402 on Stellar)
5. Backend verifies payment via OpenZeppelin facilitator on Stellar mainnet
6. Claude AI analyzes the wallet data and returns insights
7. User receives full analysis — balances, transactions, chart, AI summary

---

## Features

- **x402 Payment Gate** — every API call requires a $0.01 USDC micropayment on Stellar
- **AI Wallet Analysis** — Claude AI summarizes wallet holdings and activity
- **Token Balances** — full breakdown of all assets in the wallet
- **Transaction History** — recent operations fetched from Stellar Horizon
- **Portfolio Chart** — donut chart showing asset distribution
- **Demo Mode** — free preview for users to try before paying
- **Light/Dark Theme** — toggle between themes
- **Freighter Integration** — connect Stellar wallet for x402 payments

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Payment Protocol | x402 on Stellar (via @x402/express + @x402/stellar) |
| Payment Facilitator | OpenZeppelin Built on Stellar Facilitator |
| Blockchain | Stellar Mainnet |
| AI | Claude AI (claude-sonnet-4-20250514) |
| Blockchain Data | Stellar Horizon API |
| Frontend | HTML + CSS + Vanilla JS |
| Deployment | VPS (Contabo) + Vercel |
| SSL | Let's Encrypt via Certbot + Nginx |

---

## API Endpoints

### Health Check
GET https://datavend.tech/
Returns: `{ "status": "DataVend agent is running" }`

### Paid Wallet Analysis (x402 Required)
GET https://datavend.tech/data/wallet/:address
- Requires x402 payment of $0.01 USDC on Stellar mainnet
- Returns 402 Payment Required with payment instructions if unpaid
- Returns full wallet analysis + AI summary if paid

### Demo Wallet Analysis (Free)
GET https://datavend.tech/demo/wallet/:address
- Free endpoint for demo/testing
- Returns full wallet analysis + AI summary
- No payment required

---

## x402 Payment Flow
Client → GET /data/wallet/:address
Server → 402 Payment Required + PAYMENT-REQUIRED header
Client → Signs USDC payment via Freighter (Soroban auth entry)
Client → GET /data/wallet/:address + X-PAYMENT header
Server → Verifies via OpenZeppelin facilitator
Server → Returns wallet data + AI analysis

---

## Running Locally

### Prerequisites
- Node.js 18+
- Stellar wallet with USDC on mainnet
- Anthropic API key
- OpenZeppelin facilitator API key

### Setup

```bash
git clone https://github.com/comzzy-comzzy/datavend.git
cd datavend
npm install
```

Create `.env` file:
PORT=3000
STELLAR_SECRET_KEY=your_stellar_secret_key
STELLAR_PUBLIC_KEY=your_stellar_public_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENZEPPELIN_API_KEY=your_openzeppelin_api_key

Start the server:
```bash
node index.js
```

Open `frontend/index.html` in your browser.

---

## Hackathon Submission

- **Competition:** Stellar Hacks: Agents — DoraHacks
- **Track:** AI Agents on Stellar with x402 + Stripe MPP
- **Builder:** [@kane_120](https://x.com/kane_120)
- **GitHub:** https://github.com/comzzy-comzzy/datavend
- **Live Demo:** https://datavend-three.vercel.app

---

## Why Stellar for x402?

- **~5 second settlement** — fast enough for synchronous HTTP requests
- **$0.00001 fees** — micropayments are economically viable
- **Native USDC** — first-class stablecoin, not bridged
- **99.99% uptime** — reliable for autonomous agents running 24/7
- **Soroban smart contracts** — programmable payment policies

---

Built with ❤️ by [@kane_120](https://x.com/kane_120) on Stellar
