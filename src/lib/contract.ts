export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111);

export const ABI = [
  {
    name: "createProposal",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "durationSeconds", type: "uint256" },
    ],
    outputs: [{ name: "proposalId", type: "uint256" }],
  },
  {
    name: "castVote",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "encryptedVote", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "tallyVotes",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "setTallyResult",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "yes", type: "uint32" },
      { name: "no", type: "uint32" },
    ],
    outputs: [],
  },
  {
    name: "getProposal",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "creator", type: "address" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "tallied", type: "bool" },
      { name: "finalYes", type: "uint32" },
      { name: "finalNo", type: "uint32" },
    ],
  },
  {
    name: "getEncryptedVoteHandles",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      { name: "yesHandle", type: "bytes32" },
      { name: "noHandle", type: "bytes32" },
    ],
  },
  {
    name: "hasVotesInit",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getAllProposalIds",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "hasVoted",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "proposalCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "ProposalCreated",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "title", type: "string" },
      { name: "creator", type: "address" },
      { name: "endTime", type: "uint256" },
    ],
  },
  {
    name: "VoteCast",
    type: "event",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "voter", type: "address", indexed: true },
    ],
  },
  {
    name: "VoteTallied",
    type: "event",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "yesVotes", type: "uint32" },
      { name: "noVotes", type: "uint32" },
    ],
  },
] as const;