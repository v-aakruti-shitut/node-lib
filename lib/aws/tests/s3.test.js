const S3 = require('../index').S3

jest.mock('aws-sdk', () => {
  const EventEmitter = require('events').EventEmitter
  const evt = new EventEmitter()
  evt.destroy = jest.fn()
  return {
    S3: class {
      constructor (params) {
        this.getObject = (params) => {
          this.getObjectParams = params
          return {
            createReadStream: () => {
              return evt
            }
          }
        }
        this.upload = (params, cb) => {
          if (params.Body.error) return cb(params.Body.error)
          cb(null, params)
        }
        this.deleteObject = (params, cb) => {
          if (params.VersionId === 'error') return cb(params.VersionId)
          cb(null, params)
        }
        this.listObjectVersions = (params, cb) => {
          if (params.Prefix === 'error') return cb(params.Prefix)
          cb(null, params)
        }
        this.params = params
        this.evt = evt
      }
    },
    Endpoint: class {
      constructor (endpoint) {
        this.endpoint = endpoint
      }
    }
  }
})

const s3 = new S3()

describe('', () => {
  test('constructor should return', async (done) => {
    expect(s3).toHaveProperty('client')
    done()
  })
  test('constructor with endpoint should call Endpoint', async (done) => {
    const s3e = new S3({ endpoint: 'dummy' })
    expect(s3e.client.params.endpoint.endpoint).toEqual('dummy')
    done()
  })
  test('getObject error should reject error', async (done) => {
    s3.getS3Object().catch(e => {
      expect(e).toEqual(new Error('error'))
      expect(s3.client.evt.destroy).toHaveBeenCalled()
      done()
    })
    s3.client.evt.emit('error', 'error')
  })
  test('chunks should resolve buffer', async (done) => {
    s3.getS3Object().then(res => {
      expect(res.toString('utf8')).toEqual('abcdef')
      expect(s3.client.evt.destroy).toHaveBeenCalled()
      done()
    })
    const a = ['ab', 'cd', 'ef']
    a.forEach(i => s3.client.evt.emit('data', Buffer.from(i)))
    s3.client.evt.emit('end')
  })
  test('getS3Object with versionId should pass to getObject', async (done) => {
    const bucket = 'bucket'
    const key = 'key'
    const versionId = '1234'
    s3.getS3Object(bucket, key, { versionId }).then(res => {
      expect(s3.client.getObjectParams).toEqual({ Bucket: bucket, Key: key, VersionId: versionId })
      done()
    })
    s3.client.evt.emit('end')
  })
  test('putS3Object error should return error', (done) => {
    const bucket = 'bucket'
    const key = 'key'
    const payload = { error: true }
    s3.putS3Object(bucket, key, payload).catch(err => {
      expect(err).toEqual(true)
      done()
    })
  })
  test('putS3Object should pass to upload', (done) => {
    const bucket = 'bucket'
    const key = 'key'
    const payload = { result: 1 }
    s3.putS3Object(bucket, key, payload).then(res => {
      expect(res).toEqual({ Bucket: bucket, Key: key, Body: payload })
      done()
    })
  })
  test('delS3Object error should return error', (done) => {
    const bucket = 'bucket'
    const key = 'key'
    const versionId = 'error'
    s3.delS3Object(bucket, key, { versionId }).catch(err => {
      expect(err).toEqual('error')
      done()
    })
  })
  test('delS3Object should pass to deleteObject', (done) => {
    const bucket = 'bucket'
    const key = 'key'
    s3.delS3Object(bucket, key).then(res => {
      expect(res).toEqual({ Bucket: 'bucket', Key: 'key' })
      done()
    })
  })
  test('listS3ObjectVersions error should return error', (done) => {
    const bucket = 'bucket'
    const prefix = 'error'
    s3.listS3ObjectVersions(bucket, prefix).catch(err => {
      expect(err).toEqual('error')
      done()
    })
  })
  test('listS3ObjectVersions should pass to listObjectVersions', (done) => {
    const bucket = 'bucket'
    const prefix = 'prefix'
    s3.listS3ObjectVersions(bucket, prefix).then(res => {
      expect(res).toEqual({ Bucket: bucket, Prefix: prefix })
      done()
    })
  })
})
