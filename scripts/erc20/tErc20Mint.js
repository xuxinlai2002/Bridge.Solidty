const {
    mintToken
} = require('../utils/runStep')

const { utils } = require('ethers')

const main = async () => {

    let amount = utils.parseEther("1000");
    await mintToken(1000,"ERC20",amount);

}

main();
