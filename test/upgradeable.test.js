/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)
var _ = require('underscore');

const {
  deployBridgeContract,
} = require("../scripts/utils/deploy")


const { utils } = require('ethers')

describe(`Storage and upgradability example `, () => {

  let deplyer,alice
  let chainID
  let keyValueStorage,proxy,delegateV1,delegateV2,bridge;
  let DelegateV1,DelegateV2,Bridge;

  before(`load accounts and chainID`, async () => {

    ;[ deplyer,alice ] = await ethers.getSigners()
    chainID = await getChainId();

    const KeyValueStorage = await ethers.getContractFactory('KeyValueStorage',deplyer)
    keyValueStorage = await KeyValueStorage.connect(deplyer).deploy();

    const Proxy = await ethers.getContractFactory('Proxy',deplyer)
    proxy = await Proxy.connect(deplyer).deploy(keyValueStorage.address,deplyer.address);

    console.log("deploy proxy address ");
    console.log(proxy.address);

    DelegateV1 = await ethers.getContractFactory('DelegateV1',deplyer)
    delegateV1 = await DelegateV1.connect(deplyer).deploy();

    DelegateV2 = await ethers.getContractFactory('DelegateV2',deplyer)
    delegateV2 = await DelegateV2.connect(deplyer).deploy();

    //DST_BRIDGE
    //console.log("chainID is :" + chainID);
    args = {
      "chainId": chainID,
      "relayers":[deplyer.address],
      "relayerThreshold":1,
      "fee":100,
      "expiry":100,
      "gasPrice":0x02540be400,
      "gasLimit":0x7a1200,

      "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8"
    }
    // bridgeContract =  await deployBridgeContract(deplyer,args);


    Bridge = await ethers.getContractFactory('Bridge',deplyer)    
    bridge = await Bridge.connect(deplyer).deploy(
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );
  
  })


  it(`test by demo proxy`, async () => {

    // console.log("test 2 ...");
    await proxy.upgradeTo(delegateV1.address)
    proxy = _.extend(proxy,DelegateV1.attach(proxy.address));

    console.log("delegateV1 proxy address ");
    console.log(proxy.address);

    let numOwnerV1 = await proxy.getNumberOfOwners();
    //console.log(numOwnerV1.toNumber())
    expect(numOwnerV1.toNumber()).to.equal(1);


    await proxy.upgradeTo(delegateV2.address)
    proxy = _.extend(proxy,DelegateV2.attach(proxy.address));
    console.log("delegateV2 proxy address ");
    console.log(proxy.address);

    let numOwnerV2 = await proxy.getNumberOfOwners();
    //console.log(numOwnerV2.toNumber())
    expect(numOwnerV2.toNumber()).to.equal(2);


  })

  it(`test by bridge proxy`, async () => {

    // console.log("test 2 ...");
    await proxy.upgradeTo(delegateV1.address)
    proxy = _.extend(proxy,DelegateV1.attach(proxy.address));
    console.log("delegateV1 proxy address ");
    console.log(proxy.address);

    let numOwnerV1 = await proxy.getNumberOfOwners();
    //console.log(numOwnerV1.toNumber())
    expect(numOwnerV1.toNumber()).to.equal(1);

    await proxy.upgradeTo(bridge.address)
    proxy = _.extend(proxy,Bridge.attach(proxy.address));
    console.log("Bridge proxy address ");
    console.log(proxy.address);


    let numBalance = await proxy.getBalanceOfContract();
    //console.log(numOwnerV1.toNumber())
    expect(numBalance.toNumber()).to.equal(0);

    // let numOwnerV2 = await proxy.getNumberOfOwners();
    // //console.log(numOwnerV2.toNumber())
    // expect(numOwnerV2.toNumber()).to.equal(2);



  })


})
