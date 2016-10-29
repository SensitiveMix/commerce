/**
 * Created by sunNode on 16/10/12.
 */
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://139.224.30.16:27017/livetest', function (err) {
    console.log(err)
});

exports.users = mongoose.model('users', require('./user'));
exports.banners = mongoose.model('banners', require('./banner'));
exports.systems = mongoose.model('systems', require('./systems'));
exports.categorys = mongoose.model('categorys', require('./categorys'));
exports.hotLabels = mongoose.model('hotlabels', require('./hotLabels'));