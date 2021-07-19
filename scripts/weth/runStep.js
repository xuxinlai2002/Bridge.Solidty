const { ethers,network} = require('hardhat')
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
    sleep,
    getContractTx,
    getUnsignTx
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
var Web3 = require('web3')

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
const util = require('ethereumjs-util')
let privateKeyList = [
    "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5",
    "0xf143b04240e065984bc0507eb1583234643d64c948e1e0ae2ed4abf7d7aed06a",
    "0x49b9dd4e00cb10e691abaa1de4047f9c9d98b72b9ce43e1e12959b22f56a0289",
    "0x106a8e79c8f3f66ac4f315f9aad4642f6257f6dd74b8b2797039f5b9f1cb5436",
    "0x3c67b46b76449a01953f851a27a5c30ddf342f827388e44cebe6ec5371a7e3de",
    "0xdbe85cc4410ce6cabb534f60524f786f258b8d41f3d20f0cef58473215a7aa0a",
    "0xc099e29b876121b667fd564e03fdc811e23afefdc0bf24b81799e28a93ed3390",
    "0x5aac61d02d4e74c0e11c6fac18761fc467a6677941cadaf8c7b32e23105492c7",
    "0xaab34674114f423694b762def9ffc6a61d40c6b80c2c52fe24754393ed34b4ea",
    "0xe36161913a3e02a7fd6459b7465168e24d888a6255ca5da02c53ee92c4c5b59a",
    "0x8c9316f59648822a6e21983c04fe85bffcacd7205233db045c5f5f7ea3a023f5",
    "0x9828905708b9909d1a043aefd81bc4866f1d3d9ea6d6a17ed34abc11eaf3397a",
    "0xad3d24716cc2608e36316e5443fc20e23a2e5ab93d1371bcc0e331c4856ed438",
    "0x4ec084e990ed290cfb5e57f1eec801f704b6214db10bb90e5bf46904e1f924ab",
    "0xfe166d04f5a2ac6d64bfe7384ff4fc2756cd33b844682dbacc406ee4ad49c6fb",
    "0x184b0f563e4d3e345ffe04d6a6030a4b9d33f52625dbf0460b19290230fa665c",
    "0xcd3438afc409f5166035f40fd63f0243cc50be360301694468d96d115723e0bf",
    "0x7c56cbcaf9616135a9d090f3942b874397d7249468aa5c158de4fd7c124aa2de",
    "0xc9d3db4dea85377b8674015291806f18e94c912f1f203253cecde2f5ce395695",
    "0x76e99fc4b53086b7deb42abefa377d9648fc177dfc2e38279a89f9f641e88705",
    "0xe997fab5c06129c533f5656b1c27aa6c3cf620f4aea331b82d35fbb2b0328b4b",
    "0x7af2740545f1d8fbeaf0d385b596f125b9b6476307276681b88eef38acc6e42e",
    "0xf8750dd0f6c5d2f959f0b2ef5f14b393983bc417f4be7f75e44005ec9a044416",
    "0x4ded1bfcda22bcf90cede2cf32abd149a39a381cb2bd0a5125e06f5bfdea074e",
    "0x04064cf0cfb0c14e08432122ee35e80c1811ea5d039fab8b98c3be2d91607dd0",
    "0xeb78b86d4eb1c246847fa54861a31d8cf0294c612969f14eb94e6be919ab29dd",
    "0x94f1c124d696d08f1cd0c2bbfa9c9a5078c0aa6b04d4fb4a7b18d211415cffed",
    "0x434f0a747d74f29be0b28e478de538b1623edb7d0e3f1000c7e86872b6cf4738",
    "0xe862b48be321770fb002e1972ae71c5fc1848a225251642a1e76408686d98866",
    "0x03cae4498629d0d993886c924ee11a5a9fb3294ad671fbb8f1f088306c036f6c",
    "0xa02b07f741b4c62c5133fe010d994e2f7808e5619d6c4780455cda389072798e",
    "0xf431f6dea47d3d63d1b9cd2a198cfab2e0a11888d31695547bb17f68b3d6bda8",
    "0x967fd26d181c8a71113fd4a10281c60b94a03c716c590f28768a4ec41a71f66d",
    "0xbdd79d38ef7478ce08b3d8e6dc8a77f7e8b5221395a58c6d3e5e11eecf14d8a4",
    "0x42147830dc78017db789118d8aee808bec2822ea6808197a89b49c4b5118bb61",
    "0x9fa2ba4752d0f01110784b04b187e51aca5397f7f5f63cc697c119b3e040d41e"
]

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


    let publicKeys = [];
    for(var i = 0 ;i < privateKeyList.length ;i ++){
        let publicKey = util.bufferToHex(util.privateToPublic(privateKeyList[i]));
        publicKeys.push(publicKey);
    }

    const Factory__Bridge = await ethers.getContractFactory('Bridge',accounts[0])
    let bridgeInstance = await Factory__Bridge.connect(accounts[0]).attach(srcBridge);
    //console.log(publicKeys);
    await bridgeInstance.setAbiterList(
        publicKeys
    );

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

    console.log("xxl DST_BRIDGE workAccount start ...");
    console.log(workAccount.address);
    console.log("xxl DST_BRIDGE workAccount end ");
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


    let publicKeys = [];
    for(var i = 0 ;i < privateKeyList.length ;i ++){
        let publicKey = util.bufferToHex(util.privateToPublic(privateKeyList[i]));
        publicKeys.push(publicKey);
    }

    const Factory__Bridge = await ethers.getContractFactory('Bridge',workAccount)
    let bridgeInstance = await Factory__Bridge.connect(workAccount).attach(dstBridge);
    //console.log(publicKeys);
    await bridgeInstance.setAbiterList(
        publicKeys
    );

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
                "endpoint": "http://localhost:20636",
                "from": "0x41eA6aD88bbf4E22686386783e7817bB7E82c1ed",
                "opts": {
                    "http": "true",
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
                "endpoint": "http://localhost:21636",
                "from": "0x4f2C793DB2163A7A081b984E6E8e2c504825668b",
                "opts": {
                    "http": "true",
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
    
    let tofullPath = "/Users/xuxinlai/work/chainbridge/config.json"
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
const Bridge = require('../../artifacts/contracts/Bridge.sol/Bridge.json');
const privKey = "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5";
const stepN9 = async(sleepTime,amount,recipient) => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()

    //console.log(amount.toString());

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
   
    beforeEthBalace = await utils.formatEther(await ethers.provider.getBalance(srcBridge));
    console.log("srcHandler eth : " + beforeEthBalace);
    console.log("**************************************************************************\n");
    
    //stop here
    //const Factory__Bridge = await ethers.getContractFactory('Bridge',accounts[0])
    //let bridgeInstance = await Factory__Bridge.connect(accounts[0]).attach(srcBridge);

    let data = '0x' +
    ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
    //ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +   // len(recipientAddress) (32 bytes)
    args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)

    //add sign
    let l1URL = "http://localhost:20636";
    var web3 = new Web3(new Web3.providers.HttpProvider(l1URL));
    let msg = web3.utils.sha3(data);

    data += msg.substr(2);
    for(var i = 0 ;i < privateKeyList.length ;i ++){
        //let signature = await web3.eth.sign(msg,accounts[0].address)
        let sign = await web3.eth.accounts.sign(msg,privateKeyList[i])
        let publicKey = util.bufferToHex(util.privateToPublic(privateKeyList[i]));
        data += publicKey.substr(2) + sign.signature.substr(2)
    }
    ////

    console.log(`Constructed deposit:`)
    console.log(`Resource Id: ${args.resourceId}`)
    console.log(`Amount: ${args.amount.toHexString()}`)
    console.log(`len(recipient): ${(args.recipient.length - 2)/ 2}`)
    console.log(`Recipient: ${args.recipient}`)
    console.log(`Raw: ${data}`)
    console.log(`Creating deposit to initiate transfer!`);
    
    try{
        /////
        // await accounts[0].sendTransaction({
        //     to: srcBridge, 
        //     value: args.amount,
        //  })
        // // Perform deposit
        // tx = await bridgeInstance.deposit(
        //     args.dest, // destination chain id
        //     args.resourceId,
        //     data,
        //     {
        //         gasPrice: args.gasPrice,
        //         gasLimit: args.gasLimit
        //     }
        // );
        
        let params = [args.dest,args.resourceId,data];
        let contractTx = await getContractTx(
                Bridge.abi,
                srcBridge,
                "deposit",
                params,
                web3.eth
        );

        //console.log(contractTx.encodeABI());
        console.log("xxl 000 0");
        //const getUnsignTx = async(tx,from,to,value,chainID,gasLimit,eth) => {
        let unsignTx = await getUnsignTx(
                        contractTx,
                        accounts[0].address,
                        srcBridge,
                        amount.toString(),
                        82,
                        args.gasLimit,
                        web3.eth
                    );

        //console.log(unsignTx);
        console.log("xxl 000 1");
        
        var signTx = await web3.eth.accounts.signTransaction(unsignTx, privKey);
        //console.log(signTx);
        //console.log(signTx);
        console.log("xxl 000 2");

        let tx = await web3.eth.sendSignedTransaction(signTx.rawTransaction)
        console.log(tx.transactionHash);
        
    } catch (e) {
        console.log("error ");
        console.log(e);
    }

    await sleep(sleepTime);

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
        "dest":82,
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
        await approve(accounts[2],args);

        args["recipient"] = recipient
        let data = '0x' + 
        ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
        args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
    
        //add sign
        let l2URL = "http://localhost:21636";
        var web3 = new Web3(new Web3.providers.HttpProvider(l2URL));
        let msg = web3.utils.sha3(data);

        console.log("msg start ...");
        console.log(msg);
        console.log("msg end");

        data += msg.substr(2);
        for(var i = 0 ;i < privateKeyList.length ;i ++){
            //let signature = await web3.eth.sign(msg,accounts[0].address)
            let sign = await web3.eth.accounts.sign(msg,privateKeyList[i])
            let publicKey = util.bufferToHex(util.privateToPublic(privateKeyList[i]));
            data += publicKey.substr(2) + sign.signature.substr(2)
        }
        ////  
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


// const tool = async(sleepTime,amount,recipient) => {

//     let chainID = await getChainId();
//     console.log("chainID is :" + chainID);
//     let accounts = await ethers.getSigners()
//     let workAccount = accounts[1];
//     //console.log(accounts[0].address);


//     let dstBridge = await readConfig("3weth_config","DST_BRIDGE");

//     const Factory__Bridge = await ethers.getContractFactory('Bridge',workAccount)
//     let bridgeInstance = await Factory__Bridge.connect(workAccount).attach(dstBridge);
//     //console.log(publicKeys);

//     let args = {
//         "gasPrice":0x02540be400,
//         "gasLimit":124500000,
//         "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
//     }

//     //function voteProposal(uint8 chainID, uint64 depositNonce, bytes32 resourceID, bytes32 dataHash) external onlyRelayers whenNotPaused {
//     await bridgeInstance.voteProposal(
//         1,
//         2,
//         "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
//         "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
//         {
//             gasPrice: args.gasPrice,
//             gasLimit: args.gasLimit
//         }
//     );



// }

//deposit
const tool = async(sleepTime,amount,recipient) => {


    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    //console.log(accounts[0].address);

    args = {
        "chainId": chainID,
        "relayers":[accounts[0].address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":124500000,
        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
    }

    //SRC_BRIDGE
    let bridge = await deployBridgeContract(accounts[0],args);

    await writeConfig("0weth_config","1weth_config","SRC_BRIDGE",bridge.address);
    console.log("Bridge.address :" + bridge.address);
    console.log("");

    let srcBridge = await readConfig("1weth_config","SRC_BRIDGE");
    args["bridgeAddress"] = srcBridge

    // //SRC_HANDLER-ER20
    let ERC20Handler = await deployERC20Handler(accounts[0],args);
    //await writeConfig("1weth_config","1weth_config","SRC_HANDLE_ER20",ERC20Handler.address);
    console.log("ERC20Handler.address :" + ERC20Handler.address);
    console.log("");

    // //SRC_HANDLER-WETH
    // let WethHandler = await deployWETHHandler(accounts[0],args);
    // await writeConfig("1weth_config","1weth_config","SRC_HANDLER_WETH",WethHandler.address);
    // console.log("WETHHandler.address :" + WethHandler.address);
    // console.log("");
    // args.amount = 10000000000000;
    // let sendValue = utils.parseEther("1");

    // let prov = ethers.getDefaultProvider();
    // let web3 = new Web3(prov);
    var web3 = new Web3(network.provider)

    try{

        //function setAbiterList(bytes[] memory _pubKeyList)
        // let signs = [];
        // signs.push("0x77677f2e5a5b79c00be32027d0cde3746df316158fdacf875d37254a2afab225bfc867fa7366064dd6d5874b3f323e335f72a14fab6103b6f22cc1b1d41f14ba");
        
        // //set abiter list one item
        // await bridge.setAbiterList(
        //     signs
        // );
        //console.log(privateKeyList);
        
        //let publicKey = util.bufferToHex(util.privateToPublic(privateKeyList[0]));
        //console.log(publicKey);

        //1.xxl set Abiter List 
        let publicKeys = [];
        let signatures = [];
        let signer = [];
        for(var i = 0 ;i < privateKeyList.length ;i ++){

            let publicKey = util.bufferToHex(util.privateToPublic(privateKeyList[i]));
            publicKeys.push(publicKey);

        }

        //console.log(publicKeys);
        await bridge.setAbiterList(
            publicKeys
        );

        //2.set callback data
        let org = "0x000000000000000000000000000000000000000000000000002386f26fc1000046A26B330c0988a58aFF56e2a106F8256Ca89872"
        let msg = web3.utils.sha3(org);
        org += msg.substr(2);

        //console.log("js msg is : ");
        //console.log(msg);

        //console.log(org);
        for(var i = 0 ;i < privateKeyList.length ;i ++){
            //let signature = await web3.eth.sign(msg,accounts[0].address)
            let sign = await web3.eth.accounts.sign(msg,privateKeyList[i])
            org += publicKeys[i].substr(2) + sign.signature.substr(2)
            signatures.push(sign.signature);
            signer.push(accounts[i].address);
        }

        //console.log("js org is : ");
        //console.log(org);
        //3.call verify
        //bridge._verifyAbt(msg,signatures,publicKeys);
        // console.log("xxl js org is : ");
        // console.log(org);


        //4.call byte explose
        // console.log(org);
        // console.log(org.length);
        // console.log("test ...");
        await ERC20Handler.test(
            signer,
            org
        );


        // let org = "0x000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000001446A26B330c0988a58aFF56e2a106F8256Ca89872"
        // let msg = web3.utils.sha3(org);
        // let signature = await web3.eth.sign(msg,accounts[0].address)
        // console.log(accounts[0].address);
        // console.log(signature);
        

        // await bridge._verifySignature(
        //     msg,
        //     signature,
        //     accounts[0].address
        // );

        //stop here
        // const Erc20Handler__Bridge = await ethers.getContractFactory('ERC20Handler',accounts[0])
        // let erc20HandleInstance = await Erc20Handler__Bridge.connect(accounts[0]).attach(srcBridge);
        // console.log("test ...");
        // await ERC20Handler.test(
        //     "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
        //     "0x000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000001446A26B330c0988a58aFF56e2a106F8256Ca89872123456");

        // let sendValue2 = utils.parseEther("0.03");
        // tx = await bridgeInstance._safeTransferETH(
        //     "0x4f2C793DB2163A7A081b984E6E8e2c504825668b",
        //     sendValue2,
        //     {
        //         gasPrice: args.gasPrice,
        //         gasLimit: args.gasLimit
        //     }
        // );


        //stop here
        // const Factory__Bridge = await ethers.getContractFactory('Bridge',accounts[0])
        // let bridgeInstance = await Factory__Bridge.connect(accounts[0]).attach(srcBridge);

        // let sendValue2 = utils.parseEther("0.03");
        // tx = await bridgeInstance._safeTransferETH(
        //     "0x4f2C793DB2163A7A081b984E6E8e2c504825668b",
        //     sendValue2,
        //     {
        //         gasPrice: args.gasPrice,
        //         gasLimit: args.gasLimit
        //     }
        // );

        // await bridgeInstance.testLog(
        //     "0x4f2C793DB2163A7A081b984E6E8e2c504825668b",
        //     sendValue2,
        //     "0x1234",
        //     "0x5678905678905678905678905678901256789056789056789056789056789012",
        //     {
        //         gasPrice: args.gasPrice,
        //         gasLimit: args.gasLimit
        //     }
        // );

        // await bridgeInstance.wethExecuteProposal(
        //     "0x00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000000000000000001441ea6ad88bbf4e22686386783e7817bb7e82c1ed",
        //     {
        //         gasPrice: args.gasPrice,
        //         gasLimit: args.gasLimit
        //     }
        //  );


        // console.log(tx);
        // await sleep(sleepTime);

        // let afterEthBalace = await utils.formatEther(await accounts[1].getBalance());
        // console.log("acount[0] eth  : " + afterEthBalace);
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