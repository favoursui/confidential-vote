import pkg from "hardhat";
const { ethers } = pkg as any;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ConfidentialVote with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const ConfidentialVote = await ethers.getContractFactory("ConfidentialVote");
  const contract = await ConfidentialVote.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ ConfidentialVote deployed to:", address);
  console.log("\nPaste this into your frontend .env:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
  console.log(`VITE_CHAIN_ID=11155111`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
