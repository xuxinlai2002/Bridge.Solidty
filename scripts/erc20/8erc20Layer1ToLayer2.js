const {
    layer1ToLayer2
} = require('../utils/runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("0.1");
    let fee = utils.parseEther("0.0002");
    await layer1ToLayer2(1500,sendValue,fee,"ERC20");

}

main();
