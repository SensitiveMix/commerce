const crypto = require('crypto')

class passHash {
  static HashMD5 (text) {
    return crypto.createHash('md5').update(text).digest('hex')
  }
}

module.exports = passHash
