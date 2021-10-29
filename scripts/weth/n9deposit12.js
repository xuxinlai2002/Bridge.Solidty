const {
    stepN9
} = require('./runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("0.1");
    await stepN9(15000,sendValue);

}

main();
