const Rmq = require('../index')
const Log = require('@kelchy/log')
const Methods = require('../methods')
const Pubsub = require('../pubsub')

jest.setMock('amqplib', require('amqplib-mocks'))
const RMQ_URI = null
const config = {
  queue: [{ name: 'subqueue' }, { name: 'unsubqueue' }],
  exchange: [{ name: 'NotificationExch', type: 'direct' }],
  bind: [
    { exchange: 'NotificationExch', queue: 'subqueue', pattern: 'brm.add_on_subscription' },
    { exchange: 'NotificationExch', queue: 'unsubqueue', pattern: 'brm.add_on_unsubscription' }
  ]
}
const invalid = new Rmq(RMQ_URI)
const rmq = new Rmq(RMQ_URI, config)
const pubsub = new Rmq(RMQ_URI, config, { pubsub: true, log: new Log.Empty() })

describe('rmq tests', () => {
  test('constructor should return client', (done) => {
    expect(invalid).not.toHaveProperty('name')
    expect(rmq).toHaveProperty('name')
    expect(rmq).toHaveProperty('log')
    expect(rmq).toHaveProperty('client')
    expect(pubsub).toHaveProperty('name')
    expect(pubsub).toHaveProperty('log')
    expect(pubsub).toHaveProperty('client')
    expect(pubsub).toHaveProperty('subscriber')
    expect(new Methods(rmq.client)).toHaveProperty('log')
    expect(new Pubsub(pubsub.subscriber, pubsub.client)).toHaveProperty('log')
    try { new Pubsub(null, pubsub.client) } catch (e) { expect(e).toEqual(new Error('RMQ_PUBSUB_SUBSCRIBER_ERROR')) } // eslint-disable-line
    try { new Pubsub(pubsub.subscriber, null) } catch (e) { expect(e).toEqual(new Error('RMQ_PUBSUB_CLIENT_ERROR')) } // eslint-disable-line
    done()
  })
  test('queueOptions should return defaults combined with override', (done) => {
    const defaults = {
      autoDelete: false,
      confirm: true,
      durable: true,
      expires: 10000,
      internal: false
    }
    let options = Rmq.queueOptions()
    expect(options).toEqual(defaults)
    options = Rmq.queueOptions({ abc: 123 })
    expect(options).toEqual(Object.assign(defaults, { abc: 123 }))
    done()
  })
  test('publishOptions should return defaults combined with override', (done) => {
    const defaults = {
      contentType: 'application/json',
      persistent: true
    }
    let options = Rmq.publishOptions()
    expect(options).toEqual(defaults)
    options = Rmq.publishOptions({ abc: 123 })
    expect(options).toEqual(Object.assign(defaults, { abc: 123 }))
    done()
  })
  test('exchangeOptions should return defaults combined with override', (done) => {
    const defaults = {
      autoDelete: false,
      durable: true,
      internal: false
    }
    let options = Rmq.exchangeOptions()
    expect(options).toEqual(defaults)
    options = Rmq.exchangeOptions({ abc: 123 })
    expect(options).toEqual(Object.assign(defaults, { abc: 123 }))
    done()
  })
})
