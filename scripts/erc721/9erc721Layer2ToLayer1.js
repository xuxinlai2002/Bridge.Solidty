const {
    erc721Layer2ToLayer1
} = require('../utils/runStep')

const { utils } = require('ethers')

const main = async () => {

    let fee = utils.parseEther("0.001");
    await erc721Layer2ToLayer1(10000,"0x12",fee,"ERC721");
    
}

main();
