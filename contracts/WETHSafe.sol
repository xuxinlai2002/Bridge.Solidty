// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";


/**
    @title Manages deposited WETHs.
    @author ChainSafe Systems.
    @notice This contract is intended to be used with WETH10Handler contract.
 */
contract WETHSafe {
    using SafeMath for uint256;

    /**
        @notice Used to gain custody of deposited token.
        @param tokenAddress Address of WETH10 to transfer.
        @param owner Address of current token owner.
        @param recipient Address to transfer tokens to.
        @param amount Amount of tokens to transfer.
     */
    function lockWETH(address tokenAddress, address owner, address recipient, uint256 amount) internal {
    
    }



    function transferWETH(address to,uint256 amount) public{

        //LogString("come to WETHSafe lockWETH 1111");
        


    }


}
