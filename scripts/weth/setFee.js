const {
    setFee
} = require('./runStep')

const main = async () => {

    await setFee(0.0001);

}

main();
