import { BigNumber, Contract, PopulatedTransaction, Signer, utils } from "ethers";
import { expect } from "chai";
import hre, { deployments, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { AddressZero } from "@ethersproject/constants";
import { parseEther,formatEther} from "@ethersproject/units";
import { getSafeWithOwners, getSafeSingleton, getMultiSend,getFactory } from "../utils/setup";
import { AddressOne } from "../../src/utils/constants";
import { chainId, encodeTransfer } from "../utils/encoding";

import { buildMultiSendSafeTx, encodeMultiSend } from "../../src/utils/multisend";
import { 
    buildSafeTransaction,
    MetaTransaction ,
    calculateSafeTransactionHash,
    signHash,
    executeTx,
    safeApproveHash,
    populateExecuteTx
} from "../../src/utils/execution"

import { calculateProxyAddress } from "../../src/utils/proxies";


describe("GnosisSafe", async () => {

    const [user1, user2, user3] = waffle.provider.getWallets();
    console.log(user1.address);
    console.log(user2.address);
    console.log(user3.address);

    // const setupTests = deployments.createFixture(async ({ deployments }) => {
    //     await deployments.fixture();
    //     return {
    //         template: await getSafeTemplate(),
    //         mock: await getMock()
    //     }
    // })

    // const setupTests = deployments.createFixture(async ({ deployments }) => {
    //     await deployments.fixture()
    //     return {
    //         factory: await getFactory(),
    //         mock: await getMock(),
    //         singleton: await getSafeSingleton()
    //     }
    // })


    describe("setup", async () => {

        it('should work with ether payment to deployer', async () => {

            let userBalance1 = await hre.ethers.provider.getBalance(user1.address)
            console.log("xxl user1 balacne :" + formatEther(userBalance1));
            let userBalance2 = await hre.ethers.provider.getBalance(user2.address)
            console.log("xxl user2 balacne :" + formatEther(userBalance2));
            let userBalance3 = await hre.ethers.provider.getBalance(user3.address)
            console.log("xxl user3 balacne :" + formatEther(userBalance3));

            //yarn safe create --signers "" --threshold 2
            console.log("---xxl step 1...");
            const { factory,singleton } = await setupTests()
            console.log("xxl start setup ...");
            await deployments.fixture();
            // const singleton = await getSafeSingleton()

            // let safeAddress = await singleton.resolvedAddress
            // console.log(`****Using Safe at ${safeAddress}`)
            // console.log("xxl 01 get singleton");

            // const factory = await getFactory();
            // console.log("xxl 02 get factory");
            
            // console.log([
            //     "setup",
            //     [[user1.address, user2.address, user3.address], 2, AddressZero, "0x", AddressZero, AddressZero, 0, AddressZero]
            // ]);
            // const setupData = singleton.interface.encodeFunctionData(
            //     "setup",
            //     [[user1.address, user2.address, user3.address], 2, AddressZero, "0x", AddressZero, AddressZero, 0, AddressZero]
            // )

            // console.log(setupData);
            // console.log("xxl 03 setup call end ");

            // // const predictedAddress = await calculateProxyAddress(factory, singleton.address, setupData, 0)
            // // console.log(`Deploy Safe to ${predictedAddress}`)

            // await factory.createProxyWithNonce(singleton.address, setupData, 0).then((tx: any) => tx.wait())
            const singleton =await getSafeWithOwners([user1.address, user2.address, user3.address], 2, AddressZero)
            console.log("xxl singleton %s",singleton.address);

            const payment = parseEther("10")
            await user1.sendTransaction({ to: singleton.address, value: payment })
            // yarn safe propose-multi 0x7195a01d90fcCF60bCa138e55Dd102F80b3c7f71 tx_input.sample.json
            console.log("\n---xxl step 2...");
            
            let safeAddress = await singleton.resolvedAddress
            console.log(`****Using Safe at ${safeAddress}`)
            
            const txs: MetaTransaction[] = [
                buildSafeTransaction({to: user2.address, value: parseEther("1"), nonce: 0,operation: 0}),
                buildSafeTransaction({to: user3.address, value: parseEther("1"), nonce: 0,operation: 0})
            ]

            let multiSend =  await getMultiSend();
            const safeTx = buildMultiSendSafeTx(multiSend, txs, 0, { safeTxGas: 1 })
            safeTx["gasPrice"] = 10000000000;
            console.log(safeTx);

            const chainId = 100
            const typedDataHash = calculateSafeTransactionHash(singleton, safeTx, chainId)
            console.log(typedDataHash);
            
            // yarn safe propose-multi 0x7195a01d90fcCF60bCa138e55Dd102F80b3c7f71 tx_input.sample.json
            console.log("\n---xxl step 3...");
            let signature1 = await signHash(user1, typedDataHash)
            //signature1["data"] = "0x00000000000000000000000041eA6aD88bbf4E22686386783e7817bB7E82c1ed000000000000000000000000000000000000000000000000000000000000000001";
            console.log(signature1);

            let signature2 = await signHash(user2, typedDataHash)
            console.log(signature2);

            let signature3 = await signHash(user3, typedDataHash)
            console.log(signature3);

            console.log("\n---xxl step 4...");
            let signatures = [];
            signatures.push(signature1);
            signatures.push(signature2);
            signatures.push(signature3);

            console.log(`Version: ${await singleton.VERSION()}`)
            //console.log("1");
            //console.log(`Owners: ${await singleton.getOwners()}`)
            console.log(`Threshold: ${await singleton.getThreshold()}`)
            console.log(`Nonce: ${await singleton.nonce()}`)

            console.log("xxl end ");

            // await executeTx(singleton, safeTx, [signature1,signature2, signature3])
            console.log(safeTx);
            const populatedTx: PopulatedTransaction = await populateExecuteTx(
                singleton, 
                safeTx, 
                signatures, 
                { gasLimit: 8450000, gasPrice: 10000000000 }
            )
            
            const receipt = await user1.sendTransaction(populatedTx).then(tx => tx.wait())
            console.log("Ethereum transaction hash:", receipt.transactionHash)
            console.log(receipt);
    

            userBalance1 = await hre.ethers.provider.getBalance(user1.address)
            console.log("xxl user1 after balacne :" + formatEther(userBalance1));
            userBalance2 = await hre.ethers.provider.getBalance(user2.address)
            console.log("xxl user2 after balacne :" + formatEther(userBalance2));
            userBalance3 = await hre.ethers.provider.getBalance(user3.address)
            console.log("xxl user3 after balacne :" + formatEther(userBalance3));

            // console.log("xxl 00");
            // //console.log(template);
            // //console.log("xxl 01");

            // const payment = parseEther("10")
            // await user1.sendTransaction({ to: singleton.address, value: payment })
            // const userBalance = await hre.ethers.provider.getBalance(user1.address)
            // await expect(await hre.ethers.provider.getBalance(singleton.address)).to.be.deep.eq(parseEther("10"))

            // ///
            // let ret = await singleton.setup([user1.address, user2.address, user3.address], 2, AddressZero, "0x", AddressZero, AddressZero, payment, AddressZero)
            // console.log(ret);

            // await expect(await hre.ethers.provider.getBalance(singleton.address)).to.be.deep.eq(parseEther("0"))
            // await expect(userBalance.lt(await hre.ethers.provider.getBalance(user1.address))).to.be.true

            // let setupData = "";

            // //const predictedAddress = await calculateProxyAddress(factory, singleton.address, setupData, taskArgs.nonce)
            // const predictedAddress = await calculateProxyAddress(factory,singleton.address,"",0);
            
            // console.log(`Deploy Safe to ${predictedAddress}`)


        })


    })
})