const AWS = require('aws-sdk')
const Log = require('@kelchy/log')
const common = require('@kelchy/common')

class SNS {
  constructor(accessKeyId, secretAccessKey, options = {}) {
    // if application developer initializes its own logger
    // and pass it to the constructor i.e. they need logging to stdout
    // it should have 3 functions out, debug and error, if not, error only
    this.log = Log.isValid(options.log) ? options.log : new Log.ErrorOnly()

    // log error but proceed, AWS SDK can take from env variable so they don't error out
    if (!accessKeyId || !secretAccessKey) {
      this.log.error('SESError', 'Empty Credentials')
    }
    // const credentials = new AWS.Credentials(accessKeyId, secretAccessKey)
    // set default but allow override of region and apiVersion
    const region = options.region || 'ap-southeast-1'
    const apiVersion = options.apiVersion || '2010-03-31'
    // const smsType = options.smsType || 'Transactional'
    const params = { region, apiVersion }
    this.client = new AWS.SNS(params)
    // .setSMSAttributes({
    //   attributes: { DefaultSMSType: smsType }
    // })
  }

  // function will send an sms
  // returns response data with messageId
  async send(PhoneNumber, Message, Subject) {
    if (!PhoneNumber || !Message || !Subject || typeof Message !== 'string') {
      throw Error('AWS SNS - invalid parameters')
    }
    const params = {
      Message,
      PhoneNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: Subject,
        },
      },
    }

    const { data, error } = await common.awaitWrap(
      this.client.publish(params).promise()
    )

    console.log(data)
    if (error) {
      this.log.error('SNS error', error.stack)
      throw error
    }

    return data
  }
}

module.exports = SNS
