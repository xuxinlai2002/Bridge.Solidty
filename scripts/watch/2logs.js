const Web3 = require('web3')
const web3 = new Web3('ws://localhost:21637')

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
      console.log(`New ${eventName}!`, eventObj.data)
      console.log("--------------------------------\n");
      
    }
  })
  subscribedEvents[eventName] = subscription
}

const {
  readConfig,
} = require('../utils/helper')

const main = async () => {
  
  console.log("****************xxl my2 log watch****************");
  let dstBridge = await readConfig("3weth_config","DST_BRIDGE");
  const bridgeInterface = require('../../artifacts/contracts/Bridge.sol/Bridge.json')
  bridgeInstance = new web3.eth.Contract(bridgeInterface.abi,dstBridge)
  subscribeLogEvent(bridgeInstance,"ShowLog");
  console.log("------subscribe dst bridge OK------");

  let dstHandlerERC20 = await readConfig("3weth_config","DST_HANDLER_ERC20");
  const erc20HandlerInterface = require('../../artifacts/contracts/handlers/ERC20Handler.sol/ERC20Handler.json')
  wethHandlerInstance = new web3.eth.Contract(erc20HandlerInterface.abi,dstHandlerERC20)
  //console.log(wethHandlerInstance);

  subscribeLogEvent(wethHandlerInstance,"ShowLog");
  console.log("------subscribe src handler erc20 OK------");


}

main();
