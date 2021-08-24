const amqp = require('amqp-connection-manager')
const Log = require('@kelchy/log')
const Methods = require('./methods')
const utils = require('./utils')

class Rmq extends Methods {
  // supported options:
  // name - to identify the client if the application requires multiple clients
  // log - the logger object which is initialized from the log module
  constructor (rmquri, config, options = {}) {
    // if application developer initializes its own logger
    // and pass it to the constructor i.e. they need logging to stdout
    // it should have 3 functions out, debug and error, if not, do nothing
    const log = Log.isValid(options.log) ? options.log : new Log.Empty()

    let client = {}
    // separate connection for subscriber to increase performance
    let subscriber = {}

    // super() will expose parent properties and functions
    // required on class extends
    super(client, { subscriber, log })

    // check if the constructor was provided config
    // if not, we do nothing
    if (!config) return

    client = amqp.connect([rmquri]).createChannel(utils.getChannel(config, { prefetch: options.prefetch }))

    // send published messages to subscribers through internal emitter so application developers
    // will not be required to listen directly to the exposed subscriber client
    options.handler = (chan, msg) => {
      this.log.debug(`Publish ${chan}`, msg)
      this.emit(chan, msg)
    }

    subscriber = options.pubsub
      ? amqp.connect([rmquri])
        .createChannel(utils.getChannel(config, options))
      : undefined

    this.name = options.name || ''
    this.log = log
    this.client = client
    this.subscriber = subscriber

    // application might want to wait for RmqReady event before proceeding
    client.on('connect', () => {
      log.debug('RmqReady')
      this.emit('RmqReady')
    })

    // we don't want to throw errors everytime as we want to retry connections
    // instead of erroring out but application developer needs to know when this happens
    client.on('error', (err) => {
      log.error('RmqError', err)
      this.emit('RmqError', err.message)
    })
    client.on('end', () => {
      log.error('RmqEnd')
      this.emit('RmqEnd')
    })

    if (options.pubsub) {
      // application might want to wait for RmqSubscriberReady event before proceeding
      subscriber.on('connect', () => {
        log.debug('RmqSubscriberReady')
        this.emit('RmqSubscriberReady')
      })

      // we don't want to throw errors everytime as we want to retry connections
      // instead of erroring out but application developer needs to know when this happens
      subscriber.on('error', (err) => {
        log.error('RmqSubscriberError', err)
        this.emit('RmqSubscriberError', err.message)
      })
      subscriber.on('end', () => {
        log.error('RmqSubscriberEnd')
        this.emit('RmqSubscriberEnd')
      })
    }
  }
}

Rmq.queueOptions = utils.queueOptions
Rmq.publishOptions = utils.publishOptions
Rmq.exchangeOptions = utils.exchangeOptions

module.exports = Rmq
