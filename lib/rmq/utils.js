class Utils {
  static queueOptions (options = {}) {
    const defaults = {
      confirm: true,
      durable: true,
      internal: false,
      autoDelete: false,
      expires: 10000
    }
    // this will override the defaults with anything set by developers
    return Object.assign(defaults, options)
  }

  static publishOptions (options = {}) {
    const defaults = {
      contentType: 'application/json',
      persistent: true
    }
    return Object.assign(defaults, options)
  }

  static exchangeOptions (options = {}) {
    const defaults = {
      durable: true,
      internal: false,
      autoDelete: false
    }
    // this will override the defaults with anything set by developers
    return Object.assign(defaults, options)
  }

  // this function creates the client handler to create amqp channels
  // options pubsub is to enable exchange bindings which will be used
  // by subscribers to listen on
  static getChannel (config, options) {
    return {
      json: true,
      setup: channel => {
        // 'channel' here is a regular amqplib 'ConfirmChannel'.
        const list = []
        // config can have 3 properties
        // queue - to define queue parameters
        // exchange - to define exchange parameters
        // bind - to bind above queue and exchange
        if (config.queue) {
          config.queue.forEach(queue => {
            list.push(channel.assertQueue(queue.name, Utils.queueOptions(queue.options)))
          })
        }
        // only if pubsub enabled
        if (options.pubsub) {
          // assert exhange
          if (config.exchange) {
            config.exchange.forEach(exchange => {
              list.push(channel.assertExchange(exchange.name, exchange.type, Utils.exchangeOptions(exchange.options)))
            })
          }
          // set prefetch
          list.push(channel.prefetch(options.prefetch || 1))
          if (config.bind) {
            config.bind.forEach(bind => {
              list.push(channel.bindQueue(bind.queue, bind.exchange, bind.pattern))
              // handle subscriptions
              list.push(channel.consume(bind.queue, (msg) => options.handler(bind.queue, msg)))
            })
          }
        }
        return Promise.all(list)
      }
    }
  }
}

module.exports = Utils
