const Rmq = require('../index')

jest.mock('amqp-connection-manager', () => {
  return {
    connect: () => {
      return {
        createChannel: (arg) => {
          const EventEmitter = require('events').EventEmitter
          const evt = new EventEmitter()
          evt.publish = (exchange, routing, msg, options) => {
            evt.emit(exchange, msg)
          }
          evt.testEmit = (chan, msg) => {
            evt.emit(chan, msg)
          }
          evt.testChannel = () => {
            const channel = {
              assertQueue: (name, options) => { evt.emit('assertQueue', name) },
              assertExchange: (name, type, options) => { evt.emit('assertExchange', name) },
              bindQueue: (queue, exchange, pattern) => { evt.emit('bindQueue', queue) },
              prefetch: (num) => { evt.emit('prefetch', num) },
              consume: (queue, f) => {
                evt.emit('consume', queue)
                f('chan', 'msg')
              }
            }
            arg.setup(channel).then(() => {})
          }
          return evt
        }
      }
    }
  }
})

const config = {
  queue: [{ name: 'subqueue' }, { name: 'unsubqueue' }],
  exchange: [{ name: 'NotificationExch', type: 'direct' }],
  bind: [
    { exchange: 'NotificationExch', queue: 'subqueue', pattern: 'brm.add_on_subscription' },
    { exchange: 'NotificationExch', queue: 'unsubqueue', pattern: 'brm.add_on_unsubscription' }
  ]
}

const rmq = new Rmq('', config)
const pubsub = new Rmq(null, config, { pubsub: true })

describe('rmq events tests', () => {
  test('client connect event should emit', (done) => {
    const connect = jest.fn()
    rmq.on('RmqReady', connect)
    rmq.client.testEmit('connect')
    rmq.removeListener('RmqReady', connect)
    expect(connect).toHaveBeenCalled()
    rmq.client.testChannel() // useless, just for coverage
    done()
  })
  test('client error event should emit', (done) => {
    const error = jest.fn()
    rmq.on('RmqError', error)
    rmq.client.testEmit('error', new Error())
    rmq.removeListener('RmqError', error)
    expect(error).toHaveBeenCalled()
    done()
  })
  test('client end event should emit', (done) => {
    const end = jest.fn()
    rmq.on('RmqEnd', end)
    rmq.client.testEmit('end')
    rmq.removeListener('RmqEnd', end)
    expect(end).toHaveBeenCalled()
    done()
  })
  test('subscriber connect event should emit', (done) => {
    const connect = jest.fn()
    pubsub.on('RmqSubscriberReady', connect)
    pubsub.subscriber.testEmit('connect')
    pubsub.removeListener('RmqSubscriberReady', connect)
    expect(connect).toHaveBeenCalled()
    done()
  })
  test('suscriber error event should emit', (done) => {
    const error = jest.fn()
    pubsub.on('RmqSubscriberError', error)
    pubsub.subscriber.testEmit('error', new Error())
    pubsub.removeListener('RmqSubscriberError', error)
    expect(error).toHaveBeenCalled()
    done()
  })
  test('subscriber end event should emit', (done) => {
    const end = jest.fn()
    pubsub.on('RmqSubscriberEnd', end)
    pubsub.subscriber.testEmit('end')
    pubsub.removeListener('RmqSubscriberEnd', end)
    expect(end).toHaveBeenCalled()
    done()
  })
  test('publish handler should emit', (done) => {
    const publish = jest.fn()
    pubsub.client.on('exchange', publish)
    pubsub.publish('exchange', 'routing', 'msg')
    pubsub.removeListener('exchange', publish)
    expect(publish).toHaveBeenCalledWith('msg')
    done()
  })
  test('setup channel assertQueue should add queue', (done) => {
    const sub = new Rmq(null, { queue: config.queue }, { pubsub: true })
    const assertQueue = jest.fn()
    sub.subscriber.on('assertQueue', assertQueue)
    sub.subscriber.testChannel()
    sub.removeListener('assertQueue', assertQueue)
    expect(assertQueue).toHaveBeenCalledWith('subqueue')
    done()
  })
  test('setup channel assertExchange should add exchange', (done) => {
    const sub = new Rmq(null, { exchange: config.exchange }, { pubsub: true })
    const assertExchange = jest.fn()
    sub.subscriber.on('assertExchange', assertExchange)
    sub.subscriber.testChannel()
    sub.removeListener('assertExchange', assertExchange)
    expect(assertExchange).toHaveBeenCalledWith('NotificationExch')
    done()
  })
  test('setup channel bindQueue should bind queue to exchange', (done) => {
    const sub = new Rmq(null, {
      queue: config.queue,
      exchange: config.exchange,
      bind: config.bind
    }, { pubsub: true })
    const bindQueue = jest.fn()
    sub.subscriber.on('bindQueue', bindQueue)
    sub.subscriber.testChannel()
    sub.removeListener('bindQueue', bindQueue)
    expect(bindQueue).toHaveBeenCalledWith('subqueue')
    done()
  })
  test('setup channel consume should subscribe to topic', (done) => {
    const sub = new Rmq(null, config, { pubsub: true })
    const consume = jest.fn()
    sub.subscriber.on('consume', consume)
    sub.subscriber.testChannel()
    sub.removeListener('consume', consume)
    expect(consume).toHaveBeenCalledWith('subqueue')
    done()
  })
})
