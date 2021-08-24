const rp = require('request-promise')
const common = require('@kelchy/common')

class Utils {
  // wrapper to handle outbound http requests using promises
  // google will fail if body/form is sent when it is not needed so payload should not have default value
  // application developer should be careful, if it is form encoded, pass { form: true } in options
  static async http (uri, method, payload, options = {}) {
    // TODO: remove rejectUnauthorized when freeIPA fixes the certificate
    const args = {
      uri,
      method: method.toUpperCase(),
      resolveWithFullResponse: true,
      rejectUnauthorized: false
    }

    let headers = options.headers || {}
    if (options.form) {
      // i.e. in some APIs, freeIPA expects form urlencoded
      headers = Object.assign(headers, { 'Content-Type': 'application/x-www-form-urlencoded' })
      args.json = false
      // do not send if payload is empty
      if (payload) args.form = payload
    } else {
      args.json = true
      // do not send if payload is empty, if needed, application developer can send {}
      if (payload) args.body = payload
    }
    args.headers = headers
    const { data, error } = await common.awaitWrap(rp(args))
    if (error) throw error
    return data
  }
}

module.exports = Utils
