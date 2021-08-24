const EventEmitter = require('events').EventEmitter
const Pubsub = require('./pubsub')

// extended from Rmq - or else client, subscriber will be undefined
class Methods extends EventEmitter {
  // constructor will be initialized by super() in the parent
  // WARNING: methods not exposed here will be unavailable in the parent class
  constructor (client, options = {}) {
    super()
    const { subscriber, log } = options
    this.log = log
    this.client = client
    this.subscriber = subscriber

    if (subscriber) {
      // pubsub methods
      const pubsub = new Pubsub(subscriber, client, { log })
      this.subscribe = pubsub.subscribe
      this.publish = pubsub.publish
    }
  }
}

module.exports = Methods
