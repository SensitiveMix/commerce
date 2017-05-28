class Format {
  /**
   * judge obj
   * @param data
   * @returns {*}
   */
  static isNull (data) {
    if (typeof data === 'boolean') {
      return Format.isBoolean(data)
    } else {
      return (data === '' || data === undefined || data === null)
    }
  }

  static isBoolean (data) {
    return data === true
  }
}

module.exports = Format
