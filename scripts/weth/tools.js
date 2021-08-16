const util = require('ethereumjs-util')
const {
    deployBridgeContract
} = require("../utils/deploy");

// node
const EthCrypto = require('eth-crypto');

const main = async () => {

    //tool();
    
    let chainID = await getChainId();
    console.log("chainID is :" + chainID);

    let accounts = await ethers.getSigners()
    let deployer = accounts[0]

    console.log("aaa ....");
    let privateKey = "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5";
    console.log("私钥是 : " + privateKey );
    let pubKey = util.bufferToHex(util.privateToPublic(privateKey));
    console.log("公钥是未压缩 : " +pubKey );

    let comPubKey = "0x" + EthCrypto.publicKey.compress(pubKey.substr(2));
    console.log("公钥是压缩 : " +comPubKey );

    args = {
        "chainId": chainID,
        "relayers":[accounts[0].address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
    }

    console.log("main start ...");
    try{
        //SRC_BRIDGE
        let bridge = await deployBridgeContract(deployer,args);
        let address = await bridge.getAddressFromPublicKey(comPubKey);
        console.log("地址是 ：" + address);

    }catch(e){

        console.log(e);

    }


}

main();