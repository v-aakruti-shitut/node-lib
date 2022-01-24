const Snowflake = require('../index')
const Log = require('@kelchy/log')

const sf = new Snowflake({ account: 'test', username: 'test', password: 'test' })

jest.spyOn(console, 'error').mockImplementation()

jest.mock('snowflake-sdk', () => {
  return {
    createConnection: (options) => {
      const { account, username, password } = options
      return {
        connect: (x) => {
          // decouple from the current event loop, simulate actual connect
          setImmediate(() => {
            if (account === 'incorrect' || username === 'incorrect' || password === 'incorrect') {
              x(new Error('error'))
            } else {
              x(null, {})
            }
          })
        },
        execute: ({ sqlText, binds, complete }) => {
          if (sqlText === 'error') {
            complete(new Error('error'))
          }
          const rows = [{ field_1: 'test' }]
          complete(null, null, rows)
        }
      }
    }
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('constructor()', () => {
  test('should throw error on incorrect params', (done) => {
    try { new Snowflake() } catch (e) { expect(e).toEqual(new Error('SNOWFLAKE_PARAMS_EMPTY')) } //eslint-disable-line
    try { new Snowflake({account: 'test', username: 'test' }) } catch (e) { expect(e).toEqual(new Error('SNOWFLAKE_PASSWORD_EMPTY')) } //eslint-disable-line
    try { new Snowflake({account: 'test', username: 'test', authenticator: 'test' }) } catch (e) { expect(e).toEqual(new Error('SNOWFLAKE_PASSWORD_EMPTY')) } //eslint-disable-line
    try { new Snowflake({account: 'test', username: 'test', authenticator: 123 }) } catch (e) { expect(e).toEqual(new Error('SNOWFLAKE_PASSWORD_EMPTY')) } //eslint-disable-line
    done()
  })

  test('should log error on incorrect snowflake creds', (done) => {
    const log = new Log.Standard()
    const snow = new Snowflake({ account: 'incorrect', username: 'incorrect', password: 'incorrect ' }, { log })
    setTimeout(() => {
      expect(snow.log).toEqual(log)
      expect(console.error).toHaveBeenCalledTimes(1)
      done()
    }, 1000)
  })

  test('should emit on correct snowflake creds', (done) => {
    const snow = new Snowflake({ account: 'correct', username: 'correct', password: 'correct' })
    snow.on('SnowflakeReady', () => {
      done()
    })
  })
})

describe('query()', () => {
  test('should return array of objects', (done) => {
    expect(sf.query('select * from employees', [])).resolves.toEqual([{ field_1: 'test' }])
    expect(sf.query('error', [])).rejects.toEqual(new Error('error'))
    done()
  })
})

describe('parseConnStr()', () => {
  test('should return creds on correct connection string', (done) => {
    const username = 'test_username'
    const password = 'test_password'
    const account = 'test_account'
    const role = 'test_role'
    const warehouse = 'test_warehouse'
    const database = 'test_database'
    const schema = 'test_schema'

    const connStr = `snowflake://${username}:${password}@${account}.snowflakecomputing.com/?role=${role}&warehouse=${warehouse}&database=${database}&schema=${schema}`

    const results = Snowflake.parseConnStr(connStr)

    expect(results.username).toStrictEqual(username)
    expect(results.password).toStrictEqual(password)
    expect(results.account).toStrictEqual(account)
    expect(results.role).toStrictEqual(role)
    expect(results.warehouse).toStrictEqual(warehouse)
    expect(results.database).toStrictEqual(database)
    expect(results.schema).toStrictEqual(schema)

    done()
  })

  test('should return null account on invalid connection string', (done) => {
    const username = 'test_username'
    const password = 'test_password'
    const account = 'test_account'
    const role = 'test_role'
    const warehouse = 'test_warehouse'
    const database = 'test_database'
    const schema = 'test_schema'

    const connStr = `snowflake://${username}:${password}@${account}.invalid.com/?role=${role}&warehouse=${warehouse}&database=${database}&schema=${schema}`

    const results = Snowflake.parseConnStr(connStr)

    expect(results.username).toStrictEqual(username)
    expect(results.password).toStrictEqual(password)
    expect(results.account).toStrictEqual(null)
    expect(results.role).toStrictEqual(role)
    expect(results.warehouse).toStrictEqual(warehouse)
    expect(results.database).toStrictEqual(database)
    expect(results.schema).toStrictEqual(schema)

    done()
  })
})
