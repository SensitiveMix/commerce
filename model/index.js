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
exports.notices = mongoose.model('notices', require('./notices'));
exports.uploadHistorys = mongoose.model('uploadhistorys', require('./uploadHistory'));
exports.uploadTemporarys = mongoose.model('uploadTemporarys', require('./uploadTemporary'));
exports.levels = mongoose.model('levels', require('./levels'));
exports.specifications = mongoose.model('specifications', require('./specifications'));
exports.suppliers = mongoose.model('suppliers', require('./suppliers'));
exports.SEOS = mongoose.model('seos', require('./seo'));
exports.fee = mongoose.model('fees', require('./fee'));
exports.deltaPrice = mongoose.model('deltaPrices', require('./deltaPrice'));