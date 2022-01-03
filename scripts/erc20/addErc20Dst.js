const {
    addErc20Dst
} = require('../utils/runStep')

const { utils } = require('ethers')

let resourceID = "0x0000000000000000000000000000000000000000000000000000000000000002"
const main = async () => {


    let sendValue = utils.parseEther("10");

    let params = {
        "name":"ERC202",
        "symbol":"ERC202",
        "resourceId":resourceID,
        "amount":sendValue
    }

    //const addSrcToken = async(sleepTime,token,params) => {
    await addErc20Dst(5000,"ERC20",params);
    
}

main();
