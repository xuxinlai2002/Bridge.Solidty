const { ethers} = require('hardhat')
const {
    deployBridgeContract,
    deployERC20Handler,
    deployWETHHandler,
    deployWETH,
    deployERC20,
    attachERC20
} = require("../utils/deploy")

const {
    writeConfig,
    readConfig,
    sleep,
    getContractTx,
    getUnsignTx,
    getGlobalObj,
    getConfigFile
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


//
const step0 = async (sleepTime,token) => {

    let {accounts,args,tokenInfo} = await getGlobalObj(token);
    let  configC0 = "0_config";
    let config0 = getConfigFile("0",token);

    args["name"] = await readConfig(configC0,tokenInfo.name);
    args["symbol"] = await readConfig(configC0,tokenInfo.symbol);

    let tokenContract;
    if(token == "ERC20" || token == "WETH"){
        tokenContract = await deployERC20(accounts[0],args)
    }

    await writeConfig(configC0, config0 ,tokenInfo.srcToken ,tokenContract.address);
    console.log(token + ".address :" + tokenContract.address);
    console.log("");

    await sleep(sleepTime);
}

const mintToken = async (sleepTime,token,amount) => {

    let {accounts,tokenInfo} = await getGlobalObj(token);
    let config0 = getConfigFile("0",token);

    let tokenAddress = await readConfig(config0,tokenInfo.srcToken);
    let tokenContract

    if(token == "ERC20" || token == "WETH"){
        tokenContract = await attachERC20(accounts[0],tokenAddress);
    }
    
    let tx = await tokenContract.mint(accounts[0].address,amount);
      await sleep(sleepTime);
    console.log(tx.hash)

    let balance = await tokenContract.balanceOf(accounts[0].address);

    console.log("account", accounts[0].address, "balance", Number(balance.toString())/1e18);
}


const step1 = async (sleepTime,token) => {

    let {accounts,args} = await getGlobalObj(token);
    let config0 = getConfigFile("0",token);
    let config1 = getConfigFile("1",token);

    args["superAddress"] = accounts[0].address
    //SRC_BRIDGE
    let bridge = await deployBridgeContract(accounts[0],args);
    await writeConfig(config0,config1,"SRC_BRIDGE",bridge.address);

    console.log("Bridge.address :" + bridge.address);
    console.log("");
    
    await sleep(sleepTime);
}

const step2 = async (sleepTime,token) => {

    let {accounts,args,tokenInfo} = await getGlobalObj(token);
    let config1 = getConfigFile("1",token);
    let config2 = getConfigFile("2",token);

    let srcBridge = await readConfig(config1,"SRC_BRIDGE");
    args["bridgeAddress"] = srcBridge

    //SRC_HANDLER-WETH
    let handler;

    if(token == "WETH"){
        handler = await deployWETHHandler(accounts[0],args);
    }else if(token == "ERC20"){
        handler = await deployERC20Handler(accounts[0],args);
    }else{
        console.log("xxl ...");
    }
    
    await writeConfig(
        config1,
        config2,
        tokenInfo.srcHandler,handler.address
    );

    console.log(token + "handler.address :" + handler.address);
    console.log("");

    await sleep(sleepTime);

}

const step3 = async (sleepTime,token) => {

    let {accounts,args,tokenInfo} = await getGlobalObj(token);
    let config2 = getConfigFile("2",token);
    let srcBridge = await readConfig(config2,"SRC_BRIDGE");
    let srcHandler = await readConfig(config2,tokenInfo.srcHandler);
    let srcToken = await readConfig(config2,tokenInfo.srcToken);
    
    args = {
        "bridge":srcBridge,
        "handler":srcHandler,
        "targetContract":srcToken,
        "resourceId":tokenInfo.resourceId,
    }

    await registerResource(accounts[0],args);
    console.log("");

    await sleep(sleepTime)

}

//
const step4 = async (sleepTime,token) => {

    let {accounts,args,tokenInfo} = await getGlobalObj(token);
    let workAccount = accounts[0];
    args[ "relayers"] = [workAccount.address];

    let config2 = getConfigFile("2",token);
    let config4 = getConfigFile("4",token);

    args["superAddress"] = accounts[0].address
    //DST_BRIDGE
    let Bridge = await deployBridgeContract(workAccount,args);
    await writeConfig(config2,config4,"DST_BRIDGE",Bridge.address);
    console.log("Bridge.address :" + Bridge.address);
    console.log("");
    args["bridgeAddress"] = Bridge.address
    
    let handler;
    if(token == "ERC20" || token == "WETH"){
        handler = await deployERC20Handler(workAccount,args);
    }
    
    await writeConfig(config4,config4,tokenInfo.dstHandler,handler.address);
    console.log(token + "Handler.address :" + handler.address);
    console.log("");

    //DST_ERC20
    let tokenContract
    args["name"] = await readConfig(config4,tokenInfo.name);
    args["symbol"] = await readConfig(config4,tokenInfo.symbol);
    if(token == "ERC20" || token == "WETH"){
        tokenContract = await deployERC20(workAccount,args);
    }

    await writeConfig(config4,config4,tokenInfo.dstToken,tokenContract.address);
    console.log(token + ".address :" + tokenContract.address);
    console.log("");

    await sleep(sleepTime)

}

const step5 = async (sleepTime,token) => {

    let {accounts,args,tokenInfo} = await getGlobalObj(token);
    let workAccount = accounts[0];

    let config4 = getConfigFile("4",token);
    let dstBridge = await readConfig(config4,"DST_BRIDGE");
    let dstHandler = await readConfig(config4,tokenInfo.dstHandler);
    let dstToken = await readConfig(config4,tokenInfo.dstToken);
    
    args = {
        "relayers":workAccount.address,
        "bridge":dstBridge,
        "handler":dstHandler,
        "targetContract":dstToken,
        "resourceId":tokenInfo.resourceId
    }
    await registerResource(workAccount,args);
    await sleep(sleepTime)

}

const step6 = async (sleepTime,token) => {

    let {accounts,args,tokenInfo} = await getGlobalObj(token);
    let workAccount = accounts[0];
    let gasLimit = args.gasLimit

    let config4 = getConfigFile("4",token);
    let dstBridge = await readConfig(config4,"DST_BRIDGE");
    let dstHandler = await readConfig(config4,tokenInfo.dstHandler);
    let dstToken = await readConfig(config4,tokenInfo.dstToken);
    //
    args = {
        "relayers":workAccount.address,
        "bridge":dstBridge,
        "handler":dstHandler,
        "targetContract":dstToken,
        "gasLimit": gasLimit
    }

    await setBurn(workAccount,args);

    await sleep(sleepTime)
   

}

const step7 = async (sleepTime,token) => {

    let {accounts,args,tokenInfo} = await getGlobalObj(token);
    let workAccount = accounts[0];

    let config4 = getConfigFile("4",token);
    let dstHandler = await readConfig(config4,tokenInfo.dstHandler);
    let dstToken = await readConfig(config4,tokenInfo.dstToken);

    args = {
        "minter":dstHandler,
        "erc20Address":dstToken
    }

    await addMinter(workAccount,args);
    await sleep(sleepTime)
   

}

//deposit
const Bridge = require('../../artifacts/contracts/Bridge.sol/Bridge.json');
const { exit } = require('process')
const privKey = "0x9aede013637152836b14b423dabef30c9b880ea550dbec132183ace7ca6177ed";
const layer1ToLayer2 = async(sleepTime,amount,fee,token) => {

    let {accounts,args} = await getGlobalObj(token);    
    args["dest"] = 83;
    args["amount"] = amount;

    let config4 = getConfigFile("4",token);
    let srcBridge = await readConfig(config4,"SRC_BRIDGE");


    //////////////////////////

    let {tokenInfo} = await getGlobalObj(token);
    let config0 = getConfigFile("0",token);

    let tokenAddress = await readConfig(config0,tokenInfo.srcToken);
    let tokenContract
     console.log("tokenAddress", tokenAddress)
    if(token == "ERC20" || token == "WETH"){
        tokenContract = await attachERC20(accounts[0],tokenAddress);
    }
     args["erc20"] = tokenContract.address;
    let name = await tokenContract.name();

    let balance = await tokenContract.balanceOf(accounts[0].address);

    console.log("account", accounts[0].address,"tokenName", name, "token balance", Number(balance.toString())/1e18);

    ////////////////////////

    console.log("\n*************************check balance before****************************");
    let beforeEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("acount[0] eth  : " + beforeEthBalace);
   
    beforeEthBalace = await utils.formatEther(await ethers.provider.getBalance(srcBridge));
    console.log("srcBridge eth : " + beforeEthBalace);
    console.log("**************************************************************************\n");
    
    let data = '0x' +
    ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +
    ethers.utils.hexZeroPad(fee, 32).substr(2) 
    let total = amount.add(fee);

    console.log(`Constructed deposit:`)
    console.log(`Resource Id: ${args.resourceId}`)
    console.log(`Amount: ${args.amount.toHexString()}`)
    console.log(`Raw: ${data}`)
    console.log(`Creating deposit to initiate transfer!`);
    console.log("xxl srcBrdige : " + srcBridge);
    console.log("xxl total : " + total.toString());

    //add src hander approve
    let srcHandler = await readConfig(config4,tokenInfo.srcHandler);
    let erc20 = await readConfig(config4,tokenInfo.srcToken);
    args["recipient"] = srcHandler
    args["erc20"] = erc20
    await approve(accounts[0],args);

    try{
          
        let l1URL = "http://localhost:1111";
        let params = [args.dest,args.resourceId,data];

        var web3 = new Web3(new Web3.providers.HttpProvider(l1URL));
        let contractTx = await getContractTx(
                Bridge.abi,
                srcBridge,
                "deposit",
                params,
                web3.eth
        );
 
        console.log("xxl getContractTx ");
        let unsignTx = await getUnsignTx(
                        contractTx,
                        accounts[0].address,
                        srcBridge,
                        total.toString(),
                        args.dest,
                        args.gasLimit,
                        web3.eth
                    );    
        console.log("xxl getUnsignTx ");
        console.log(unsignTx);

        var signTx = await web3.eth.accounts.signTransaction(unsignTx, privKey);
        console.log("xxl signTransaction ");
        let tx = await web3.eth.sendSignedTransaction(signTx.rawTransaction)
        console.log("xxl sendSignedTransaction ");
        console.log(tx);
        
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
const layer2ToLayer1 = async(sleepTime,amount,fee,token) => {


    let {accounts,args,tokenInfo} = await getGlobalObj(token);    
    let config4 = getConfigFile("4",token);

    //------------------
    let dstBridge = await readConfig(config4,"DST_BRIDGE");
    let dstToken = await readConfig(config4,tokenInfo.dstToken);
    let dstHandler = await readConfig(config4,tokenInfo.dstHandler);

    //
    args = {
        ...args,
        "dest":1,
        "amount":amount,
        "fee":fee,
        "recipient":dstHandler,
        "bridge":dstBridge,
        "erc20":dstToken,
        "erc20Hander":dstHandler,
        "bridgeAddress":dstBridge
    }

    console.log("\n*************************check balance before****************************");
    let beforeEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("acount[2] eth  : " + beforeEthBalace);
   
    prov = ethers.getDefaultProvider();
    beforeEthBalace = await utils.formatEther(await prov.getBalance(dstBridge));
    console.log("dstBridge eth : " + beforeEthBalace);
    console.log("**************************************************************************\n");
    
    //stop here
    const Factory__Bridge = await ethers.getContractFactory('Bridge',accounts[0])
    let bridgeInstance = await Factory__Bridge.connect(accounts[0]).attach(dstBridge);    

    console.log("bridge is : " + dstBridge );
    try{

        if(token != "WETH"){
            console.log("xxl come to erc20 logic ...");
            //approve erc20
            await approve(accounts[0],args,false);

            let configWeth4 = getConfigFile("4","WETH");
            let wethERC20 = await readConfig(configWeth4,"DST_ERC20");
            let wethHandler = await readConfig(configWeth4,"DST_HANDLER_ERC20");
            let amount = utils.parseEther("1");
            //approve weth
            let wethArgs = {
                erc20:wethERC20,
                recipient:wethHandler,
                amout:amount,
                fee:0
            }
            await approve(accounts[0],wethArgs,false);
        }else{
            await approve(accounts[0],args);
        }
        

        const data = '0x' + 
        ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +
        ethers.utils.hexZeroPad(fee, 32).substr(2)
    
        console.log(`Constructed deposit:`)
        console.log(`Resource Id: ${args.resourceId}`)
        console.log(`Amount: ${args.amount.toHexString()}`)
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


        let re2 = await tx.wait();
        console.log(re2);
        
    } catch (e) {
        console.log("error ");
        console.log(e);
    }

    //sleep(sleepTime);
    await sleep(sleepTime);

    console.log("\n*************************check balance after****************************");
    let afterEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("acount[2] eth  : " + afterEthBalace);
   
    //afterEthBalace =await ethers.provider.getBalance(srcBridge);
    afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(dstBridge));
    console.log("srcHandler eth : " + afterEthBalace);
    console.log("**************************************************************************\n");

    process.exit(0)


}

const setFee = async(fee) => {

    let {accounts} = await getGlobalObj("WETH");
    let config4 = getConfigFile("4","WETH");
    let dstBridge = await readConfig(config4,"DST_BRIDGE");

    const Factory__Bridge = await ethers.getContractFactory('Bridge',accounts[0])
    let bridgeInstance = await Factory__Bridge.connect(accounts[0]).attach(dstBridge);    

    console.log("bridge is : " + dstBridge + " fee " + utils.parseEther(fee));
    console.log(bridgeInstance.address);
    let result = await bridgeInstance.adminChangeFee(
        utils.parseEther(fee),
        {
            gasPrice: 0x02540be400,
            gasLimit: 0x7a1200
        }
    )

    let recipient = await result.wait()
    console.log(recipient);

}


const changeSuperSigner = async(newSuperSigner, nodePublickey) => {

    let {accounts} = await getGlobalObj("WETH");
    let config4 = getConfigFile("4","WETH");
    let dstBridge = await readConfig(config4,"DST_BRIDGE");

    const Factory__Bridge = await ethers.getContractFactory('Bridge',accounts[0])
    let bridgeInstance = await Factory__Bridge.connect(accounts[0]).attach(dstBridge);    

    console.log("bridge is : " + dstBridge + " newSuperSigner " + newSuperSigner);

    let npbk = Buffer.from(nodePublickey,"hex");
    let result = await bridgeInstance.changeSuperSigner(
        newSuperSigner, npbk,
        {
            gasPrice: 0x02540be400,
            gasLimit: 0x7a1200
        }
    )

    let recipient = await result.wait()
    console.log(recipient);

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
    
    layer1ToLayer2,
    layer2ToLayer1,

    setFee,
    changeSuperSigner,
    mintToken

}