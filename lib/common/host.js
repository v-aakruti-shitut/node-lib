/* supports ensx and ethx for interface names */
const os = require('os')
const net = require('net')

// we don't use class here as the nature of this file does not need classes
module.exports = {
  // return the hostname of the server
  myName: () => {
    return os.hostname()
  },

  // return the ipv4 or ipv6  of the server
  // optional parameter is accepted to identify which interface
  // if both ipv4 and ipv6 is present, it will only return ipv4
  myAddr: (iface) => {
    const list = os.networkInterfaces()
    const host = iface ? list[iface] : list.eth0 || list.ens0
    let v4 = ''
    let v6 = ''
    if (!host) return ''
    // os.networkInterfaces() returns an array of objects
    host.forEach((ip) => {
      if (ip.family === 'IPv6') v6 = ip.address
      if (ip.family === 'IPv4') v4 = ip.address
    })
    return v4 || v6 || ''
  },

  // return the home dir of the user running the process
  home: () => {
    return os.homedir()
  },

  // check if the host and port combination of a remote party is reachable
  isAlive: (host, port) => {
    return new Promise(resolve => {
      if (!host) return resolve(false)
      if (!port) return resolve(false)
      const socket = new net.Socket()
      const onError = () => {
        socket.destroy()
        resolve(false)
      }
      socket.setTimeout(500)
      socket.on('error', onError)
      socket.on('timeout', onError)

      socket.connect(port, host, () => {
        socket.end()
        resolve(true)
      })
    })
  },

  // check if a given string is a valid IPv4
  isIPv4: (s) => {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(s)
  },

  // check if a given string is a valid IPv6
  isIPv6: (s) => {
    return /^(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))$/.test(s)
  }
}
