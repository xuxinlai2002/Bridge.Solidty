const {
    stepN9
} = require('./runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("0.1");
    let fee = utils.parseEther("0.0002");
    await stepN9(15000,sendValue,fee);

}

main();
