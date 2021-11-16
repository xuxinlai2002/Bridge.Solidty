import { expect } from "chai";
import hre, { deployments, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { deployContract, getMock, getMultiSend, getSafeWithOwners } from "../utils/setup";
import { buildContractCall, buildSafeTransaction, executeTx, MetaTransaction, safeApproveHash } from "../../src/utils/execution";
import { buildMultiSendSafeTx, encodeMultiSend } from "../../src/utils/multisend";
import { formatEther, parseEther } from "@ethersproject/units";

describe("MultiSend", async () => {

    const [user1, user2,user3] = waffle.provider.getWallets();

    const setupTests = deployments.createFixture(async ({ deployments }) => {
        await deployments.fixture();

        return {
            //xxl step1 
            safe: await getSafeWithOwners([user1.address,user2.address,user3.address],2),
            multiSend: await getMultiSend()
        }
    })

    describe("multiSend", async () => {


        it('Can execute single ether transfer', async () => {

            let user1Balance  = await hre.ethers.provider.getBalance(user1.address)
            console.log("******xxl user1 balance is : " + formatEther(user1Balance));
            let user2Balance  = await hre.ethers.provider.getBalance(user2.address)
            console.log("******xxl user2 balance is : " + formatEther(user2Balance));
            let user3Balance  = await hre.ethers.provider.getBalance(user3.address)
            console.log("******xxl user3 balance is : " + formatEther(user3Balance));

            const { safe, multiSend } = await setupTests()
            let safeBalance  = await hre.ethers.provider.getBalance(safe.address)
            console.log("******xxl safe balance is : " + formatEther(safeBalance));

            console.log("xxl safe address is : " + safe.address);
            await user1.sendTransaction({to: safe.address, value: parseEther("11")})
         
            await expect(await hre.ethers.provider.getBalance(safe.address)).to.be.deep.eq(parseEther("11"))
            safeBalance  = await hre.ethers.provider.getBalance(safe.address)
            console.log("******xxl safe balance is : " + formatEther(safeBalance));

            const txs: MetaTransaction[] = [
                buildSafeTransaction({to: user2.address, value: parseEther("1"), nonce: 0}),
                buildSafeTransaction({to: user3.address, value: parseEther("2"), nonce: 0}),
            ]
            const safeTx = buildMultiSendSafeTx(multiSend, txs, await safe.nonce())

            console.log("xxl start tx : ...");
            console.log(safeTx);
            console.log("xxl end tx : ...");
            
            await expect(
                executeTx(safe, safeTx, [ 
                    await safeApproveHash(user1, safe, safeTx, true),
                    await safeApproveHash(user2, safe, safeTx, false)
                ])
            ).to.emit(safe, "ExecutionSuccess")

            // await expect(await hre.ethers.provider.getBalance(safe.address)).to.be.deep.eq(parseEther("0"))
            // await expect(await hre.ethers.provider.getBalance(user2.address)).to.be.deep.eq(userBalance.add(parseEther("1")))

            user1Balance  = await hre.ethers.provider.getBalance(user1.address)
            console.log("******xxl user1 balance is : " + formatEther(user1Balance));
            user2Balance  = await hre.ethers.provider.getBalance(user2.address)
            console.log("******xxl user2 balance is : " + formatEther(user2Balance));
            user3Balance  = await hre.ethers.provider.getBalance(user3.address)
            console.log("******xxl user3 balance is : " + formatEther(user3Balance));
            safeBalance  = await hre.ethers.provider.getBalance(safe.address)
            console.log("******xxl safe balance is : " + formatEther(safeBalance));


        })


    })
})