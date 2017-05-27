function getTranslateTitle (param) {
  if ($('.demen').is(':checked')) {
    if (param) {
      $('.title_re').append('<input id="productname_de" name="productname_de" style="ime-mode:disabled;margin-left: 94px;" class="attr-text-input addwid402" maxlength="140" placeholder="德文" type="text" value="" autoComplete="off"><span id="productnameTip" style="padding-left:4px;" class="helptips marginleft10">您还可以输入<b class="color444" id="productNameLengthSpan_de">140</b><span class="color000">/<span>140</span></span>个字符</span>')
    }
    var productNameLength = $('#productname').val().length
    $('#productNameLengthSpan_de').text(140 - productNameLength)
    $('#productname_de').bind('input propertychange', function () {
      var productNameLength = $('#productname_de').val().length
      $('#productNameLengthSpan_de').text(140 - productNameLength)
    })

    var appid = '20161031000031137'
    var key = '5pFIYl4t5Hi1oSXzRv1X'
    var salt = (new Date()).getTime()
    var query = $('#productname').val()
    var from = 'en'
    var to = 'de'
    var str1 = appid + query + salt + key
    var sign = MD5(str1)
    $.ajax({
      url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
      type: 'get',
      dataType: 'jsonp',
      data: {
        q: query,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
      },
      success: function (data) {
        console.log(data)
        $('#productname_de').val(data.trans_result[0].dst)
      },
      error: function (data) {
        layer.msg('翻译服务已停用')
        console.log(data)
      }
    })
  } else {
    if (param) {
      $('#productname').next().next().remove()
      $('#productname').next().remove()
    }
  }
}
function getTranslate (param) {
  if ($('.demen_remark').is(':checked')) {
    if (param) {
      $('.demon').css('display', 'block')
    }
    var appid = '20161031000031137'
    var key = '5pFIYl4t5Hi1oSXzRv1X'
    var salt = (new Date()).getTime()
    var query = um.getContentTxt()
    var from = 'en'
    var to = 'de'
    var str1 = appid + query + salt + key
    var sign = MD5(str1)
    $.ajax({
      url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
      type: 'get',
      dataType: 'jsonp',
      data: {
        q: query,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
      },
      success: function (data) {
        console.log(data)
        umdemon.setContent(data.trans_result[0].dst)
      },
      error: function (data) {
        layer.msg('翻译服务已停用')
        console.log(data)
      }
    })
  } else {
    $('.demon').css('display', 'none')
  }
}

$(document).ready(function () {
  $('.pick-a-color').pickAColor({
    showSpectrum: false,
    showSavedColors: false,
    saveColorsPerElement: true,
    fadeMenuToggle: true,
    showAdvanced: false,
    showBasicColors: true,
    showHexInput: false,
    allowBlank: true,
    inlineDropdown: true
  })
})
