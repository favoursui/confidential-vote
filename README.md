# 🔐 ConfidentialVote

**Fully private on-chain governance using Fully Homomorphic Encryption (FHE) on the Zama Protocol.**

ConfidentialVote lets anyone create proposals and cast votes that are **completely encrypted on-chain**. No one, not validators, not the contract, not other voters, can see how you voted. Only the final aggregated tally is revealed after the voting period ends.

> Built for the **Zama Developer Program Mainnet Season 2 - Builder Track**

---

## 🧠 The Problem

Traditional on-chain voting stores votes as plaintext. Anyone watching Etherscan or the mempool can see exactly how every wallet voted in real time. This creates:

- **Voter coercion** - people can be pressured based on their visible votes
- **Bandwagon effects** - seeing the current tally influences how others vote
- **Vote manipulation** - bad actors can game outcomes before polls close

ConfidentialVote solves this with **FHE (Fully Homomorphic Encryption)**, the only cryptographic technique that allows computation directly on encrypted data without ever decrypting it.

---

## How It Works

```
Voter                   Contract (FHEVM)           Zama Gateway
  │                           │                          │
  │── encrypt(true/false) ───>│                          │
  │   [ciphertext + proof]    │                          │
  │                           │── FHE.add(yes, enc) ──>  │  (stays encrypted)
  │                           │                          │
  │                     (voting ends)                    │
  │                           │                          │
  │                           │── FHE.allow(caller) ───> │
  │                           │── signDecryptionPermit ─>│
  │                           │<── [totalYes, totalNo] ──│
  │                           │                          │
  │<── getProposal() ─────────│  finalYes=X, finalNo=Y   │
```

1. **Create a proposal** - set a title, description and voting duration
2. **Cast an encrypted vote** - your YES/NO is encrypted client-side using `@fhevm/sdk` before it leaves your browser. The contract receives a ciphertext, never plaintext
3. **Votes accumulate encrypted** - the contract uses `FHE.select` and `FHE.add` to tally votes over ciphertexts with zero decryption
4. **Voting ends** - the proposal creator calls `tallyVotes()`, granting decrypt permission on-chain
5. **Decrypt via Zama Gateway** - an EIP-712 permit is signed, the Gateway decrypts only the aggregated totals
6. **Results stored on-chain** - plaintext totals are written back for public verification. Individual votes remain permanently private

---

## 🔐 FHE Concepts Used

| Concept | Usage |
|---|---|
| `euint32` | Encrypted integer type for vote counters |
| `ebool` | Encrypted boolean for the raw vote |
| `externalEbool` | Accepts encrypted input from the user with a ZK proof |
| `FHE.fromExternal()` | Converts user's encrypted input + proof into a usable ciphertext |
| `FHE.select()` | Branchless conditional - routes vote to yes or no counter without decryption |
| `FHE.add()` | Adds encrypted values without seeing them |
| `FHE.allowThis()` | Grants the contract permission to use updated ciphertexts |
| `FHE.allow()` | Grants a specific address permission to decrypt a handle |
| `ZamaEthereumConfig` | Configures the FHE coprocessor for Ethereum/Sepolia |

---

## 📁 Project Structure

```
confidential-vote/
├── contracts/
│   └── ConfidentialVote.sol      # FHE smart contract
├── scripts/
│   └── deploy.ts                 # Hardhat deployment script
├── src/
│   ├── components/
│   │   ├── ProposalCard.tsx      # Proposal UI with voting + tally
│   │   └── CreateProposalForm.tsx
│   ├── hooks/
│   │   ├── useProposals.ts       # Read proposals from chain
│   │   └── useVoteActions.ts     # Write: create, vote, tally + decrypt
│   ├── lib/
│   │   ├── contract.ts           # ABI + contract address
│   │   ├── fhevm.ts              # FHEVM SDK initialization
│   │   └── wagmi.ts              # Wallet config
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── hardhat.config.ts
├── vite.config.ts
├── index.html
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MetaMask with Sepolia ETH ([faucet](https://sepoliafaucet.com))
- Infura API key ([infura.io](https://infura.io))
- WalletConnect Project ID ([cloud.walletconnect.com](https://cloud.walletconnect.com))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:
```env
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_CHAIN_ID=11155111
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
MNEMONIC="your twelve word seed phrase"
INFURA_API_KEY=your_infura_key
```

### 3. Compile and deploy

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

Copy the deployed address into `.env` as `VITE_CONTRACT_ADDRESS`.

### 4. Start the frontend

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🗳️ Using the App

1. **Connect MetaMask** (must be on Sepolia testnet)
2. **Create a Proposal** - set title, description, and voting duration
3. **Cast a Vote** - click YES or NO. Your vote is encrypted in the browser before being sent on-chain
4. **Reveal Results** - after voting ends, the proposal creator clicks "Reveal Results". MetaMask will ask for a signature to authorize decryption via the Zama Gateway. Results appear within seconds

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.24 + `@fhevm/solidity` |
| Deployment | Hardhat + `@fhevm/hardhat-plugin` |
| Frontend | React 18 + Vite + TypeScript |
| Wallet | RainbowKit + wagmi + viem |
| FHE SDK | `@fhevm/sdk` (viem adapter) |
| Network | Ethereum Sepolia Testnet |
| Gateway | Zama Decryption Gateway |

---

## 📜 License

BSD-3-Clause-Clear