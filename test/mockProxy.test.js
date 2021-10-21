
/* https://docs.openzeppelin.com/learn/upgrading-smart-contracts */
/* External Imports */
const { ethers, upgrades } = require('hardhat'); 
describe(`Storage and upgradability example `, () => {


  before(`load accounts and chainID`, async () => {

    [ deplyer,alice ] = await ethers.getSigners()
    chainID = await getChainId();

    const Box = await ethers.getContractFactory('Box');
    console.log('Deploying Box...');
    const box = await upgrades.deployProxy(Box, [42], { initializer: 'store' });
    
    await box.deployed();
    console.log('Box deployed to:', box.address);
    let result = (await box.retrieve()).toString();
    console.log(result);

    //upgrade
    const BoxV2 = await ethers.getContractFactory('BoxV2');
    console.log('Upgrading Box...');
    await upgrades.upgradeProxy(box.address, BoxV2);
    console.log('Box upgraded');


    //work
    const boxV2 = await BoxV2.attach(box.address);
    await boxV2.increment();
    result = (await box.retrieve()).toString();
    console.log(result);


  })


  it(`test by demo proxy`, async () => {

  })


})
