const {
    layer1ToLayer2
} = require('../utils/runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("10");
    let fee = utils.parseEther("0.002");
    await layer1ToLayer2(5000,sendValue,fee,"ERC721");

}

main();
