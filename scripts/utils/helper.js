const { ethers: hEether } = require('hardhat');
const fs = require('fs')
const path = require('path')
const ethers = require('ethers');
var Web3 = require('web3')

const writeConfig = async (fromFile,toFile,key, value) => {

    let fromFullFile = path.resolve(getConfigPath(), './' + fromFile + '.json')
    let contentText = fs.readFileSync(fromFullFile,'utf-8');
    let data = JSON.parse(contentText);
    data[key] = value;

    let toFullFile = path.resolve(getConfigPath(), './' + toFile + '.json')
    fs.writeFileSync(toFullFile, JSON.stringify(data, null, 4), { encoding: 'utf8' }, err => {})

}

const readConfig = async (fromFile,key) => {

    let fromFullFile = path.resolve(getConfigPath(), './' + fromFile + '.json')
    let contentText = fs.readFileSync(fromFullFile,'utf-8');
    let data = JSON.parse(contentText);
    return data[key];

}

const getConfigPath = () => {

    //return "scripts/config"
    return path.resolve(__dirname, '..') + "/config"
}

const viewEvnt = async (chainID,hash) => {

    provider = getProvider(chainID);
    console.log(`viewEvnt for tx: ${hash}...`)
    let receipt = await provider.getTransactionReceipt(hash)

    console.log(receipt.logs);
    
    const filterTopic = "0xb8b0bec99e7876c1728715ff6cb0f34c58be33a61d8031c6b5c25918b5c36b42";
    const steps = [];
    
    for(var i = 0 ;i < receipt.logs.length ;i ++){

        if(receipt.logs[i].topics[0] == filterTopic){
            steps.push(receipt.logs[i].data);
        }
    }

    console.log(steps);

}

const waitForTx = async (chainID,hash) => {

    provider = getProvider(chainID);
    console.log(`Waiting for tx: ${hash}...`)

    while (!await provider.getTransactionReceipt(hash)) {
        sleep(5000)
    }
}

function getProvider(chainID){

    let url = "http://localhost:20636";
    if(chainID == 83){
        url = "http://localhost:21636";
    }
    provider = new ethers.providers.JsonRpcProvider(url);

    return provider;

}
const log = (msg) => console.log(`${msg}`)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

///

const getContractTx = async(abi,addresss,funcName,params,eth) =>{

    const callContract = new eth.Contract(
      abi,
      addresss
    );
  
    const tx = await callContract.methods[funcName](
      ...params
    );
  
    return tx;
}


const getUnsignTx = async(tx,from,to,value,chainID,gasLimit,eth) => {

    try{
  
        const gasPrice = await eth.getGasPrice();
        const data = tx.encodeABI();
        const n = await eth.getTransactionCount(from);
        
        console.log("xxl getUnsignTx nonce is : " + n );
        //TODO
        const unsignedTx = {
            from:from,
            to:to, 
            value:value,
            data:data,
            gasPrice:gasPrice,
            gasLimit:gasLimit,
            chainId:chainID
        };
        return unsignedTx;
  
    }catch(e){
      return null;
    }

}


// getSign
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
    // "0xad3d24716cc2608e36316e5443fc20e23a2e5ab93d1371bcc0e331c4856ed438",
    // "0x4ec084e990ed290cfb5e57f1eec801f704b6214db10bb90e5bf46904e1f924ab",
    // "0xfe166d04f5a2ac6d64bfe7384ff4fc2756cd33b844682dbacc406ee4ad49c6fb",
    // "0x184b0f563e4d3e345ffe04d6a6030a4b9d33f52625dbf0460b19290230fa665c",
    // "0xcd3438afc409f5166035f40fd63f0243cc50be360301694468d96d115723e0bf",
    // "0x7c56cbcaf9616135a9d090f3942b874397d7249468aa5c158de4fd7c124aa2de",
    // "0xc9d3db4dea85377b8674015291806f18e94c912f1f203253cecde2f5ce395695",
    // "0x76e99fc4b53086b7deb42abefa377d9648fc177dfc2e38279a89f9f641e88705",
    // "0xe997fab5c06129c533f5656b1c27aa6c3cf620f4aea331b82d35fbb2b0328b4b",
    // "0x7af2740545f1d8fbeaf0d385b596f125b9b6476307276681b88eef38acc6e42e",
    // "0xf8750dd0f6c5d2f959f0b2ef5f14b393983bc417f4be7f75e44005ec9a044416",
    // "0x4ded1bfcda22bcf90cede2cf32abd149a39a381cb2bd0a5125e06f5bfdea074e",
    // "0x04064cf0cfb0c14e08432122ee35e80c1811ea5d039fab8b98c3be2d91607dd0",
    // "0xeb78b86d4eb1c246847fa54861a31d8cf0294c612969f14eb94e6be919ab29dd",
    // "0x94f1c124d696d08f1cd0c2bbfa9c9a5078c0aa6b04d4fb4a7b18d211415cffed",
    // "0x434f0a747d74f29be0b28e478de538b1623edb7d0e3f1000c7e86872b6cf4738",
    // "0xe862b48be321770fb002e1972ae71c5fc1848a225251642a1e76408686d98866",
    // "0x03cae4498629d0d993886c924ee11a5a9fb3294ad671fbb8f1f088306c036f6c",
    // "0xa02b07f741b4c62c5133fe010d994e2f7808e5619d6c4780455cda389072798e",
    // "0xf431f6dea47d3d63d1b9cd2a198cfab2e0a11888d31695547bb17f68b3d6bda8"
]

