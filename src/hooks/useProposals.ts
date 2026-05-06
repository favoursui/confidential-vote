import { useReadContract, useReadContracts } from "wagmi";
import { ABI, CONTRACT_ADDRESS } from "../lib/contract";

export type Proposal = {
  id: bigint;
  title: string;
  description: string;
  creator: `0x${string}`;
  startTime: bigint;
  endTime: bigint;
  tallied: boolean;
  finalYes: number;
  finalNo: number;
};

export function useProposalIds() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllProposalIds",
  });
}

export function useProposal(id: bigint) {
  const { data, ...rest } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getProposal",
    args: [id],
    query: { enabled: id > 0n },
  });

  const proposal: Proposal | undefined = data
    ? {
        id: data[0],
        title: data[1],
        description: data[2],
        creator: data[3],
        startTime: data[4],
        endTime: data[5],
        tallied: data[6],
        finalYes: data[7],
        finalNo: data[8],
      }
    : undefined;

  return { data: proposal, ...rest };
}

export function useHasVoted(proposalId: bigint, voter?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "hasVoted",
    args: [proposalId, voter!],
    query: { enabled: !!voter && proposalId > 0n },
  });
}

export function useProposalCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "proposalCount",
  });
}
