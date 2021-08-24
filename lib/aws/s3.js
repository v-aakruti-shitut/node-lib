const AWS = require('aws-sdk')

class S3 {
  constructor (options = {}) {
    // set default but allow override of region and apiVersion
    const region = options.region || 'ap-southeast-1'
    const apiVersion = options.apiVersion || '2006-03-01'
    const params = { region, apiVersion }
    if (options.endpoint) params.endpoint = new AWS.Endpoint(options.endpoint)

    this.client = new AWS.S3(params)
  }

  // function will return buffer payload
  // application developer need to do a .toString('utf8') to convert to string
  // returns payload, with or without content, or throws error
  getS3Object (bucket, key, options = {}) {
    // promisify
    return new Promise((resolve, reject) => {
      const { versionId } = options
      const params = { Bucket: bucket, Key: key }
      if (versionId) params.VersionId = versionId
      const readStream = this.client.getObject(params).createReadStream()
      readStream.on('error', error => {
        readStream.destroy()
        reject(new Error(error))
      })
      const chunks = []
      // chunks can come in stream, collect into an array
      readStream.on('data', (chunk) => {
        chunks.push(chunk)
      })
      readStream.on('end', () => {
        // once done, combine the collected data into a single buffer
        const input = Buffer.concat(chunks)
        readStream.destroy()
        resolve(input)
      })
    })
  }

  // function to upload payload to s3
  putS3Object (bucket, key, payload) {
    // promisify
    return new Promise((resolve, reject) => {
      this.client.upload({ Bucket: bucket, Key: key, Body: payload }, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  // function to delete an object, optional versionId which will just delete a specific version
  delS3Object (bucket, key, options = {}) {
    // promisify
    return new Promise((resolve, reject) => {
      const { versionId } = options
      const params = { Bucket: bucket, Key: key }
      if (versionId) params.VersionId = versionId
      this.client.deleteObject(params, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  // function to retrieve versioning details of an object(s) which starts with a prefix
  listS3ObjectVersions (bucket, prefix) {
    // promisify
    return new Promise((resolve, reject) => {
      this.client.listObjectVersions({ Bucket: bucket, Prefix: prefix }, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }
}

module.exports = S3
