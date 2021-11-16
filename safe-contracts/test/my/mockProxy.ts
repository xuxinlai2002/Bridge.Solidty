
/* https://docs.openzeppelin.com/learn/upgrading-smart-contracts */
/* External Imports */
import { expect } from "chai";
const { ethers, upgrades } = require('hardhat'); 
import hre,{ waffle,deployments } from "hardhat";
import { getMultiSend, getSafeWithOwners } from "../utils/setup";
import {  buildSafeTransaction, executeTx, MetaTransaction, safeApproveHash } from "../../src/utils/execution";
import { buildMultiSendSafeTx} from "../../src/utils/multisend";
import { formatEther, parseEther } from "@ethersproject/units";

describe(`multiSig upgrade `, () => {

  // const [user1, user2,user3,user4] = waffle.provider.getWallets();
  let user1:any, user2:any,user3:any,user4:any;
  before(`load accounts and chainID`, async () => {
     [user1, user2,user3,user4] = await ethers.getSigners();
    //let chainID = await getChainId();
    //console.log("chainID is :" + chainID);
  })


  // const setupTests = deployments.createFixture(async ({ deployments }) => {

  //   // await deployments.fixture();

  //   return {
  //       //xxl step1 
  //       safe: await getSafeWithOwners([user1.address,user2.address,user3.address,user4.address],3),
  //       multiSend: await getMultiSend()
  //   }

  // })

  const setupTests = deployments.createFixture(async ({}) => {

    // await deployments.fixture();

    return {
        //xxl step1 
        safe: await getSafeWithOwners([user1.address,user2.address,user3.address,user4.address],3),
        multiSend: await getMultiSend()
    }

  })


  it(`test for upgrade by multiSig`, async () => {

    //step 0
    console.log("-------------xxl step 0 accounts -------------");
    let user1Balance  = await hre.ethers.provider.getBalance(user1.address)
    console.log("******xxl user1 balance is : " + formatEther(user1Balance));
    let user2Balance  = await hre.ethers.provider.getBalance(user2.address)
    console.log("******xxl user2 balance is : " + formatEther(user2Balance));
    let user3Balance  = await hre.ethers.provider.getBalance(user3.address)
    console.log("******xxl user3 balance is : " + formatEther(user3Balance));
    let user4Balance  = await hre.ethers.provider.getBalance(user4.address)
    console.log("******xxl user4 balance is : " + formatEther(user4Balance));
    //step 1
    console.log("-------------xxl step 1 deployProx Box-------------");
    const Box = await ethers.getContractFactory('Box');
    const box = await upgrades.deployProxy(Box, [42], { initializer: 'store' });   
    console.log("upgrades deployProxy address is : " + box.address); 
    let result = (await box.retrieve()).toString();
    console.log("box retrieve :" + result);
 
    console.log("\n-------------xxl step 2 create safe address-------------");   
    const { safe, multiSend } = await setupTests()
    console.log("safe address is : " + safe.address);

    console.log("\n-------------xxl step 3 transfer ProxyAdminOwnership-------------");   
    await upgrades.admin.transferProxyAdminOwnership(safe.address);  
    console.log("transferred ownership of ProxyAdmin to:", safe.address);

    console.log("\n-------------xxl step 4 prepare Upgrade-------------");   
    const BoxV2 = await ethers.getContractFactory('BoxV2');
    const boxV2Address = await upgrades.prepareUpgrade(box.address, BoxV2);  
    console.log("BoxV2 at:", boxV2Address); 

    console.log("\n-------------xxl step 5 construct proxy upgrade contract-------------");   
    let proxyAdminContract = await upgrades.admin.getInstance();
    console.log("xxl proxyAdmin contract address is : " + proxyAdminContract.address);
    const data = proxyAdminContract.interface.encodeFunctionData("upgrade", [box.address,boxV2Address])
    const txs: MetaTransaction[] = [
      buildSafeTransaction({to: proxyAdminContract.address,data, nonce: 0})
    ]
    const safeTx = buildMultiSendSafeTx(multiSend, txs, await safe.nonce())

    await expect(
      executeTx(safe, safeTx, [ 
          await safeApproveHash(user1, safe, safeTx, false),
          await safeApproveHash(user2, safe, safeTx, false),
          await safeApproveHash(user3, safe, safeTx, false)
      ])
    ).to.emit(safe, "ExecutionSuccess")

    console.log("\n-------------xxl step 6 upgrade boxV2 contract-------------");   
    const boxV2 = await BoxV2.connect(user1).attach(box.address);
    await boxV2.increment();
    result = (await box.retrieve()).toString();
    console.log("xxl boxV2 result :" + result);
  
  })


})
