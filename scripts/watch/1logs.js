const Web3 = require('web3')
const web3 = new Web3('ws://localhost:20637')

// a list for saving subscribed event instances
const subscribedEvents = {}
// Subscriber method
const subscribeLogEvent = (contract, eventName) => {

  const eventJsonInterface = web3.utils._.find(
    contract._jsonInterface,
    o => o.name === eventName && o.type === 'event',
  )

  const subscription = web3.eth.subscribe('logs', {
    address: contract.options.address,
    topics: [eventJsonInterface.signature]
  }, (error, result) => {

    if (!error) {
      const eventObj = web3.eth.abi.decodeLog(
        eventJsonInterface.inputs,
        result.data,
        result.topics.slice(1)
      )
      console.log(``, eventObj.data)
      console.log("--------------------------------\n");
    }
  })
  subscribedEvents[eventName] = subscription
}

const {
  readConfig,
} = require('../utils/helper')

const main = async () => {
  
  console.log("****************xxl my1 log watch****************");
  let srcBridge = await readConfig("3weth_config","SRC_BRIDGE");
  const bridgeInterface = require('../../artifacts/contracts/Bridge.sol/Bridge.json')
  bridgeInstance = new web3.eth.Contract(bridgeInterface.abi,srcBridge)
  subscribeLogEvent(bridgeInstance,"LogString");
  console.log("------subscribe src bridge OK------");

  let srcHandlerWeth = await readConfig("3weth_config","SRC_HANDLER_WETH");
  console.log(srcHandlerWeth);
  const wethHandlerInterface = require('../../artifacts/contracts/handlers/WETHHandler.sol/WETHHandler.json')
  wethHandlerInstance = new web3.eth.Contract(wethHandlerInterface.abi,srcHandlerWeth)
  //console.log(wethHandlerInstance);
  subscribeLogEvent(wethHandlerInstance,"LogString");
  console.log("------subscribe src handler weth OK------");


}

main();
