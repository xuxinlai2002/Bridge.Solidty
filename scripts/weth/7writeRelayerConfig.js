const fs = require('fs')

const {
    readConfig,
} = require('./utils/helper')


const main = async () => {
    

    let srcBridge = await readConfig("1config","SRC_BRIDGE");
    let srcHandler721 = await readConfig("1config","SRC_HANDLER721");
 
    let dstBridge = await readConfig("3config","DST_BRIDGE");
    let dstHandler721 = await readConfig("3config","DST_HANDLER721");
 
    toData = {
        "chains":[
           {
                "name": "Uptick",
                "type": "ethereum",
                "id": "82",
                "endpoint": "ws://localhost:20637",
                "from": "0x41eA6aD88bbf4E22686386783e7817bB7E82c1ed",
                "opts": {
                    "bridge": srcBridge,
                    "erc20Handler": "0x944f5d5e96d831016dc95ab7d65b2de297f7c608",
                    "erc721Handler": srcHandler721,
                    "genericHandler": srcHandler721,
                    "gasLimit": "1000000",
                    "maxGasPrice": "10000000000",
                    "blockConfirmations":"1"
                }

           },{
                "name": "Kovan",
                "type": "ethereum",
                "id": "42",
                "endpoint": "wss://kovan.infura.io/ws/v3/7e31d49d7c8a48f4a4539aff9da768e7",
                "from": "0x4f2C793DB2163A7A081b984E6E8e2c504825668b",
                "opts": {
                    "bridge": dstBridge,
                    "erc20Handler": "0x29d1fE90Ab3DC3Ce22e851e140086807bCb26421",
                    "erc721Handler": dstHandler721,
                    "genericHandler": dstHandler721,
                    "gasLimit": "1000000",
                    "maxGasPrice": "10000000000",
                    "blockConfirmations":"1"
                }
           } 
        ]

    }
    
    
    let tofullPath = "/Users/xuxinlai/my/work/uptickService/chainbridge/config.json"
    fs.writeFileSync(tofullPath, JSON.stringify(toData, null, 4), { encoding: 'utf8' }, err => {})


}

main();

