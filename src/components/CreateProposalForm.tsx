import React, { useState } from "react";
import { useCreateProposal } from "../hooks/useVoteActions";
import toast from "react-hot-toast";

interface Props {
  onCreated: () => void;
}

const DURATION_OPTIONS = [
  { label: "10 minutes", value: 600 },
  { label: "1 hour", value: 3600 },
  { label: "24 hours", value: 86400 },
  { label: "3 days", value: 259200 },
  { label: "7 days", value: 604800 },
];

export function CreateProposalForm({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(3600);
  const [open, setOpen] = useState(false);
  const { createProposal, isPending } = useCreateProposal();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createProposal(title.trim(), description.trim(), duration);
      toast.success("Proposal created!");
      setTitle("");
      setDescription("");
      setOpen(false);
      onCreated();
    } catch {}
  }

  if (!open) {
    return (
      <button className="btn btn-create" onClick={() => setOpen(true)}>
        + New Proposal
      </button>
    );
  }

  return (
    <div className="form-overlay" onClick={() => setOpen(false)}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>Create Proposal</h2>
          <button className="close-btn" onClick={() => setOpen(false)}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="proposal-form">
          <div className="field">
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. Should we add a treasury fee?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="Describe the proposal in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>
          <div className="field">
            <label>Voting Duration</label>
            <div className="duration-options">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`duration-btn ${duration === opt.value ? "selected" : ""}`}
                  onClick={() => setDuration(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-submit" disabled={isPending}>
            {isPending ? "Submitting…" : "Deploy Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
}
