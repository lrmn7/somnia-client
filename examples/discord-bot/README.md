# Somnia Discord Bot Example

A Discord bot showing how to integrate `somnia-client` into a production-ready Discord application.

---

## Features Demonstrated

- 💰 **/balance `<address>`**: Queries native STT/SOMI balance and displays a branded `createWalletEmbed` with formatted balance and explorer link.
- 🔍 **/tx `<hash>`**: Fetches transaction receipts and displays `createTransactionEmbed` with status indicator, gas used, and explorer URL.
- 💸 **/transfer `<to> <amount>`**: Admin-only command sending native currency using `somnia.wallet.transfer` and returning a `createTransferEmbed`.
- ⚡ **/watch `<contract>`**: Establishes an off-chain WebSocket Reactivity subscription (`somnia.reactivity.subscribe`) to monitor contract events and post live alerts directly to the Discord channel.

---

## Setup & Running

### 1. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your Discord Bot credentials:
```env
DISCORD_BOT_TOKEN=your_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_dev_guild_id_here  # for immediate testing
SOMNIA_NETWORK=testnet
SOMNIA_PRIVATE_KEY=0x...                  # optional, for /transfer
```

### 2. Deploy Slash Commands

Register the slash commands with Discord:

```bash
npm run deploy
```

### 3. Start the Bot

```bash
npm start
```
