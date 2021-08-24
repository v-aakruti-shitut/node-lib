const Log = require('@kelchy/log')
const utils = require('./utils')

class Pubsub {
  // requires subscriber and client
  constructor (subscriber, client, options = {}) {
    if (!subscriber) throw new Error('RMQ_PUBSUB_SUBSCRIBER_ERROR')
    if (!client) throw new Error('RMQ_PUBSUB_CLIENT_ERROR')
    this.subscriber = subscriber
    this.client = client
    this.log = Log.isValid(options.log) ? options.log : new Log.Empty()
  }

  // subscribing to a topic is disabled due to automatic subscription during setup
  // async subscribe (topic) {
  // }

  // function to allow application developer to publish messages to a channel
  async publish (exchange, routing, msg, options = {}) {
    this.log.debug(`RmqPublish ${exchange} ${routing}`, msg)
    return this.client.publish(exchange, routing, msg, utils.publishOptions(options))
  }
}

module.exports = Pubsub
