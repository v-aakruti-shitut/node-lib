const common = require('@kelchy/common')
const Log = require('@kelchy/log')

class Methods {
  // super must be called with config, log can be included in options or else, it will be empty
  constructor (config, options = {}) {
    // check if the config is valid, minimum it should have tenant, service and domain
    if (!config) throw common.error('AUTH_METHODS', new Error('NO_CONFIG'))
    this.config = config
    this.log = options.log || new Log.Empty()
  }

  // these 6 functions will be overriden if the parent class has any defined, it is to make sure that
  // future developers who will add more IAM options to this module will use the same function names
  // also take note that parameters to these functions must be consistent so no customization between
  // different IAM providers
  refreshToken () { throw common.error('AUTH', new Error('REFRESH_TOKEN_NOT_IMPLEMENTED')) }

  generateToken () { throw common.error('AUTH', new Error('GENERATE_TOKEN_NOT_IMPLEMENTED')) }

  isTokenValid () { throw common.error('AUTH', new Error('TOKEN_VALID_NOT_IMPLEMENTED')) }

  isOperationAllowed () { throw common.error('AUTH', new Error('IS_ALLOWED_NOT_IMPLEMENTED')) }

  getMetadata () { throw common.error('AUTH', new Error('GET_METADATA_NOT_IMPLEMENTED')) }

  getScope () { throw common.error('AUTH', new Error('GET_SCOPE_NOT_IMPLEMENTED')) }

  // this function is common to all IAM providers, logs should be picked up by the system and routed
  // to audit storage regardless of IAM provider
  sendUserActionLog (service, operation, id, resource, timestamp, metadata) {
    // if the current log setting is empty, use the standard log setting instead
    // this will force audit logs to go to stdout for the system to pickup regardless
    // of log ingestion strategy
    const log = this.log.type === 'empty' ? new Log.Standard() : this.log
    log.out({ type: 'AUTH_AUDIT', service, operation, id, resource, timestamp, metadata })
  }
}

module.exports = Methods
