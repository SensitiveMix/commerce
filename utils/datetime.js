class DateTime {
    /**
     * date format yyyy-mm-dd :HH:SS
     * @returns {string}
     */
  static FormatDate () {
    let date = new Date()
    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
  }
}

module.exports = DateTime
