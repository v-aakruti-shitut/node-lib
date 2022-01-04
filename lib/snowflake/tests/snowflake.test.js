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

describe('snowflake tests', () => {
  test('incorrect params should throw error', (done) => {
    try { new Snowflake() } catch (e) { expect(e).toEqual(new Error('SNOWFLAKE_PARAMS_EMPTY')) } //eslint-disable-line
    try { new Snowflake({account: 'test', username: 'test' }) } catch (e) { expect(e).toEqual(new Error('SNOWFLAKE_PASSWORD_EMPTY')) } //eslint-disable-line
    try { new Snowflake({account: 'test', username: 'test', authenticator: 'test' }) } catch (e) { expect(e).toEqual(new Error('SNOWFLAKE_PASSWORD_EMPTY')) } //eslint-disable-line
    try { new Snowflake({account: 'test', username: 'test', authenticator: 123 }) } catch (e) { expect(e).toEqual(new Error('SNOWFLAKE_PASSWORD_EMPTY')) } //eslint-disable-line
    done()
  })

  test('incorrect snowflake creds should log error', (done) => {
    const log = new Log.Standard()
    const snow = new Snowflake({ account: 'incorrect', username: 'incorrect', password: 'incorrect ' }, { log })
    setTimeout(() => {
      expect(snow.log).toEqual(log)
      expect(console.error).toHaveBeenCalledTimes(1)
      done()
    }, 1000)
  })

  test('correct snowflake creds should emit', (done) => {
    const snow = new Snowflake({ account: 'correct', username: 'correct', password: 'correct' })
    snow.on('SnowflakeReady', () => {
      done()
    })
  })

  test('query function should return array of objects', (done) => {
    expect(sf.query('select * from employees', [])).resolves.toEqual([{ field_1: 'test' }])
    expect(sf.query('error', [])).rejects.toEqual(new Error('error'))
    done()
  })
})
