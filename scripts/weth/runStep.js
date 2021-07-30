const { ethers} = require('hardhat')
const {
    deployBridgeContract,
    deployERC20Handler,
    deployWETHHandler,
    deployWETH,
    deployERC20
} = require("../utils/deploy")

const {
    writeConfig,
    readConfig,
    sleep
} = require('../utils/helper')

const {
    registerResource,
    setBurn
} = require("../utils/bridge")

const {
    //approve,
    deposit
} = require("../utils/weth")

const {
    approve,
    addMinter
} = require("../utils/erc20")

const { BigNumber, utils } = require('ethers')
const fs = require('fs')

const step0 = async (sleepTime,depoistEth) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()

    
    //1.deploy weth
    args = {
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
    }

    //1.5 Write to weth config
    weth10 = await deployWETH(accounts[0],args)
    await writeConfig("0weth_config","0weth_config","SRC_WETH",weth10.address);
    console.log("Weth.address :" + weth10.address);
    console.log("");

    await sleep(sleepTime);

    //2.deposit eth to weth
    let beforeEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("before eth : " + beforeEthBalace);

    await sleep(sleepTime);

    const beforeWethBalance = utils.formatEther(await weth10.balanceOf(accounts[0].address));
    console.log("before weth : " + beforeWethBalance);

    let depositEth = utils.parseEther(depoistEth)
    await weth10.deposit({ from: accounts[0].address, value: depositEth })

    let afterEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("after eth : " + afterEthBalace);
    const afterWethBalace = await utils.formatEther(await weth10.balanceOf(accounts[0].address));
    console.log("after weth : " + afterWethBalace);

}

//
const step1 = async (sleepTime) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
   
    //
    args = {
        "chainId": chainID,
        "relayers":[accounts[0].address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,

        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
    }

    //SRC_BRIDGE
    let bridge = await deployBridgeContract(accounts[0],args);

    await writeConfig("0weth_config","1weth_config","SRC_BRIDGE",bridge.address);
    console.log("Bridge.address :" + bridge.address);
    console.log("");

    let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    args["bridgeAddress"] = srcBridge

    //SRC_HANDLER-ER20
    let ERC20Handler = await deployERC20Handler(accounts[0],args);
    await writeConfig("1weth_config","1weth_config","SRC_HANDLE_ER20",ERC20Handler.address);
    console.log("ERC20Handler.address :" + ERC20Handler.address);
    console.log("");

    //SRC_HANDLER-WETH
    let WethHandler = await deployWETHHandler(accounts[0],args);
    await writeConfig("1weth_config","1weth_config","SRC_HANDLER_WETH",WethHandler.address);
    console.log("WETHHandler.address :" + WethHandler.address);
    console.log("");

    await sleep(sleepTime);

}

//
const step2 = async (sleepTime) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
   
    let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    let srcHandlerWETH = await readConfig("1weth_config","SRC_HANDLER_WETH");
    let srcWETH = await readConfig("1weth_config","SRC_WETH");
    //
    args = {
        "chainId": chainID,
        "relayers":[accounts[0].address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,

        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
        "bridge":srcBridge,
        "handler":srcHandlerWETH,
        "targetContract":srcWETH
    }

    await registerResource(accounts[0],args);
    console.log("");

    await sleep(sleepTime)
    
}

//
const step3 = async (sleepTime,isWeth) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    let workAccount = accounts[1];

    //
    args = {
        "chainId": chainID,
        "relayers":[workAccount.address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "erc20Name":"Wrapped Ether v10",
        "erc20Symbol":"WETH10"
    }

    //DST_BRIDGE
    let Bridge = await deployBridgeContract(workAccount,args);
    await writeConfig("1weth_config","3weth_config","DST_BRIDGE",Bridge.address);
    console.log("Bridge.address :" + Bridge.address);
    console.log("");

    let dstBridge = await readConfig("3weth_config","DST_BRIDGE");
    args["bridgeAddress"] = dstBridge
    
    //DST_HANDLER_ERC20
    let ERC20Handler = await deployERC20Handler(workAccount,args,isWeth);
    await writeConfig("3weth_config","3weth_config","DST_HANDLER_ERC20",ERC20Handler.address);
    console.log("ERC20Handler.address :" + ERC20Handler.address);
    console.log("");

    //DST_ERC20
    let ERC20 = await deployERC20(workAccount,args);
    await writeConfig("3weth_config","3weth_config","DST_ERC20",ERC20.address);
    console.log("ERC20.address :" + ERC20.address);
    console.log("");

    await sleep(sleepTime)

}

