/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

const {
  deployBridgeL1Contract,
  deployBridgeL2Contract,
  deployERC721Handler,
  deployERC721,
  deployERC20Handler,
  deployERC20
} = require("../scripts/utils/deploy")

const { utils } = require('ethers')

const {
  sleep,
  getSign,
  getAbiterList,
  getAbiterSign,
  getSuperAbiterSign,
  getSuperAbiterErc721Sign,
  getErc721Sign
} = require('../scripts/utils/helper')


const {
  registerResource,
  setBurn
} = require("../scripts/utils/bridge")

const {
  addMinter,
  approve
} = require("../scripts/utils/erc20")
const { compose } = require('underscore')

const{
  add721Minter
} = require("../scripts/utils/erc721")


describe(`layer1 => layer2 erc721 `, () => {

  let INITIAL_FEE = 100

  let deplyer,admin,alice
  let chainID
  before(`load accounts and chainID`, async () => {

    ;[ deplyer, admin,alice ] = await ethers.getSigners()
    chainID = await getChainId();
    console.log("chainID is :" + chainID);
  
  })

  const WethResourceId =   "0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8";
  const Erc721ResourceId = "0x1000000000000000000000000000000000000000000000000000000000000001";
  let bridgeContract
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
        "dest":83,
        "recipient":alice.address,
        "resourceId":Erc721ResourceId,
        "superAddress":alice.address,
        "nodePublickey":"0x03bfd8bd2b10e887ec785360f9b329c2ae567975c784daca2f223cb19840b51914",
        "nftId":"0x12",
        "metaData":"0xabcd"
    }
      
  })
  
  it(`deposit run in layer1`, async () => {

   //DST_BRIDGE
     bridgeContract =  await deployBridgeL1Contract(deplyer,args);
     args.bridgeAddress  = bridgeContract.address;

    //1.handler
    console.log("\n-----------------------------step1 deploy handler-----------------------------"); 
    let ERC721Handler = await deployERC721Handler(deplyer,args);

    //2.erc721
    args.name = "TEST721"
    args.symbol = "TEST721"
    args.uri = "https://"

    console.log("\n-----------------------------step2 deploy erc721-----------------------------");    
    let ERC721 = await deployERC721(deplyer,args);

    //3.mint   
    console.log("\n-----------------------------step3 mint erc721-----------------------------");   
    await ERC721.mint(alice.address,args.nftId,args.metaData);
  
    console.log("\n-----------------------------step4 registerResource erc721-----------------------------");   
    //4.registerResource
    args.bridge = bridgeContract.address;
    args.handler = ERC721Handler.address;
    args.targetContract = ERC721.address;
    args.resourceId = Erc721ResourceId;
    await registerResource(deplyer,args) ;

    //5.approve
    console.log("\n-----------------------------step5 approve erc721-----------------------------"); 
    //function approve(address to, uint256 tokenId) public virtual override { 
    console.log([ERC721Handler.address,args.nftId]);
    await ERC721.connect(alice).approve(ERC721Handler.address,args.nftId);

    console.log("\n-----------------------------step6 adminChangeFee-----------------------------");
    let fee = utils.parseEther("0.1");
    await bridgeContract.adminChangeFee(fee)

    console.log("\n-----------------------------step7 deposit-----------------------------");     
    let data = '0x' +
    ethers.utils.hexZeroPad(args.nftId, 32).substr(2) +
    ethers.utils.hexZeroPad(fee.toHexString(), 32).substr(2) 

    
    try{
      
      console.log("xxl 0000 1");
      let tx = await bridgeContract.connect(alice).deposit(
        args.dest,args.resourceId,data,{
          value:fee
        }
      );
      
      let result = await tx.wait();
      console.log("layer1 deposit gas used : " + result.gasUsed);

      //afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(args.bridge));
      //console.log("srcHandler eth : " + afterEthBalace);
      //afterEthBalace.expect.toHexString.before
      //expect(afterEthBalace).to.equal("10.1")
      
    } catch (e) {
      console.log("error ");
      console.log(e);
    }

  })

  //layer2 -> layer1
  it(`executeProposal run in layer2`, async () => {

    try{

      //DST_BRIDGE
      bridgeContract =  await deployBridgeL2Contract(deplyer,args);
      args.bridgeAddress  = bridgeContract.address;

      //1.handler
      console.log("\n-----------------------------step1 deploy handler-----------------------------"); 
      let ERC721Handler = await deployERC721Handler(deplyer,args);

      //2.erc721
      args.name = "TEST721"
      args.symbol = "TEST721"
      args.uri = "https://"

      console.log("\n-----------------------------step2 deploy erc721-----------------------------");    
      let ERC721 = await deployERC721(deplyer,args);

      //3.mint   
      // console.log("\n-----------------------------step3 mint erc721-----------------------------");   
      // await ERC721.mint(alice.address,args.nftId,args.metaData);
    
      //4.registerResource
      console.log("\n-----------------------------step4 registerResource erc721-----------------------------");   
      args.bridge = bridgeContract.address;
      args.handler = ERC721Handler.address;
      args.targetContract = ERC721.address;
      args.resourceId = Erc721ResourceId;
      await registerResource(deplyer,args) ;

      //5.approve
      // console.log("\n-----------------------------step5 approve erc721-----------------------------"); 
      //function approve(address to, uint256 tokenId) public virtual override { 
      // console.log([ERC721Handler.address,args.nftId]);
      // await ERC721.connect(alice).approve(ERC721Handler.address,args.nftId);

      console.log("\n-----------------------------step6 add721Minter-----------------------------"); 
      args.minter = ERC721Handler.address;
      args.erc721Address = ERC721.address;
      await add721Minter(deplyer,args);

      console.log("\n-----------------------------step7 setBurn-----------------------------"); 
      await setBurn(deplyer,args);

      // await sleep(2000)
      console.log("\n-----------------------------step8 sendWeth-----------------------------"); 
      await approveWeth(deplyer,args);
      args.resourceId = Erc721ResourceId;

      // await sleep(2000)
      console.log("\n-----------------------------step9 adminChangeFee-----------------------------"); 
      let fee = utils.parseEther("0.1");
      await bridgeContract.adminChangeFee(fee)
      await sleep(2000);

      //----------
      let abiterList = getAbiterList();
      let signList = await getAbiterSign(abiterList);
      await bridgeContract.setAbiterList(abiterList,12,signList);

      let metaDataLen = 2;
      let metaData = "0x3456"

      const data = '0x' +
      ethers.utils.hexZeroPad(args.nftId, 32).substr(2) +                                              // Deposit Amount        (32 bytes)
      ethers.utils.hexZeroPad(fee.toHexString(), 32).substr(2) +                                       // Deposit Fee           (32 bytes)
      ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
      args.recipient.substr(2) +                                                                       // recipientAddress      (?? bytes)
      ethers.utils.hexZeroPad(ethers.utils.hexlify(metaDataLen), 32).substr(2) +                       // len(metaDataLen)      (32 bytes)
      metaData.substr(2) ;                                                                             // metaDataLen           (?? bytes)
     
      let depositNonce = 0;
      let sign = await getErc721Sign(args.dest,depositNonce,args.resourceId,data); 

      console.log("xxl data : ");
      console.log(data);

      let superSign = await getSuperAbiterErc721Sign()

      console.log("xxl ----");
      console.log(args);

      let re = await bridgeContract.executeProposal(
          args.dest,
          depositNonce,
          data,
          args.resourceId,
          sign,
          superSign          
      )

      let re2 = await re.wait();
      console.log(re2);

      }catch(e){
        console.log(e);
      }
  })
  
  async function approveWeth(deplyer,args){

    //SRC_BRIDGE
    console.log("\n-----------------------------sendWeth 1 deployERC20Handler-----------------------------"); 
    let ERC20Handler = await deployERC20Handler(deplyer,args);

    console.log("\n-----------------------------sendWeth 2 deployERC20-----------------------------"); 
    args.name = "WETH"
    args.symbol = "WETH"
    let ERC20 = await deployERC20(deplyer,args);

    console.log("\n-----------------------------sendWeth 3 registerResource-----------------------------"); 
    args.resourceId = WethResourceId;
    args.handler = ERC20Handler.address;
    args.targetContract = ERC20.address;
    await registerResource(deplyer,args);
    
    console.log("\n-----------------------------sendWeth 4 add mint-----------------------------"); 
    args.erc20Address = ERC20.address;
    args.minter = ERC20Handler.address;
    await addMinter(deplyer,args);    
    // let feeAmount = utils.parseEther("100");
    // await ERC20.mint(args.bridge,feeAmount);

  }



})