const {
    layer1ToLayer2
} = require('../utils/runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("100");
    let fee = utils.parseEther("0.0002");
    //let fee = 0;
    await layer1ToLayer2(10000,sendValue,fee,"WETH");

}

main();
