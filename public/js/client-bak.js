(function () {
  var d = document,
      w = window,
      p = parseInt,
      dd = d.documentElement,
      db = d.body,
      dc = d.compatMode == 'CSS1Compat',
      dx = dc ? dd: db,
      ec = encodeURIComponent;


  w.CHAT = {
    msgObj:d.getElementById("message"),
    screenheight:w.innerHeight ? w.innerHeight : dx.clientHeight,
    username:null,
    userid:null,
    socket:null,
      level:null,
    //让浏览器滚动条保持在最低部
    scrollToBottom:function(){
      w.scrollTo(0, this.msgObj.clientHeight);
    },
    //退出，本例只是一个简单的刷新
    logout:function(){
      //this.socket.disconnect();
      location.reload();
    },
    //提交聊天消息内容
    submit:function(){
      var content = d.getElementById("Y_iSend_Input").value;
      if(content != ''){
        var obj = {
          userid: this.userid,
          username:this.username,
          content: content,
          level:this.level
        };
        this.socket.emit('message', obj);
        d.getElementById("Y_iSend_Input").value = '';
      }
      return false;
    },
    genUid:function(){
      return new Date().getTime()+""+Math.floor(Math.random()*899+100);
    },
    //更新系统消息，本例中在用户加入、退出的时候调用
    updateSysMsg:function(o, action){
      //当前在线用户列表
      var onlineUsers = o.onlineUsers;
      //当前在线人数
      var onlineCount = o.onlineCount;
      //新加入用户的信息
      var user = o.user;

      //更新在线人数
      var userhtml = '';
      var separator = '';
      var userAp ='';
     for(key in onlineUsers) {
        if(onlineUsers.hasOwnProperty(key)){
          userAp += '<li><div class="UBase"><img class="USoundStatus" src="/images/pixel.gif"><img class="US_Pic" src="/images/201509070905306991.jpg"><span title="" class="UName" href="javascript:void(0)">'+onlineUsers[key].nick_name+'</span><img class="RoomUserRole RoomUser2" title="普通客户：可文字发言" src="/images/'+onlineUsers[key].level+'.png"></div></li>';
        }
      }
     // d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;
      $('#User_List').html(userAp);
      //添加系统消息
      var html = '';
      html += '<span class="f">';
      html += this.username;
      html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
      html += '</span>';
      var li = d.createElement('li');
      li.className = 'system J-mjrlinkWrap J-cutMsg';
      li.innerHTML = html;
      this.msgObj.appendChild(li);
      this.scrollToBottom();
    },
    //第一个界面用户提交用户名
    usernameSubmit:function(){
      var username = this.genUid();
      if(username != ""){
        /*d.getElementById("username").value = '';
         d.getElementById("loginbox").style.display = 'none';
         d.getElementById("chatbox").style.display = 'block';*/
        this.init(username);
      }
      return false;
    },

    init:function(username){
      /*
       客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
       实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
       */
      this.userid = this.genUid();
      this.username =  $('#regBt span').text();
      this.level =$('#userlevel').val();
       // alert(this.level);
      //d.getElementById("showusername").innerHTML = this.username;
      //this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
      this.scrollToBottom();

      //连接websocket后端服务器
      this.socket = io.connect('ws://localhost:3000');

      //告诉服务器端有用户登录
      this.socket.emit('login', {userid:this.userid, nick_name:this.username,level:this.level});

      //监听新用户登录
      this.socket.on('login', function(o){
        CHAT.updateSysMsg(o, 'login');
      });

      //监听用户退出
      this.socket.on('logout', function(o){
        CHAT.updateSysMsg(o, 'logout');
      });

      //监听消息发送
      this.socket.on('message', function(obj){
        var myDate = new Date();
        var isme = (obj.userid == CHAT.userid) ? true : false;
        var timeSpan ='<span class="t">'+myDate.getHours()+':'+myDate.getMinutes()+'</span>';contentDiv
        var imgoflevel ='<img class="Role Manager2" src="/images/'+obj.level+'.png" title="频道管理">';
        var contentDiv = '<a class="u">'+obj.username+'：</a>';
        var usernameDiv = '<span class="m">'+obj.content+'</span>';
        var section = d.createElement('li');
        if(isme){
          section.className = 'user' ;
          section.innerHTML = timeSpan +imgoflevel+ contentDiv + usernameDiv;
        } else {
          section.className = 'service';
          section.innerHTML = timeSpan+imgoflevel + contentDiv + usernameDiv;
        }
        CHAT.msgObj.appendChild(section);
        $("#Y_PubMes_Div").mCustomScrollbar('update');
        $("#Y_PubMes_Div").mCustomScrollbar("scrollTo","last");
      });

    }
  };

  //通过“回车”提交信息
  d.getElementById("Y_iSend_Input").onkeydown = function(e) {
    e = e || event;
    if (e.keyCode === 13) {
      CHAT.submit();
    }
  };
})();