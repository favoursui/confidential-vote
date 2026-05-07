import { useWriteContract, useWaitForTransactionReceipt, useAccount, useWalletClient, usePublicClient } from "wagmi";
import { getFhevmClient, encryptBool } from "../lib/fhevm";
import { ABI, CONTRACT_ADDRESS } from "../lib/contract";
import toast from "react-hot-toast";

export function useCreateProposal() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function createProposal(title: string, description: string, durationSeconds: number) {
    const toastId = toast.loading("Creating proposal...");
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "createProposal",
        args: [title, description, BigInt(durationSeconds)],
      });
      toast.success("Proposal created!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.shortMessage || "Transaction failed", { id: toastId });
      throw e;
    }
  }

  return { createProposal, isPending: isPending || isConfirming, isSuccess };
}

export function useCastVote() {
  const { address } = useAccount();
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function castVote(proposalId: bigint, voteYes: boolean) {
    if (!address) throw new Error("No wallet connected");

    const toastId = toast.loading("Encrypting your vote...");
    try {
      const { encryptedValue, inputProof } = await encryptBool(voteYes, CONTRACT_ADDRESS, address);

      toast.loading("Submitting encrypted vote...", { id: toastId });

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "castVote",
        args: [proposalId, encryptedValue as `0x${string}`, inputProof],
      });

      toast.success(voteYes ? "✅ YES vote casted privately!" : "❌ NO vote casted privately!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.shortMessage || "Vote failed", { id: toastId });
      throw e;
    }
  }

  return { castVote, isPending: isPending || isConfirming, isSuccess };
}

export function useTallyVotes() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();

  async function tallyAndReveal(proposalId: bigint) {
    if (!address || !walletClient) throw new Error("No wallet connected");

    const toastId = toast.loading("Step 1/3: Submitting tally transaction...");
    try {
      // Step 1: grant decrypt permission on-chain
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "tallyVotes",
        args: [proposalId],
      });

      // Check if any votes were actually cast
      const hasVotes = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "hasVotesInit",
        args: [proposalId],
      }) as boolean;

      if (!hasVotes) {
        // No votes — just store 0/0
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: "setTallyResult",
          args: [proposalId, 0, 0],
        });
        toast.success("Tally complete — no votes were cast.", { id: toastId });
        return;
      }

      toast.loading("Step 2/3: Decrypting results (sign in MetaMask)...", { id: toastId });

      // Step 2: get raw bytes32 handles
      const [yesHandle, noHandle] = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "getEncryptedVoteHandles",
        args: [proposalId],
      }) as [`0x${string}`, `0x${string}`];

      // Step 3: decrypt via Zama Gateway
      const fhevm = await getFhevmClient();
      const transportKeypair = await fhevm.generateTransportKeypair();

      const signedPermit = await fhevm.signDecryptionPermit({
        contractAddresses: [CONTRACT_ADDRESS],
        startTimestamp: Math.floor(Date.now() / 1000),
        durationDays: 1,
        signerAddress: address,
        signer: walletClient as any,
        transportKeypair,
      });

      const results = await fhevm.decryptValues({
        encryptedValues: [yesHandle, noHandle],
        contractAddress: CONTRACT_ADDRESS,
        transportKeypair,
        signedPermit,
      });

      const finalYes = Number(results[0].value);
      const finalNo  = Number(results[1].value);

      toast.loading("Step 3/3: Storing results on-chain...", { id: toastId });

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "setTallyResult",
        args: [proposalId, finalYes, finalNo],
      });

      toast.success(`✅ Results: ${finalYes} YES / ${finalNo} NO`, { id: toastId });
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "Tally failed", { id: toastId });
      throw e;
    }
  }

  return { tallyAndReveal, isPending };
}