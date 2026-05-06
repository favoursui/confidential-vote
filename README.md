# 🔐 ConfidentialVote

**Private on-chain governance using Fully Homomorphic Encryption (FHE) on the Zama Protocol.**

ConfidentialVote lets anyone create proposals and cast votes that are **fully encrypted on-chain**. No one — not validators, not the contract itself, not other voters — can see how you voted. Only the final aggregated tally is revealed, after the voting period ends.

> Built for the **Zama Developer Program Mainnet Season 2 — Builder Track**

---

## 🧠 How It Works

Traditional on-chain voting stores votes as plaintext — anyone can see how you voted in real time. This creates **vote manipulation**, **voter coercion**, and **bandwagon effects**.

ConfidentialVote solves this using **FHE (Fully Homomorphic Encryption)**:

1. **You vote** → Your YES/NO is encrypted client-side using `@fhevm/sdk` before it ever leaves your browser
2. **Contract receives a ciphertext** → The Zama FHEVM contract stores `euint32` encrypted counters and adds to them without ever seeing plaintext
3. **Voting ends** → The creator calls `tallyVotes()`, granting decryption permission to the Zama Gateway
4. **Results revealed** → Aggregated totals are decrypted and stored — individual votes remain permanently private

```
Voter                   Contract (FHEVM)           Zama Gateway
  │                           │                          │
  │── encrypt(true) ─────────>│                          │
  │   [ciphertext, proof]     │                          │
  │                           │── FHE.add(yes, enc) ─>   │ (stays encrypted)
  │                           │                          │
  │                     (voting ends)                    │
  │                           │                          │
  │                           │── requestDecrypt() ─────>│
  │                           │<─ [totalYes, totalNo] ───│
  │                           │                          │
  │<── getProposal() ─────────│ finalYes=42, finalNo=18  │
```

---

## 📁 Project Structure

```
confidential-vote/
├── contracts/
│   └── ConfidentialVote.sol     # FHE smart contract
├── scripts/
│   └── deploy.ts                # Hardhat deployment script
├── src/
│   ├── components/
│   │   ├── ProposalCard.tsx     # Proposal UI with voting
│   │   └── CreateProposalForm.tsx
│   ├── hooks/
│   │   ├── useProposals.ts      # Read proposals from chain
│   │   └── useVoteActions.ts    # Write: vote, create, tally
│   ├── lib/
│   │   ├── contract.ts          # ABI + contract address
│   │   ├── fhevm.ts             # FHEVM SDK instance
│   │   └── wagmi.ts             # Wallet config (Sepolia)
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── hardhat.config.ts
├── vite.config.ts
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- pnpm (`npm install -g pnpm`)
- MetaMask with Sepolia ETH ([faucet](https://sepoliafaucet.com))
- Infura API key ([infura.io](https://infura.io))

### 1. Install dependencies

```bash
# Contract dependencies
npm install

# Frontend dependencies
cd src && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in:
- `MNEMONIC` — your wallet seed phrase
- `INFURA_API_KEY` — from infura.io
- `VITE_WALLETCONNECT_PROJECT_ID` — from cloud.walletconnect.com (free)

### 3. Deploy the contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

Copy the deployed address into your `.env`:
```
VITE_CONTRACT_ADDRESS=0xYourDeployedAddress
```

### 4. Start the frontend

```bash
cd src
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🗳️ Using the App

1. **Connect MetaMask** (must be on Sepolia)
2. **Create a Proposal** — set title, description, voting duration
3. **Cast a Vote** — click YES or NO; your vote is encrypted before sending
4. **Reveal Results** — after voting ends, the proposal creator clicks "Reveal Results" to tally

---

## 🔐 FHE Key Concepts Used

| Concept | What it does in this project |
|---|---|
| `euint32` | Encrypted integer type for vote counters |
| `ebool` | Encrypted boolean for the raw vote |
| `FHE.fromExternal()` | Converts user's encrypted input + proof into contract-usable ciphertext |
| `FHE.select()` | Branchless conditional on ciphertexts — adds to yes or no count without decryption |
| `FHE.add()` | Adds encrypted values without seeing them |
| `FHE.allowThis()` | Grants the contract permission to use updated ciphertexts |
| `FHE.allow()` | Grants a user permission to decrypt a specific handle |

---

## 🛠️ Tech Stack

- **Smart Contracts**: Solidity 0.8.24 + `@fhevm/solidity`
- **Deployment**: Hardhat + `@fhevm/hardhat-plugin`
- **Frontend**: React 18 + Vite + TypeScript
- **Wallet**: RainbowKit + wagmi + viem
- **FHE SDK**: `@fhevm/sdk`
- **Network**: Ethereum Sepolia Testnet (Zama Gateway)

---

## 📜 License

BSD-3-Clause-Clear
