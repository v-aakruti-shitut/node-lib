const Log = require('@kelchy/log')

class Pubsub {
  // requires subscriber and client
  constructor (subscriber, client, options = {}) {
    if (!subscriber) throw new Error('REDIS_PUBSUB_SUBSCRIBER_ERROR')
    if (!client) throw new Error('REDIS_PUBSUB_CLIENT_ERROR')
    this.subscriber = subscriber
    this.client = client
    this.log = Log.isValid(options.log) ? options.log : new Log.Empty()
  }

  // before we can receive events for a pubsub channel, application developer need to
  // explicitly subscribe to a channel
  async subscribe (chan) {
    this.log.debug('RedisSubscribe', chan)
    return this.subscriber.subscribe(chan)
  }

  // function to allow application developer to publish messages to a channel
  async publish (chan, msg) {
    this.log.debug(`RedisPublish ${chan}`, msg)
    return this.client.publish(chan, msg)
  }
}

module.exports = Pubsub
