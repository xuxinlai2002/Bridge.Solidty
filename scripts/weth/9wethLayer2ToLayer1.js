const {
    layer2ToLayer1
} = require('../utils/runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("1");
    let fee = utils.parseEther("0.03");
    await layer2ToLayer1(10000,sendValue,fee,"WETH");




}

main();
