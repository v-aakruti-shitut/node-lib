const Methods = require('./methods')

class Empty extends Methods {
  constructor (options = {}) {
    super(options)
    this.type = 'empty'
  }

  out (scope, msg, options = {}) {
    // nothing will happen
  }

  debug (scope, msg, options = {}) {
    // nothing will happen
  }

  error (scope, msg, options = {}) {
    // nothing will happen
  }
}

module.exports = Empty
