// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ElectionVoting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(address => bool) public hasVoted;
    mapping(uint256 => Candidate) public candidates;

    event VoteCasted(address indexed voter, uint256 candidateId, uint256 wardId);

    /// @dev Optional helper to pre-register candidates (not required for vote()).
    /// You can call this later, or ignore it and just emit votes.
    function setCandidate(uint256 _candidateId, string calldata _name) external {
        candidates[_candidateId] = Candidate({id: _candidateId, name: _name, voteCount: candidates[_candidateId].voteCount});
    }

    function vote(uint256 _candidateId, uint256 _wardId) external {
        require(!hasVoted[msg.sender], "Already voted");
        require(_candidateId != 0, "Invalid candidate");

        // If candidate wasn't set, still allow voting but keep name empty.
        Candidate storage c = candidates[_candidateId];
        if (c.id == 0) {
            c.id = _candidateId;
        }
        c.voteCount += 1;

        hasVoted[msg.sender] = true;

        emit VoteCasted(msg.sender, _candidateId, _wardId);
    }
}