const step4 = async (sleepTime) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    let workAccount = accounts[1];

    let dstBridge = await readConfig("3weth_config","DST_BRIDGE");
    let dstHandlerERC20 = await readConfig("3weth_config","DST_HANDLER_ERC20");
    let dstERC20 = await readConfig("3weth_config","DST_ERC20");
    //
    args = {
        "chainId": chainID,
        "relayers":[workAccount.address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,

        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
        "bridge":dstBridge,
        "handler":dstHandlerERC20,
        "targetContract":dstERC20
    }

    await registerResource(workAccount,args);
    await sleep(sleepTime)

}

const step5 = async (sleepTime) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    let workAccount = accounts[1];

    let dstBridge = await readConfig("3weth_config","DST_BRIDGE");
    let dstHandlerERC20 = await readConfig("3weth_config","DST_HANDLER_ERC20");
    let dstERC20 = await readConfig("3weth_config","DST_ERC20");
    //
    args = {
        "chainId": chainID,
        "relayers":[workAccount.address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,

        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",

        "bridge":dstBridge,
        "handler":dstHandlerERC20,
        "targetContract":dstERC20
    }

    let hash = await setBurn(workAccount,args);

    await sleep(sleepTime)
   

}

const step6 = async (sleepTime) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    let workAccount = accounts[1];

    let dstHandlerERC20 = await readConfig("3weth_config","DST_HANDLER_ERC20");
    let dstERC20 = await readConfig("3weth_config","DST_ERC20");
    
    //
    args = {
        "minter":dstHandlerERC20,
        "erc20Address":dstERC20
    }

    await addMinter(workAccount,args);
    await sleep(sleepTime)
   

}

const step7 = async (sleepTime) => {

    let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    let srcHandlerWETH = await readConfig("1weth_config","SRC_HANDLER_WETH");
    let srcHandlerERC20 = await readConfig("1weth_config","SRC_HANDLE_ER20");
 
    let dstBridge = await readConfig("3weth_config","DST_BRIDGE");
    let dstHandlerERC20 = await readConfig("3weth_config","DST_HANDLER_ERC20");
 
    toData = {
        "chains":[
            {
                "name": "my1",
                "type": "ethereum",
                "id": "82",
                "endpoint": "ws://localhost:20637",
                "from": "0x41eA6aD88bbf4E22686386783e7817bB7E82c1ed",
                "opts": {

                    "bridge": srcBridge,
                    "wethHandler": srcHandlerWETH,
                    "erc20Handler": srcHandlerERC20,
                    "genericHandler": srcHandlerERC20,
                    "gasLimit": "1000000",
                    "maxGasPrice": "10000000000",
                    "blockConfirmations":"1"
                }
            },
            {
                "name": "my2",
                "type": "ethereum",
                "id": "83",
                "endpoint": "ws://localhost:21637",
                "from": "0x4f2C793DB2163A7A081b984E6E8e2c504825668b",
                "opts": {
                    "bridge": dstBridge,
                    "erc20Handler": dstHandlerERC20,
                    "genericHandler": dstHandlerERC20,
                    "gasLimit": "1000000",
                    "maxGasPrice": "10000000000",
                    "blockConfirmations":"1"
                }
           }
        ]
    }
    
    let tofullPath = "./config.json"
    fs.writeFileSync(tofullPath, JSON.stringify(toData, null, 4), { encoding: 'utf8' }, err => {})

    await sleep(sleepTime)

}

//aprove
const step8 = async (sleepTime,amount) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
   
    let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    let srcHandlerWETH = await readConfig("1weth_config","SRC_HANDLER_WETH");
    let srcWETH = await readConfig("1weth_config","SRC_WETH");

    //
    args = {
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,

        "bridge":srcBridge,
        "recipient":srcHandlerWETH,
        "amount":amount,
        "wethAddress":srcWETH
    }

    await approve(accounts[0],args);
    await sleep(sleepTime)
    
}

