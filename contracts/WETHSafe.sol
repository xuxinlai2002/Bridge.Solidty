// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.7.6;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IWETH10.sol";

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
        IWETH10 weth10 = IWETH10(tokenAddress);
        _safeTransferFrom(weth10, owner, recipient, amount);
    }

    /**
        @notice used to transfer WETH10s safely
        @param token Token instance to transfer
        @param from Address to transfer token from
        @param to Address to transfer token to
        @param value Amount of token to transfer
     */
    function _safeTransferFrom(IWETH10 token, address from, address to, uint256 value) private {
        _safeCall(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
        @notice used to make calls to WETH10s safely
        @param token Token instance call targets
        @param data encoded call data
     */
    function _safeCall(IWETH10 token, bytes memory data) private {        
        (bool success, bytes memory returndata) = address(token).call(data);
        require(success, "WETH10: call failed");

        if (returndata.length > 0) {

            require(abi.decode(returndata, (bool)), "WETH10: operation did not succeed");
        }
    }
}
