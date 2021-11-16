
/* https://docs.openzeppelin.com/learn/upgrading-smart-contracts */
/* External Imports */
const { ethers, upgrades } = require('hardhat'); 
import hre, { waffle,deployments } from "hardhat";
import { getMultiSend, getSafeWithOwners } from "../utils/setup";

describe(`multiSig upgrade `, () => {

  const [user1, user2,user3] = waffle.provider.getWallets();

  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture();

    return {
        //xxl step1 
        safe: await getSafeWithOwners([user1.address,user2.address,user3.address],2),
        multiSend: await getMultiSend()
    }
  })

  before(`load accounts and chainID`, async () => {

    //[user1, user2,user3] = waffle.provider.getWallets();
    console.log(user1.address);
    // [ deployer,alice ] = await ethers.getSigners()
    // console.log(deployer.address);
    // console.log(alice.address);
  })



  it(`test for upgrade by multiSig`, async () => {
    
    //Box

    console.log("-------------xxl step 1 deployProx Box-------------");
    const Box = await ethers.getContractFactory('Box');
    const box = await upgrades.deployProxy(Box, [42], { initializer: 'store' });    
    let result = (await box.retrieve()).toString();
    console.log("xxl box result :" + result);

    console.log("\n-------------xxl step 2 create safe address-------------");   
    const { safe, multiSend } = await setupTests()
    let saftA1 = safe.address;
    let saftA2 = safe.resolvedAddress
    console.log(saftA1 + ":" + saftA2)  ;

    //console.log(user2.address);
    //console.log(user1.address);
    //await upgrades.admin.transferProxyAdminOwnership(user2.address);

    let proxyAdminContract = await upgrades.admin.getInstance();
    console.log("proxyAdmin contract address is : " + proxyAdminContract.address);























    
    //BoxV2
    console.log('\nupgrade to BoxV2 ');
    const BoxV2 = await ethers.getContractFactory('BoxV2');
    await upgrades.upgradeProxy(box.address, BoxV2);
    // console.log(tt);

    const boxV2 = await BoxV2.connect(user1).attach(box.address);
    await boxV2.increment();
    result = (await box.retrieve()).toString();
    console.log("xxl boxV2 result :" + result);
  

  })


})
