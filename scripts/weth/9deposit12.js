const { ethers} = require('hardhat')

const {
    readConfig,
    sleep, 
    viewEvnt
} = require('./utils/helper')

const {
    deposit
} = require("./utils/erc721")

const main = async () => {


    let chainID = await getChainId();
    let accounts = await ethers.getSigners()

    let srcBridge = await readConfig("1config","SRC_BRIDGE");
    let srcHandler721 = await readConfig("1config","SRC_HANDLER721");
    let srcToken721 = await readConfig("1config","SRC_TOKEN721");
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
        "handler":srcHandler721,
        "targetContract":srcToken721,

        "recipient":srcHandler721,
        "id":0x14,
        "erc721Address":srcToken721,
        "dest":42
    }

    let hash = await deposit(accounts[0],args);

    await sleep(5000)
    await viewEvnt(chainID,hash);

}

main();

