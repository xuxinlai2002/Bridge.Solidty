const {
    addErc20Src
} = require('../utils/runStep')

const { utils } = require('ethers')

let resourceID = "0x0000000000000000000000000000000000000000000000000000000000000002"

const main = async () => {

    let sendValue = utils.parseEther("1000");
    //const addSrcToken = async(sleepTime,token,params) => {

    let params = {
        "name":"ERC202",
        "symbol":"ERC202",
        "resourceId":resourceID,
        "amount":sendValue
    }

    //const addSrcToken = async(sleepTime,token,params) => {
    await addErc20Src(5000,"ERC20",params);
    
}

main();
