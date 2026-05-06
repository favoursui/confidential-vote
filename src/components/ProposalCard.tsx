import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useProposal, useHasVoted } from "../hooks/useProposals";
import { useCastVote, useTallyVotes } from "../hooks/useVoteActions";
import toast from "react-hot-toast";

interface Props {
  id: bigint;
  onRefresh: () => void;
}

export function ProposalCard({ id, onRefresh }: Props) {
  const { address } = useAccount();
  const { data: proposal, refetch } = useProposal(id);
  const { data: voted, refetch: refetchVoted } = useHasVoted(id, address);
  const { castVote, isPending: isVoting } = useCastVote();
  const { tallyAndReveal, isPending: isTallying } = useTallyVotes();
  const [expanded, setExpanded] = useState(false);

  if (!proposal) return null;

  const now = BigInt(Math.floor(Date.now() / 1000));
  const isActive = now >= proposal.startTime && now <= proposal.endTime;
  const isEnded = now > proposal.endTime;
  const endDate = new Date(Number(proposal.endTime) * 1000);
  const totalVotes = proposal.finalYes + proposal.finalNo;

  async function handleVote(yes: boolean) {
    await castVote(id, yes);
    await refetch();
    await refetchVoted();
    onRefresh();
    toast.success(yes ? "✅ YES vote cast privately!" : "❌ NO vote cast privately!");
  }

  async function handleTally() {
    await tallyAndReveal(id);
    await refetch();
    onRefresh();
  }

  const statusColor = proposal.tallied
    ? "text-emerald-400"
    : isActive
    ? "text-violet-400"
    : "text-amber-400";

  const statusLabel = proposal.tallied
    ? "Tallied"
    : isActive
    ? "Active"
    : "Ended";

  return (
    <div className="card" onClick={() => setExpanded(!expanded)}>
      {/* Header */}
      <div className="card-header">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`status-dot ${isActive ? "active" : proposal.tallied ? "tallied" : "ended"}`} />
              <span className={`text-xs font-semibold tracking-wider uppercase ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            <h3 className="proposal-title">{proposal.title}</h3>
          </div>
          <span className="proposal-id">#{id.toString()}</span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="card-body" onClick={(e) => e.stopPropagation()}>
          <p className="description">{proposal.description}</p>

          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Creator</span>
              <span className="meta-value mono">
                {proposal.creator.slice(0, 6)}…{proposal.creator.slice(-4)}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">{isEnded ? "Ended" : "Ends"}</span>
              <span className="meta-value">{endDate.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Tally results */}
          {proposal.tallied && totalVotes > 0 && (
            <div className="results">
              <div className="results-label">Final Results</div>
              <div className="vote-bars">
                <div className="vote-row">
                  <span className="vote-label yes">YES</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill yes"
                      style={{ width: `${(proposal.finalYes / totalVotes) * 100}%` }}
                    />
                  </div>
                  <span className="vote-count">{proposal.finalYes}</span>
                </div>
                <div className="vote-row">
                  <span className="vote-label no">NO</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill no"
                      style={{ width: `${(proposal.finalNo / totalVotes) * 100}%` }}
                    />
                  </div>
                  <span className="vote-count">{proposal.finalNo}</span>
                </div>
              </div>
              <div className="total-votes">{totalVotes} total votes</div>
            </div>
          )}

          {proposal.tallied && totalVotes === 0 && (
            <div className="results empty">No votes were cast.</div>
          )}

          {/* Actions */}
          {address && isActive && !voted && (
            <div className="vote-actions">
              <p className="vote-hint">
                🔐 Your vote is <strong>fully encrypted</strong> — no one can see it until tally.
              </p>
              <div className="vote-buttons">
                <button
                  className="btn btn-yes"
                  disabled={isVoting}
                  onClick={() => handleVote(true)}
                >
                  {isVoting ? "Encrypting…" : "✅ Vote YES"}
                </button>
                <button
                  className="btn btn-no"
                  disabled={isVoting}
                  onClick={() => handleVote(false)}
                >
                  {isVoting ? "Encrypting…" : "❌ Vote NO"}
                </button>
              </div>
            </div>
          )}

          {voted && isActive && (
            <div className="voted-badge">🔒 You already voted — privately!</div>
          )}

          {isEnded && !proposal.tallied && address === proposal.creator && (
            <button
              className="btn btn-tally"
              disabled={isTallying}
              onClick={handleTally}
            >
              {isTallying ? "Tallying…" : "📊 Reveal Results"}
            </button>
          )}

          {isEnded && !proposal.tallied && address !== proposal.creator && (
            <div className="tally-pending">Waiting for creator to reveal results…</div>
          )}
        </div>
      )}
    </div>
  );
}
