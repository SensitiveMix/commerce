(function () {
  window.CHAT = {
        // 退出，本例只是一个简单的刷新
    logout: function () {
            // this.socket.disconnect();
      location.reload()
    },
    submit: function () {
      var content = $('#gundonggonggao').val()
            // alert(content);
      if (content != '') {
        var obj = {
          gonggao: content
        }
        this.socket.emit('fabugonggao', obj)
      }
      return false
    },
    handansubmit: function () {
      if (content != '') {
        var obj = {
          dkqs: $('#dkqs').val(),
          kcdw: $('#kcdw').val(),
          pcdw: $('#pcdw').val(),
          zsdw: $('#zsdw').val(),
          zydw: $('#zydw').val(),
          bz: $('#bz').val(),
          hduser: $('#username').text(),
          hdtime: $('#hdtime').val()
        }
        this.socket.emit('fabuhandan', obj)
      }
      return false
    },
    init: function () {
            /*
             客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
             实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
             */
            // 连接websocket后端服务器
      this.socket = io.connect('ws://localhost:3000')
            // 监听消息发送
    }
  }
    // 通过“回车”提交信息
})()
