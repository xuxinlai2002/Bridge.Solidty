const {
    stepN9
} = require('./runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("0.01");
    await stepN9(3000,sendValue,"0x46A26B330c0988a58aFF56e2a106F8256Ca89872");

}

main();
