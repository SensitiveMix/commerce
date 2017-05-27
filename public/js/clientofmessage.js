/**
 * Created by Administrator on 2016/5/7.
 */
(function () {
  var d = document,
    w = window,
    p = parseInt,
    dd = d.documentElement,
    db = d.body,
    dc = d.compatMode == 'CSS1Compat',
    dx = dc ? dd : db,
    ec = encodeURIComponent

  window.CHAT = {
        // 获取message
    msgObj: d.getElementById('message'),
        // 让滚动条滚到最底部
    scrollToBottom: function () {
      w.scrollTo(0, this.msgObj.clientHeight)
    },

        // 退出，本例只是一个简单的刷新
    logout: function () {
            // this.socket.disconnect();
      location.reload()
    },

    messsgesubmit1: function () {
      this.socket = io.connect('ws://localhost:3000')
      var obj = {
        date: $(this).parent().children('span').eq(0).text(),
        content: $(this).parent().children('span').eq(1).html(),
        level: $(this).parent().children('input').eq(0).val(),
        ip: $(this).parent().children('input').eq(1).val(),
        userid: $(this).parent().children('input').eq(2).val().trim(),
        msgid: $(this).parent().children('input').eq(3).val(),
        username: $(this).parent().children('a').text()
      }

      $(this).parent().remove()
      this.socket.emit('message', obj)

      return false
    },
    messsgecancel: function () {
      this.socket = io.connect('ws://139.196.203.21:3000')

            // level 78 代表删除
      var obj = {
        msgid: $(this).parent().children('input').eq(3).val(),
        level: 78
      }

      $(this).parent().remove()
      this.socket.emit('message', obj)
      return false
    },

    replace_em: function (str) {
      str = str.replace(/\</g, '<;')
      str = str.replace(/\>/g, '>;')
      str = str.replace(/\n/g, '<;br/>;')
      str = str.replace(/\[em_([0-9]*)\]/g, '<img src="/face/$1.gif" border="0" />')
      return str
    },

    biaoqing: function (str) {
      str = str.replace(/\</g, '&lt;')
      str = str.replace(/\>/g, '&gt;')
      str = str.replace(/\n/g, '<br/>')
      str = str.replace(/\[em_([0-9]*)\]/g, '<img src="/face/$1.gif" border="0" />')
      return str
    },

    init: function () {
            /*
             客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
             实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
             */
            // 连接websocket后端服务器
      this.socket = io.connect('ws://139.196.164.208:3000')

            // 监听消息发送
      this.socket.on('check_message', function (obj) {
        var timeSpan = obj.sendtime.substring(obj.sendtime.indexOf('日') + 1, obj.sendtime.length)
        if ((obj.level == 66)) {
          var imgoflevel = '<img width="30" class="Role Manager2" src="/images/' + obj.level + '.png">'
          var contentDiv = '<a><label class="adminlist">' + obj.username + '</label>：</a>'
          if (obj.sendto != 'all') { contentDiv += '<img src="/images/r-middle-pic03.png"/><a>' + obj.sendtoname + '</a>' }
          var belongNameDiv = '分析师'
          var usernameDiv = ''

          var div = d.createElement('div')
          div.className = 'direct-chat-info clearfix'

          var div_header = d.createElement('div')
          div_header.className = 'direct-chat-info clearfix'

          var div_header_text = d.createElement('p')
          div_header_text.className = 'direct-chat-name pull-right'
          $(div_header_text).html(belongNameDiv)

          if (obj.type == 'flower') {
            usernameDiv = '<img class="Picture" src="/images/xh.gif"/>'
          } else {
            usernameDiv = CHAT.biaoqing(obj.content)
          }
                    // usernameDiv += '</p>';
          var section = d.createElement('li')
          section.className = 'user direct-chat-text'
          $(section).html(timeSpan + imgoflevel + contentDiv + usernameDiv)
          div_header.appendChild(div_header_text)
          div.appendChild(div_header)
          div.appendChild(section)
                    // d.getElementById("message").appendChild(div_header);
          d.getElementById('message').appendChild(div)
        } else if (obj.level != 66) {
          var imgoflevel = '<img width="30" class="Role Manager2" src="/images/' + obj.level + '.png">'
          var contentDiv = '<a><label class="usernlist">' + obj.username + '</label>：</a>'
          var usernameDiv = ''
          var belongNameDiv = '客户归属：' + obj.ubelong

          var div = d.createElement('div')
          div.className = 'direct-chat-info clearfix'

          var div_header = d.createElement('div')
          div_header.className = 'direct-chat-info clearfix'

          var div_header_text = d.createElement('p')
          div_header_text.className = 'direct-chat-name pull-right'
          $(div_header_text).html(belongNameDiv)

          if (obj.type == 'flower') {
            usernameDiv = '<img class="Picture" src="/images/xh.gif"/>'
          } else {
            usernameDiv = CHAT.biaoqing(obj.content)
          }
                    // usernameDiv += '</p>';
          var section = d.createElement('li')
          section.className = 'user direct-chat-text'
          $(section).html(timeSpan + imgoflevel + contentDiv + usernameDiv)
                    // section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;

                   // section.appendChild(button);
          div_header.appendChild(div_header_text)
          div.appendChild(div_header)
          div.appendChild(section)
          d.getElementById('message').appendChild(div_header)
          d.getElementById('message').appendChild(section)
        }
      })
    }
  }
    // 通过“回车”提交信息
})()
