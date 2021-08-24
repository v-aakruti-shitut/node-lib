const Log = require('@kelchy/log')
const common = require('@kelchy/common')
const utils = require('./utils')

class Write {
  constructor (client, options = {}) {
    // requires a redis client
    if (!client) throw new Error('REDIS_WRITE_CLIENT_ERROR')
    this.client = client
    this.log = Log.isValid(options.log) ? options.log : new Log.Empty()
  }

  // helper function to implement distributed locks on redis
  // returns OK if lock successful, null if somebody else got the lock
  async lock (key, ttl, options = {}) {
    if (!key || !ttl || !common.isInt(ttl)) throw new Error('REDIS_LOCK_KEY_TTL_INVALID')
    const tmpkey = `lock_${key}`
    const value = typeof options.value === 'object' ? JSON.stringify(options.value) : options.value
    const { data, error } = await common.awaitWrap(this.set(tmpkey, value, { ttl, nx: true }), { timeout: 1000 })
    if (error) {
      this.client.pipeline([['del', tmpkey]]).exec()
      throw error
    }
    if (!data) {
      this.log.error('Redis lock', `Possible anomaly, data is empty - ${key}`)
      this.client.pipeline([['del', tmpkey]]).exec()
      return null
    }
    return utils.result(data)
  }

  // helper function to unlock, same as del
  // returns result array from del
  async unlock (key, options = {}) {
    const tmpkey = `lock_${key}`
    return this.del(tmpkey, options)
  }

  // set key
  // return result array
  async set (key, value, options = {}) {
    const ops = [['set', key, value]]
    // because NX and XX are mutually exclusive
    if (options.ttl) ops[0] = ops[0].concat(['EX', options.ttl])
    if (options.nx) ops[0].push('NX')
    else if (options.xx) ops[0].push('XX')
    return this.client.pipeline(ops).exec()
  }

  // del key
  // return result array
  async del (key) {
    const ops = [['del', key]]
    return this.client.pipeline(ops).exec()
  }

  // set key in hash
  // return result array
  async hset (key, hkey, hvalue, options = {}) {
    const ops = [['hset', key, hkey, hvalue]]
    if (options.ttl) ops.push(['expire', key, options.ttl])
    return this.client.pipeline(ops).exec()
  }

  // del key in hash
  // return result array
  async hdel (key, hkey) {
    const ops = [['hdel', key, hkey]]
    return this.client.pipeline(ops).exec()
  }

  // set multiple keys in hash
  // return result array
  async hmset (key, obj, options = {}) {
    const ops = [['hmset', key, obj]]
    if (options.ttl) ops.push(['expire', key, options.ttl])
    return this.client.pipeline(ops).exec()
  }

  // set multiple keys
  // return result array
  async mset (obj, options = {}) {
    const ops = [['mset', obj]]
    if (options.ttl) ops.push(['expire', obj, options.ttl])
    return this.client.pipeline(ops).exec()
  }

  // increment key
  // return result array
  async incr (key, options = {}) {
    const ops = [['incr', key]]
    if (options.ttl) ops.push(['expire', key, options.ttl])
    return this.client.pipeline(ops).exec()
  }

  // increment key in hash
  // return result array
  async hincrby (key, hkey, hvalue, options = {}) {
    const ops = [['hincrby', key, hkey, hvalue]]
    if (options.ttl) ops.push(['expire', key, options.ttl])
    return this.client.pipeline(ops).exec()
  }

  // push at the tail of the list stored at key
  // list must be an array
  // return result array
  async rpush (key, list, options = {}) {
    if (!list || !Array.isArray(list)) throw new Error('REDIS_RPUSH_LIST_INVALID')
    const ops = []
    list.forEach((item) => {
      ops.push(['rpush', key, item])
    })
    if (options.ttl) ops.push(['expire', key, options.ttl])
    return this.client.pipeline(ops).exec()
  }

  // remove the cound of elements which match value from list stored at key
  // return result array
  async lrem (key, count, element, options = {}) {
    const ops = [['lrem', key, parseInt(count), element]]
    return this.client.pipeline(ops).exec()
  }

  // add members to set stored at key
  // list must be an array
  // return result array
  async sadd (key, list, options = {}) {
    if (!list || !Array.isArray(list)) throw new Error('REDIS_SADD_LIST_INVALID')
    const ops = [(['sadd', key]).concat(list)]
    if (options.ttl) ops.push(['expire', key, options.ttl])
    return this.client.pipeline(ops).exec()
  }
}

module.exports = Write
