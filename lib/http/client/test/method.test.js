const Log = require('@kelchy/log')
const Method = require('../method')
const Client = require('../index')
const axios = require('axios')
jest.mock('axios')
axios.mockResolvedValue({ data: {} })

const client = new Client()
const url = 'http://www.domain.com'

describe('http method tests', () => {
  test('new empty instance should have minimal properties: log, timeout', (done) => {
    const method = new Method()
    expect(method).toHaveProperty('log')
    expect(method).toHaveProperty('timeout')
    done()
  })
  test('instance with log should have minimal properties: log, timeout', (done) => {
    const log = new Log.Standard()
    const method = new Method({ log })
    expect(method).toHaveProperty('log')
    expect(method).toHaveProperty('timeout')
    done()
  })
  test('get should get', async () => {
    const res = await client.get(url)
    expect(res).toEqual({})
  })
  test('post should post', async () => {
    const res = await client.post(url)
    expect(res).toEqual({})
  })
  test('put should put', async () => {
    const res = await client.put(url)
    expect(res).toEqual({})
  })
  test('patch should patch', async () => {
    const res = await client.patch(url)
    expect(res).toEqual({})
  })
  test('delete should delete', async () => {
    const res = await client.delete(url)
    expect(res).toEqual({})
  })
  test('axios error should error', async () => {
    const err = {
      config: {
        url: 'url',
        method: 'method',
        headers: {}
      }
    }
    axios.mockRejectedValue(err)
    expect(client.get(url)).rejects.toEqual(err)
  })
})
