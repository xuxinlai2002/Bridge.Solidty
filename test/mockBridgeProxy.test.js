
/* https://docs.openzeppelin.com/learn/upgrading-smart-contracts */
/* External Imports */
const { ethers, upgrades } = require('hardhat'); 
describe(`Storage and upgradability example `, () => {


  before(`load accounts and chainID`, async () => {

    [ deplyer,alice ] = await ethers.getSigners()
    chainID = await getChainId();

    let bridgeAddress = "0xd68251F74a6C1E502653A505cd0cF7072e66981D";
    //V2
    const BridgeV2 = await ethers.getContractFactory('BridgeV2');
    console.log('Upgrading Bridge...');
    await upgrades.upgradeProxy(bridgeAddress, BridgeV2);
    console.log('Bridge upgraded');

    const bridgeV2 = await BridgeV2.attach(bridgeAddress);
    let data1 = await bridgeV2.getV2Data();
    console.log(data1);

    let data2 = await bridgeV2.getBalanceOfContract();
    console.log(data2);

  })


  it(`test by demo proxy`, async () => {

  })


})
