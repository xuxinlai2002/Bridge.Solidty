/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

const {
  deployBridgeContract,
  deployERC20Handler,
  deployWETHHandler,
  deployWETH,
  deployERC20
} = require("../scripts/utils/deploy")



describe(`Fee Setting`, () => {

  let INITIAL_FEE = 100

  let deplyer,admin,alice
  let chainID
  before(`load accounts and chainID`, async () => {
    ;[ deplyer, admin,alice ] = await ethers.getSigners()
    chainID = await getChainId();
    console.log("chainID is :" + chainID);
  })

  let bridgeContact
  beforeEach(`deploy Bridge contract`, async () => {

    //console.log("chainID is :" + chainID);
    args = {
        "chainId": chainID,
        "relayers":[admin.address],
        "relayerThreshold":1,
        "fee":INITIAL_FEE,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,

        "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8"
    }

    //DST_BRIDGE
    bridgeContact =  await deployBridgeContract(deplyer,args);
  
  })

  it(`get initial fee`, async () => {

    const fee = await bridgeContact.getFee()
    expect(fee).to.equal(INITIAL_FEE)

  })

  it(`admin change fee`, async () => {

    await bridgeContact.adminChangeFee(1000)

    const fee = await bridgeContact.getFee()
    expect(fee).to.equal(1000)

  })




})