const getSign = async(chainId,depositNonce,resourceId,data) => {
    // console.log(data);

    let hexUnit8ChainID = ethers.utils.hexZeroPad("0x" + parseInt(chainId).toString(16),32).substr(2);
    let hexUnit64DepositNonce = ethers.utils.hexZeroPad("0x" + parseInt(depositNonce).toString(16),32).substr(2);
    let hexMsg = "0x" + hexUnit8ChainID + hexUnit64DepositNonce  + resourceId.substr(2) + data.substr(2)

    //add sign
    var web3 = new Web3();
    //let msg = web3.utils.sha3(hexMsg);
    // console.log("hex msg detail : " + hexMsg);
    // console.log("sh3 msg : " + msg);
    let msg = "0x58f3459b79ba07bbc238bcdc13e0c9d685eae546df3c18021a02596d10b30914"

    let sign = [];
    for(var i = 0 ;i < privateKeyList.length ;i ++){
    //for(var i = 0 ;i < 1 ;i ++){
        let eachSign = await web3.eth.accounts.sign(msg,privateKeyList[i])
        sign.push(eachSign.signature);
    }

    return sign;

}

///
const getSuperAbiterSign = async() => {


    //
    privateKey = "0xcb93f47f4ae6e2ee722517f3a2d3e7f55a5074f430c9860bcfe1d6d172492ed0";
    let msg = "0x58f3459b79ba07bbc238bcdc13e0c9d685eae546df3c18021a02596d10b30914"
    var web3 = new Web3();
    let superSign = await web3.eth.accounts.sign(msg,privateKey)

    return superSign.signature;

}



const getSignBatch = async(chainId,depositNonce,resourceId,data) => {

    console.log(data);

    let hexUnit8ChainID = ethers.utils.hexZeroPad("0x" + parseInt(chainId).toString(16),32).substr(2);
    let hexMsg = "0x" + hexUnit8ChainID 

    let txLen = depositNonce.length;
    for(let i = 0 ;i < txLen ;i ++){

        let hexUnit64DepositNonce = ethers.utils.hexZeroPad("0x" + parseInt(depositNonce[i]).toString(16),32).substr(2);
        hexMsg +=  hexUnit64DepositNonce  + resourceId[i].substr(2) + data[i].substr(2)

    }

    //add sign
    var web3 = new Web3();
    //let msg = web3.utils.sha3(hexMsg);
    let msg = "0x58f3459b79ba07bbc238bcdc13e0c9d685eae546df3c18021a02596d10b30914"

    console.log("js " + msg);
    // console.log("hex msg detail : " + hexMsg);
    // console.log("sh3 msg : " + msg);

    let sign = [];
    for(var i = 0 ;i < privateKeyList.length ;i ++){
    //for(var i = 0 ;i < 1 ;i ++){
        let eachSign = await web3.eth.accounts.sign(msg,privateKeyList[i])
        sign.push(eachSign.signature);
    }

    return sign;

}



const util = require('ethereumjs-util');
const { sign } = require('crypto');
const getAbiterList = () => {

    let addressList = [];
    let len = privateKeyList.length;

    for(var i = 0 ; i < len ;i ++){

        let pubKey = util.bufferToHex(util.privateToPublic(privateKeyList[i]));
        let address = util.bufferToHex(util.pubToAddress(pubKey, true))
        addressList.push(address);

    }

    return addressList;
   

}


const getAbiterSign = async(addressList) => {
    // console.log(data);

    let data = "0x";
    for(var i = 0 ;i < addressList.length ;i ++){

        data += addressList[i].substr(2);
    }

    //add sign
    var web3 = new Web3();
    let msg = web3.utils.sha3(data);

    let sign = [];
    for(var i = 0 ;i < privateKeyList.length ;i ++){
    //for(var i = 0 ;i < 1 ;i ++){
        let eachSign = await web3.eth.accounts.sign(msg,privateKeyList[i])
        sign.push(eachSign.signature);
    }

    return sign;

}


const WethResourceId = "0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8";
const Erc20ResourceId = "0x0000000000000000000000000000000000000000000000000000000000000001";
const getGlobalObj = async(token) => {

    let chainId = await getChainId();
    console.log("chainID is :" + chainId);

    let accounts = await hEether.getSigners()
    let args = {
        "chainId": chainId,
        "relayers":[accounts[0].address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200
    }
    let resourceId ;
    let dstHander;
    let dstToken;
    if(token == "ERC20"){
        resourceId = Erc20ResourceId;
        dstHander = "DST_HANDLER_ERC20"
        dstToken = "DST_ERC20"
    }else if(token == "WETH"){
        resourceId = WethResourceId;
        dstHander = "DST_HANDLER_ERC20"
        dstToken = "DST_ERC20"
    }else{
        console.log("no token");
    }


    tokenInfo = {
        "name":"NAME_" + token,
        "symbol":"SYMBOL_" + token,
        "baseConfigFile" : token.toLowerCase() + "_config",
        "srcToken":"SRC_" + token,
        "srcHandler":"SRC_HANDLER_" + token,
        "resourceId":resourceId,
        "dstHandler":dstHander,
        "dstToken":dstToken,
        "tokenList":["erc20","weth"]
    }

    return {
        chainId,
        accounts,
        tokenInfo,
        args
    }

}

module.exports = {
    writeConfig,
    readConfig, 
    sleep,
    viewEvnt,
    waitForTx,
    log,
    getContractTx,
    getUnsignTx,
    getSign,
    getSignBatch,
    getAbiterList,
    getAbiterSign,
    getSuperAbiterSign,

    getGlobalObj
}