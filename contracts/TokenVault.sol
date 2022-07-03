// https://eips.ethereum.org/EIPS/eip-20
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BorrowToken.sol";
import "./MockDAIToken.sol";

contract TokenVault {
    BorrowToken public borrowToken;
    MockDAIToken public mockDAIToken;

    address private owner;
    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(MockDAIToken _mockDAIToken, BorrowToken _borrowToken) public {
        owner = msg.sender;
        borrowToken = _borrowToken;
        mockDAIToken = _mockDAIToken;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function stakeTokens(uint _amount) public {
        require(_amount > 0, "Amount must be greater than 0");
        mockDAIToken.transferFrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] += _amount;
        if(hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    function issueTokens() public isOwner {
        for(uint i=0; i<stakers.length;i++) {
            address receiver = stakers[i];
            uint amount = stakingBalance[receiver];
            if(amount > 0) {
                borrowToken.transfer(receiver, amount);
            }
        }
    }

    function unStakeTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, "You must have staked tokens to unstake");
        mockDAIToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }
}