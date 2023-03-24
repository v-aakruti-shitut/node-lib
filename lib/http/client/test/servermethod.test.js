const Client = require('../index')
const Server = require('@kelchy/http-server')

const client = new Client()
const server = new Server(3080)
const url = 'http://localhost:3080'

afterAll(() => {
  server.conn.close()
})

describe('http method with axios', () => {
  test('http get with axios', async () => {
    server.app.get('/', (req, res) => {
      return res.status(200).json({ get: 'OK' })
    })
    const res = await client.get(url)
    expect(res).toEqual({ get: 'OK' })
  })
  test('http post with axios', async () => {
    server.app.post('/', (req, res) => {
      return res.status(200).json({ post: 'OK' })
    })
    const res = await client.post(url, { post: 'req' })
    expect(res).toEqual({ post: 'OK' })
  })
  test('http put with axios', async () => {
    server.app.put('/', (req, res) => {
      return res.status(200).json({ put: 'OK' })
    })
    const res = await client.put(url, { put: 'req' })
    expect(res).toEqual({ put: 'OK' })
  })
  test('http delete with axios', async () => {
    server.app.delete('/', (req, res) => {
      return res.status(200).json({ delete: 'OK' })
    })
    const res = await client.delete(url, { delete: 'req' })
    expect(res).toEqual({ delete: 'OK' })
  })
  test('http patch with axios', async () => {
    server.app.patch('/', (req, res) => {
      return res.status(200).json({ patch: 'OK' })
    })
    const res = await client.patch(url, { patch: 'req' })
    expect(res).toEqual({ patch: 'OK' })
  })
})
