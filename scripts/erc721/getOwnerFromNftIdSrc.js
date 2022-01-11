const {
    getNftFromId
} = require('../utils/runStep')

const main = async () => {

    await getNftFromId(17,true);

}

main();
