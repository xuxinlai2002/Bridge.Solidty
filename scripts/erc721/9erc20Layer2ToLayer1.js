const {
    layer2ToLayer1
} = require('../utils/runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("0.5");
    let fee = utils.parseEther("0.001");
    await layer2ToLayer1(5000,sendValue,fee,"ERC20");
    
}

main();
