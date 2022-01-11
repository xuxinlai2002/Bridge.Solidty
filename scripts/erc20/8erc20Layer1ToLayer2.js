const {
    layer1ToLayer2
} = require('../utils/runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("10");
    let fee = utils.parseEther("0.002");
    curNum = 2;
    await layer1ToLayer2(15000,sendValue,fee,"ERC20",curNum);

}

main();
