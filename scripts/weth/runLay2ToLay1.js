const {
    deployBridgeContract
} = require("../utils/deploy");

const {
    sleep,
    getSign,
    getAbiterList,
    readConfig,
} = require('../utils/helper')

const {
    approve,
    addMinter
} = require("../utils/erc20")

const { utils } = require('ethers')
const { ethers } = require("hardhat");


const main = async () => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];
    console.log(deployer.address);

    //------------------
    let dstBridge = await readConfig("3weth_config","DST_BRIDGE");
    let dstERC20 = await readConfig("3weth_config","DST_ERC20");
    let dstHandlerERC20 = await readConfig("3weth_config","DST_HANDLER_ERC20");

    //
    let sendValue = utils.parseEther("1");
    args = {
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8",

        "bridge":dstBridge,
        "dest":80,
        "amount":sendValue,
        "recipient":dstHandlerERC20,

        "erc20":dstERC20,
        "erc20Hander":dstHandlerERC20,
        "bridgeAddress":dstBridge
    }

    console.log("\n*************************check balance before****************************");
    let beforeEthBalace = await utils.formatEther(await deployer.getBalance());
    console.log("acount[2] eth  : " + beforeEthBalace);
   
    prov = ethers.getDefaultProvider();
    beforeEthBalace = await utils.formatEther(await prov.getBalance(dstBridge));
    console.log("srcHandler eth : " + beforeEthBalace);

    console.log("**************************************************************************\n");
    
    //stop here
    const Factory__Bridge = await ethers.getContractFactory('Bridge',deployer)
    let bridgeInstance = await Factory__Bridge.connect(deployer).attach(dstBridge);    

    console.log("bridge is : " + dstBridge );
    console.log(bridgeInstance.address);

    try{
        await approve(deployer,args);

        args["recipient"] = deployer.address
        const data = '0x' + 
        ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
        ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
        args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
    
        console.log(`Constructed deposit:`)
        console.log(`Resource Id: ${args.resourceId}`)
        console.log(`Amount: ${args.amount.toHexString()}`)
        console.log(`len(recipient): ${(args.recipient.length - 2)/ 2}`)
        console.log(`Recipient: ${args.recipient}`)
        console.log(`Raw: ${data}`)
        console.log(`Creating deposit to initiate transfer!`);

        // Perform deposit
        tx = await bridgeInstance.deposit(
            args.dest, // destination chain id
            args.resourceId,
            data,
            {
                gasPrice: args.gasPrice,
                gasLimit: args.gasLimit
            }
        );
    } catch (e) {
        console.log("error ");
        console.log(e);
        //process.exit(0)
    }

    //sleep(sleepTime);
    await sleep(3000);

    console.log("\n*************************check balance after****************************");
    let afterEthBalace = await utils.formatEther(await deployer.getBalance());
    console.log("acount[2] eth  : " + afterEthBalace);
   
    //afterEthBalace =await ethers.provider.getBalance(srcBridge);
    afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(dstBridge));
    console.log("srcHandler eth : " + afterEthBalace);
    console.log("**************************************************************************\n");


    process.exit(0)




}

main();
