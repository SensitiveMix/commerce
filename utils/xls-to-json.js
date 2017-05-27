/**
 * Created by sunNode on 16/12/3.
 */

var node_xj = require('xls-to-json')
node_xj({
  input: '/Users/sunNode/WebstormProjects/e-commerce-platform/public/price.xls',  // input xls
  output: 'output.json', // output json
  sheet: 'price'  // specific sheetname
}, function (err, result) {
  if (err) {
    console.error(err)
  } else {
    console.log(result)
  }
})
