const MongoDB = require('mongodb')
const EventEmitter = require('events').EventEmitter
const Log = require('@kelchy/log')

class Mongo extends EventEmitter {
  constructor (uri, db, options = {}) {
    // if application developer initializes its own logger
    // and pass it to the constructor i.e. they need logging to stdout
    // it should have 3 functions out, debug and error, if not, do nothing
    const log = Log.isValid(options.log) ? options.log : new Log.Empty()

    super()
    // TODO: enforce params like poolsize, socketTimeoutMS, readPreference
    const client = new MongoDB.MongoClient(uri)
    client.connect().then(() => {
      client.db(db).command({ ping: 1 }).then(() => {
        this.emit('MongoReady')
      }).catch(e => log.error('MONGO_INIT_DB', e))
    }).catch(e => log.error('MONGO_INIT_CONNECT', e))

    this.client = client
    this.log = log
    this.ReadPreference = MongoDB.ReadPreference
  }
}

module.exports = Mongo
