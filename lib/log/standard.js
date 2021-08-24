const common = require('@kelchy/common')
const Methods = require('./methods')

class Standard extends Methods {
  constructor (options = {}) {
    super(options)
    this.type = 'standard'
    // defaults
    this.debugging = options.debugging || false
    this.dateFormat = options.dateFormat || 'iso'
    this.json = true
    if (options.json === false) this.json = false
  }

  out (scope, msg, options = {}) {
    if (this.json) options.json = true
    output('log', this.dateFormat, scope, msg, options)
  }

  debug (scope, msg, options = {}) {
    if (this.json) options.json = true
    if (this.debugging) output('debug', this.dateFormat, scope, msg, options)
  }

  error (scope, msg, options = {}) {
    if (this.json) options.json = true
    output('error', this.dateFormat, scope, msg, options)
  }
}

// this function will deliver the log to the intended output channel
function output (channel, dateFormat, scope, msg, options) {
  const json = !options.json
    ? undefined
    : scope && !msg && common.isObject(scope)
      ? scope
      : scope && common.isObject(msg) && !msg.scope
        ? Object.assign({ scope }, msg)
        : { scope, msg }
  if (dateFormat) {
    if (!json) return console[channel](getDatetime(dateFormat, options.datetime), scope, msg)
    json.ts = getDatetime(dateFormat, options.datetime)
    console[channel](JSON.stringify(json))
  } else {
    if (!json) return console[channel](scope, msg)
    console[channel](JSON.stringify(json))
  }
}

// this function will take the format and optionally the log datetime
// if no log datetime provided, it uses current one
function getDatetime (format, datetime) {
  const dt = datetime ? new Date(datetime) : new Date()
  if (format === 'iso') return dt.toISOString()
  else if (format === 'epoch') return dt.getTime().toString()
  // default
  return dt.toISOString()
}

module.exports = Standard
