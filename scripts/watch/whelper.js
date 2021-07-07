// Subscriber method
const subscribeLogEvent = (contract, eventName) => {

  
  const subscribedEvents = {}
  const eventJsonInterface = web3.utils._.find(
    contract._jsonInterface,
    o => o.name === eventName && o.type === 'event',
  )

  //console.log(eventJsonInterface);

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
      console.log(`New ${eventName}!`, eventObj)
    }
  })
  subscribedEvents[eventName] = subscription
  console.log("subscribe OK");
}



module.exports = {
  subscribeLogEvent
}