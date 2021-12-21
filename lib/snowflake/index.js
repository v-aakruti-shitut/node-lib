const EventEmitter = require('events').EventEmitter
const snowflake = require('snowflake-sdk')
const Log = require('@kelchy/log')

class Snowflake extends EventEmitter {
  constructor (snowflakeOpts = {}, options = {}) {
    // if application developer initializes its own logger
    // and pass it to the constructor i.e. they need logging to stdout
    // it should have 3 functions out, debug and error, if not, do nothing
    const log = Log.isValid(options.log) ? options.log : new Log.Empty()

    const { account, username, password, authenticator } = snowflakeOpts

    // valdiate required snowflake creds
    // account and username are required
    if (!account || !username) {
      throw new Error('SNOWFLAKE_PARAMS_EMPTY')
      // password is required if authenticator not provided or is not equal to 'SNOWFLAKE'
    } else if ((!authenticator || String(authenticator).toUpperCase() !== 'SNOWFLAKE') && !password) {
      throw new Error('SNOWFLAKE_PASSWORD_EMPTY')
    }
    super()

    // create a Connection object that we can use later to connect
    // see https://docs.snowflake.com/en/user-guide/nodejs-driver-use.html#setting-the-connection-options for options
    const conn = snowflake.createConnection(snowflakeOpts)
    conn.connect(err => {
      if (err) {
        log.error('SNOWFLAKE_INIT_CONNECT', err)
      } else {
        log.out('connect db', 'Successfully connected to Snowflake')
        this.emit('SnowflakeReady')
      }
    })

    this.conn = conn
    this.log = log
  }

  /**
   *
   * @param {string} sqlText - sql query
   * @param {Array<number>} binds - numbers to replace in sql query e.g. for sqlText 'select * from emp where age = ?', use [18]
   * @returns {Promise<string>} result rows
   */
  async query (sqlText, binds) {
    return new Promise((resolve, reject) => {
      this.conn.execute({
        sqlText,
        binds,
        complete: (err, stmt, rows) => {
          if (err) reject(err)
          resolve(rows)
        }
      })
    })
  }
}

module.exports = Snowflake