//deposit
const step9 = async(sleepTime,amount) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
   
    let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    let srcHandlerWETH = await readConfig("1weth_config","SRC_HANDLER_WETH");
    let srcWETH = await readConfig("1weth_config","SRC_WETH");


    console.log("\n*************************check balance before****************************");
    let beforeEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("acount[0] eth  : " + beforeEthBalace);
    let beforeWethBalance = await utils.formatEther(await weth10.balanceOf(accounts[0].address));
    console.log("acount[0] weth : " + beforeWethBalance);


    
    //const balance = await prov.getBalance(address);
    prov = ethers.getDefaultProvider();
    beforeEthBalace = await utils.formatEther(await prov.getBalance(srcHandlerWETH));
    console.log("srcHandler eth : " + beforeEthBalace);

    beforeWethBalance = await utils.formatEther(await weth10.balanceOf(srcHandlerWETH));
    console.log("srcHandler weth: " + beforeWethBalance);
    console.log("**************************************************************************\n");

    //
    args = {
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,

        "bridge":srcBridge,
        "recipient":srcHandlerWETH,
        "amount":amount,
        "wethAddress":srcWETH,

        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
        "dest":83

    }

    await deposit(accounts[0],args);
    await sleep(sleepTime)

    console.log("\n*************************check balance after****************************");
    let afterEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("acount[0] eth : " + afterEthBalace);
    const afterWethBalance = await utils.formatEther(await weth10.balanceOf(accounts[0].address));
    console.log("acount[0] weth : " + afterWethBalance);

    beforeEthBalace = await utils.formatEther(await prov.getBalance(srcHandlerWETH));
    console.log("srcHandler eth : " + beforeEthBalace);

    beforeWethBalance = await utils.formatEther(await weth10.balanceOf(srcHandlerWETH));
    console.log("srcHandler weth: " + beforeWethBalance);
    console.log("**************************************************************************\n");
    
}

const stepN1 = async (sleepTime) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
   
    //
    args = {
        "chainId": chainID,
        "relayers":[accounts[0].address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,

        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
    }

    //SRC_BRIDGE
    let bridge = await deployBridgeContract(accounts[0],args);

    await writeConfig("0weth_config","1weth_config","SRC_BRIDGE",bridge.address);
    console.log("Bridge.address :" + bridge.address);
    console.log("");

    let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    args["bridgeAddress"] = srcBridge

    //SRC_HANDLER-ER20
    let ERC20Handler = await deployERC20Handler(accounts[0],args);
    await writeConfig("1weth_config","1weth_config","SRC_HANDLE_ER20",ERC20Handler.address);
    console.log("ERC20Handler.address :" + ERC20Handler.address);
    console.log("");

    await sleep(sleepTime);

}

const stepN2 = async (sleepTime) => {

    // let chainID = await getChainId();
    // console.log("chainID is :" + chainID);
    // let accounts = await ethers.getSigners()
   
    // let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    // let srcHandlerWETH = await readConfig("1weth_config","SRC_HANDLER_WETH");
    // let srcWETH = await readConfig("1weth_config","SRC_WETH");
    // //
    // args = {
    //     "chainId": chainID,
    //     "relayers":[accounts[0].address],
    //     "relayerThreshold":1,
    //     "fee":0,
    //     "expiry":100,
    //     "gasPrice":0x02540be400,
    //     "gasLimit":0x7a1200,

    //     "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
    //     "bridge":srcBridge,
    //     "handler":srcHandlerWETH,
    //     "targetContract":srcWETH
    // }

    // await registerResource(accounts[0],args);
    // console.log("");

    // await sleep(sleepTime)
    
}

//deposit
const stepN9 = async(sleepTime,amount,recipient) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()

    //
    args = {
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
        "dest":83,
        "amount":amount,
        "recipient":recipient
    }

    let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    args["bridgeAddress"] = srcBridge

    console.log("\n*************************check balance before****************************");
    let beforeEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("acount[0] eth  : " + beforeEthBalace);
   
    // prov = ethers.getDefaultProvider();
    // beforeEthBalace = await utils.formatEther(await prov.getBalance(srcBridge));
    // console.log("srcHandler eth : " + beforeEthBalace);

    console.log("**************************************************************************\n");
    
    //stop here
    const Factory__Bridge = await ethers.getContractFactory('Bridge',accounts[0])
    let bridgeInstance = await Factory__Bridge.connect(accounts[0]).attach(srcBridge);

    
    console.log(bridgeInstance.address);


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
    
    try{
        await accounts[0].sendTransaction({
            to: srcBridge, 
            value: args.amount,
         })
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
    sleep(sleepTime);

    console.log("\n*************************check balance after****************************");
    let afterEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("acount[0] eth  : " + afterEthBalace);
   
    //afterEthBalace =await ethers.provider.getBalance(srcBridge);
    afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(srcBridge));
    console.log("srcHandler eth : " + afterEthBalace);
    console.log("**************************************************************************\n");

    process.exit(0)

}

