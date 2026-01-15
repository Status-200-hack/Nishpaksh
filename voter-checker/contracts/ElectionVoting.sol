// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ElectionVoting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // Track votes by EPIC number hash (not wallet address)
    mapping(uint256 => bool) public hasVotedByEpic;
    mapping(uint256 => Candidate) public candidates;

    event VoteCasted(address indexed voter, uint256 epicHash, uint256 candidateId, uint256 wardId);

    /// @dev Optional helper to pre-register candidates (not required for vote()).
    /// You can call this later, or ignore it and just emit votes.
    function setCandidate(uint256 _candidateId, string calldata _name) external {
        candidates[_candidateId] = Candidate({id: _candidateId, name: _name, voteCount: candidates[_candidateId].voteCount});
    }

    /// @dev Vote function - checks EPIC number hash instead of wallet address
    /// @param _epicHash Hash of the EPIC number (to ensure one vote per EPIC)
    /// @param _candidateId ID of the candidate being voted for
    /// @param _wardId Ward number where the vote is being cast
    function vote(uint256 _epicHash, uint256 _candidateId, uint256 _wardId) external {
        require(!hasVotedByEpic[_epicHash], "This EPIC number has already voted");
        require(_candidateId != 0, "Invalid candidate");
        require(_epicHash != 0, "Invalid EPIC hash");

        // If candidate wasn't set, still allow voting but keep name empty.
        Candidate storage c = candidates[_candidateId];
        if (c.id == 0) {
            c.id = _candidateId;
        }
        c.voteCount += 1;

        hasVotedByEpic[_epicHash] = true;

        emit VoteCasted(msg.sender, _epicHash, _candidateId, _wardId);
    }
}

