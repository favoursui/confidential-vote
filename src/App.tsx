import React, { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useProposalIds } from "./hooks/useProposals";
import { ProposalCard } from "./components/ProposalCard";
import { CreateProposalForm } from "./components/CreateProposalForm";

export default function App() {
  const { isConnected } = useAccount();
  const { data: ids, refetch } = useProposalIds();

  useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 10000);
  return () => clearInterval(interval);
}, [refetch]);

  const [tick, setTick] = useState(0);

  function refresh() {
    refetch();
    setTick((t) => t + 1);
  }

  return (
    <div className="app">
      {/* Background */}
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🔐</span>
            <div>
              <div className="logo-title">ConfidentialVote</div>
              <div className="logo-sub">Powered by Zama FHE</div>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">Fully Homomorphic Encryption</div>
        <h1 className="hero-title">
          Private Voting.<br />
          <span className="hero-accent">On-Chain.</span>
        </h1>
        <p className="hero-desc">
          Cast your vote as an encrypted ciphertext. No one, not the contract, 
          not validators, not other voters, can see how you voted until the final tally.
        </p>
        <div className="hero-features">
          <div className="feature">🔐 Vote stays encrypted on-chain</div>
          <div className="feature">🧮 Tally computed over ciphertexts</div>
          <div className="feature">📡 Decrypted only at reveal</div>
        </div>
      </section>

      {/* Main */}
      <main className="main">
        <div className="proposals-header">
          <h2 className="section-title">
            Proposals
            {ids && <span className="count-badge">{ids.length}</span>}
          </h2>
          {isConnected && <CreateProposalForm onCreated={refresh} />}
        </div>

        {!isConnected && (
          <div className="connect-prompt">
            <div className="connect-icon">🔌</div>
            <div className="connect-text">Connect your wallet to vote or create proposals</div>
          </div>
        )}

        {isConnected && (!ids || ids.length === 0) && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div>No proposals yet. Create the first one!</div>
          </div>
        )}

        <div className="proposals-grid">
          {ids
            ?.slice()
            .reverse()
            .map((id) => (
              <ProposalCard key={id.toString()} id={id} onRefresh={refresh} />
            ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        Built with Zama Protocol · FHE on Ethereum Sepolia
      </footer>
    </div>
  );
}
