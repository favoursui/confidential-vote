import {
  setFhevmRuntimeConfig,
  initFhevmRuntime,
  createFhevmClient,
} from "@fhevm/sdk/viem";
import { encryptValue } from "@fhevm/sdk/actions/encrypt";
import { sepolia } from "@fhevm/sdk/chains";
import { createPublicClient, http } from "viem";
import { sepolia as viemSepolia } from "wagmi/chains";

let initialized = false;
let fhevmClient: Awaited<ReturnType<typeof createFhevmClient>> | null = null;

async function init() {
  if (initialized) return;
  setFhevmRuntimeConfig({ singleThread: true });
  await initFhevmRuntime();
  initialized = true;
}

export async function getFhevmClient() {
  await init();
  if (fhevmClient) return fhevmClient;

  const publicClient = createPublicClient({
    chain: viemSepolia,
    transport: http(),
  });

  fhevmClient = createFhevmClient({
    publicClient,
    chain: sepolia,
  });

  return fhevmClient;
}

export async function encryptBool(
  value: boolean,
  contractAddress: string,
  userAddress: string
): Promise<{ encryptedValue: `0x${string}`; inputProof: `0x${string}` }> {
  const client = await getFhevmClient();

  const result = await encryptValue(client, {
    value: { type: "bool", value },
    contractAddress,
    userAddress,
  });

  return {
    encryptedValue: result.encryptedValue as `0x${string}`,
    inputProof: result.inputProof as `0x${string}`,
  };
}

export function resetFhevmClient() {
  fhevmClient = null;
  initialized = false;
}