const fs = require('fs')
const path = require('path')
const ethers = require('ethers');

const writeConfig = async (fromFile,toFile,key, value) => {

    let fromFullFile = path.resolve(__dirname, './' + fromFile + '.json')
    let contentText = fs.readFileSync(fromFullFile,'utf-8');
    let data = JSON.parse(contentText);
    data[key] = value;

    let toFullFile = path.resolve(__dirname, './' + toFile + '.json')
    fs.writeFileSync(toFullFile, JSON.stringify(data, null, 4), { encoding: 'utf8' }, err => {})

}

const readConfig = async (fromFile,key) => {

    let fromFullFile = path.resolve(__dirname, './' + fromFile + '.json')
    let contentText = fs.readFileSync(fromFullFile,'utf-8');
    let data = JSON.parse(contentText);
   
    return data[key];

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
    if(chainID == 42){
        url = "https://kovan.infura.io/v3/7e31d49d7c8a48f4a4539aff9da768e7";
    }
    provider = new ethers.providers.JsonRpcProvider(url);

    return provider;

}
const log = (msg) => console.log(`${msg}`)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

///






module.exports = {
    writeConfig,
    readConfig, 
    sleep,
    viewEvnt,
    waitForTx,
    log
}