//deposit
const stepN10 = async(sleepTime,amount,recipient) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    console.log(accounts[2].address);

    //------------------
    let dstBridge = await readConfig("3weth_config","DST_BRIDGE");
    let dstERC20 = await readConfig("3weth_config","DST_ERC20");
    let dstHandlerERC20 = await readConfig("3weth_config","DST_HANDLER_ERC20");

    //
    args = {
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",

        "bridge":dstBridge,
        "dest":1,
        "amount":amount,
        "recipient":dstHandlerERC20,

        "erc20":dstERC20,
        "erc20Hander":dstHandlerERC20,
        "bridgeAddress":dstBridge
    }

    console.log("\n*************************check balance before****************************");
    let beforeEthBalace = await utils.formatEther(await accounts[2].getBalance());
    console.log("acount[2] eth  : " + beforeEthBalace);
   
    prov = ethers.getDefaultProvider();
    beforeEthBalace = await utils.formatEther(await prov.getBalance(dstBridge));
    console.log("srcHandler eth : " + beforeEthBalace);

    console.log("**************************************************************************\n");
    
    //stop here
    const Factory__Bridge = await ethers.getContractFactory('Bridge',accounts[2])
    let bridgeInstance = await Factory__Bridge.connect(accounts[2]).attach(dstBridge);    

    console.log("bridge is : " + dstBridge );
    console.log(bridgeInstance.address);

    try{
        // args = {
        //     "gasPrice":0x02540be400,
        //     "gasLimit":0x7a1200,
    
        //     "bridge":srcBridge,
        //     "recipient":srcHandlerWETH,
        //     "amount":amount,
        //     "wethAddress":srcWETH
        // }

        console.log('0');
        await approve(accounts[2],args);
        console.log('1');


        args["recipient"] = recipient
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
    await sleep(sleepTime);

    console.log("\n*************************check balance after****************************");
    let afterEthBalace = await utils.formatEther(await accounts[2].getBalance());
    console.log("acount[2] eth  : " + afterEthBalace);
   
    //afterEthBalace =await ethers.provider.getBalance(srcBridge);
    afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(dstBridge));
    console.log("srcHandler eth : " + afterEthBalace);
    console.log("**************************************************************************\n");


    process.exit(0)


}

//deposit
const tool = async(sleepTime,amount,recipient) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
   
    
    console.log(accounts[0].address);

    args = {
        "chainId": chainID,
        "relayers":[accounts[0].address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,

        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
    }

    //SRC_BRIDGE
    let bridge = await deployBridgeContract(accounts[0],args);

    await writeConfig("0weth_config","1weth_config","SRC_BRIDGE",bridge.address);
    console.log("Bridge.address :" + bridge.address);
    console.log("");

    let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    args["bridgeAddress"] = srcBridge

    //SRC_HANDLER-ER20
    let ERC20Handler = await deployERC20Handler(accounts[0],args);
    await writeConfig("1weth_config","1weth_config","SRC_HANDLE_ER20",ERC20Handler.address);
    console.log("ERC20Handler.address :" + ERC20Handler.address);
    console.log("");

    //SRC_HANDLER-WETH
    let WethHandler = await deployWETHHandler(accounts[0],args);
    await writeConfig("1weth_config","1weth_config","SRC_HANDLER_WETH",WethHandler.address);
    console.log("WETHHandler.address :" + WethHandler.address);
    console.log("");

    

    // args.amount = 10000000000000;
    let sendValue = utils.parseEther("1");
    try{
        await accounts[0].sendTransaction({
            to: srcBridge, 
            value: sendValue,
         })


        //stop here
        const Factory__Bridge = await ethers.getContractFactory('Bridge',accounts[0])
        let bridgeInstance = await Factory__Bridge.connect(accounts[0]).attach(srcBridge);

        let sendValue2 = utils.parseEther("0.03");
        // tx = await bridgeInstance._safeTransferETH(
        //     "0x4f2C793DB2163A7A081b984E6E8e2c504825668b",
        //     sendValue2,
        //     {
        //         gasPrice: args.gasPrice,
        //         gasLimit: args.gasLimit
        //     }
        // );

        await bridgeInstance.testLog(
            "0x4f2C793DB2163A7A081b984E6E8e2c504825668b",
            sendValue2,
            "0x1234",
            "0x5678905678905678905678905678901256789056789056789056789056789012",
            {
                gasPrice: args.gasPrice,
                gasLimit: args.gasLimit
            }
        );





        //console.log(tx);

        await sleep(sleepTime);

        let afterEthBalace = await utils.formatEther(await accounts[1].getBalance());
        console.log("acount[0] eth  : " + afterEthBalace);
        // Perform deposit
        // tx = await bridgeInstance.deposit(
        //     args.dest, // destination chain id
        //     args.resourceId,
        //     data,
        //     {
        //         gasPrice: args.gasPrice,
        //         gasLimit: args.gasLimit
        //     }
        // );
    } catch (e) {
        console.log("error ");
        console.log(e);
        //process.exit(0)
    }

}


module.exports = {
    step0,
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    step8,
    step9,
    stepN1,
    stepN2,
    stepN9,
    stepN10,
    tool
}