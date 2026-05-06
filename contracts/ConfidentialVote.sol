// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEbool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ConfidentialVote
/// @notice Private on-chain governance using FHE. Votes stay encrypted until tally.
contract ConfidentialVote is ZamaEthereumConfig {

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 startTime;
        uint256 endTime;
        euint32 yesVotes;
        euint32 noVotes;
        bool initialized;
        bool tallied;
        uint32 finalYes;
        uint32 finalNo;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) private proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, string title, address creator, uint256 endTime);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
    event VoteTallied(uint256 indexed proposalId, uint32 yesVotes, uint32 noVotes);

    error ProposalNotFound();
    error VotingNotActive();
    error AlreadyVoted();
    error VotingStillActive();
    error AlreadyTallied();
    error InvalidDuration();
    error NotCreator();
    error NotTallied();

    function createProposal(
        string calldata title,
        string calldata description,
        uint256 durationSeconds
    ) external returns (uint256 proposalId) {
        if (durationSeconds < 60 || durationSeconds > 30 days) revert InvalidDuration();
        proposalId = ++proposalCount;
        Proposal storage p = proposals[proposalId];
        p.id = proposalId;
        p.title = title;
        p.description = description;
        p.creator = msg.sender;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + durationSeconds;
        emit ProposalCreated(proposalId, title, msg.sender, p.endTime);
    }

    function castVote(
        uint256 proposalId,
        externalEbool encryptedVote,
        bytes calldata inputProof
    ) external {
        Proposal storage p = proposals[proposalId];
        if (p.id == 0) revert ProposalNotFound();
        if (block.timestamp < p.startTime || block.timestamp > p.endTime) revert VotingNotActive();
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted();

        hasVoted[proposalId][msg.sender] = true;

        ebool vote = FHE.fromExternal(encryptedVote, inputProof);
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);
        euint32 yesInc = FHE.select(vote, one, zero);
        euint32 noInc  = FHE.select(vote, zero, one);

        if (!p.initialized) {
            p.yesVotes = yesInc;
            p.noVotes  = noInc;
            p.initialized = true;
        } else {
            p.yesVotes = FHE.add(p.yesVotes, yesInc);
            p.noVotes  = FHE.add(p.noVotes,  noInc);
        }

        FHE.allowThis(p.yesVotes);
        FHE.allowThis(p.noVotes);

        emit VoteCast(proposalId, msg.sender);
    }

    function tallyVotes(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        if (p.id == 0) revert ProposalNotFound();
        if (block.timestamp <= p.endTime) revert VotingStillActive();
        if (p.tallied) revert AlreadyTallied();

        p.tallied = true;

        if (p.initialized) {
            FHE.allow(p.yesVotes, msg.sender);
            FHE.allow(p.noVotes,  msg.sender);
        }

        emit VoteTallied(proposalId, 0, 0);
    }

    function setTallyResult(uint256 proposalId, uint32 yes, uint32 no) external {
        Proposal storage p = proposals[proposalId];
        if (p.id == 0) revert ProposalNotFound();
        if (!p.tallied) revert NotTallied();
        if (msg.sender != p.creator) revert NotCreator();
        p.finalYes = yes;
        p.finalNo  = no;
        emit VoteTallied(proposalId, yes, no);
    }

    function getProposal(uint256 proposalId) external view returns (
        uint256 id, string memory title, string memory description,
        address creator, uint256 startTime, uint256 endTime,
        bool tallied, uint32 finalYes, uint32 finalNo
    ) {
        Proposal storage p = proposals[proposalId];
        if (p.id == 0) revert ProposalNotFound();
        return (p.id, p.title, p.description, p.creator, p.startTime, p.endTime, p.tallied, p.finalYes, p.finalNo);
    }

    /// @notice Returns raw bytes32 handles for off-chain decryption via Zama Gateway
    function getEncryptedVoteHandles(uint256 proposalId) external view returns (
        bytes32 yesHandle,
        bytes32 noHandle
    ) {
        Proposal storage p = proposals[proposalId];
        if (p.id == 0) revert ProposalNotFound();
        return (euint32.unwrap(p.yesVotes), euint32.unwrap(p.noVotes));
    }

    function hasVotesInit(uint256 proposalId) external view returns (bool) {
        return proposals[proposalId].initialized;
    }

    function getAllProposalIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](proposalCount);
        for (uint256 i = 0; i < proposalCount; i++) ids[i] = i + 1;
        return ids;
    }
}