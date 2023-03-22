const Client = require('../index')
const Server = require('@kelchy/http-server')

const client = new Client()

describe('http method with axios', () => {
  test('http put with axios', async () => {
    const url = 'http://localhost:3080'
    const server = new Server(3080)
    server.app.put('/', (req, res) => {
      return res.status(200).json({ put: 'OK' })
    })
    const res = await client.put(url, { put: 'req' })
    expect(res).toEqual({ put: 'OK' })
    server.conn.close()
  })
})
