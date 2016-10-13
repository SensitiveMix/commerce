(function () {
    var d = document,
        w = window,
        p = parseInt,
        dd = d.documentElement,
        db = d.body,
        dc = d.compatMode == 'CSS1Compat',
        dx = dc ? dd : db,
        ec = encodeURIComponent;


    w.CHAT = {
        msgObj: d.getElementById("message"),
        screenheight: w.innerHeight ? w.innerHeight : dx.clientHeight,
        username: null,
        userid: null,
        socket: null,
        level: null,
        belong: null,
        ubelong: null,
        ip: null,
        level_name: null,
        name: null,
        account: null,
        //退出，本例只是一个简单的刷新
        logout: function () {
            //this.socket.disconnect();
            location.reload();
        },
        //提交聊天消息内容
        submit: function (type) {
            var content = d.getElementById("Y_iSend_Input").value;
            alert(content);
            if (content == ''&& type != "flower")
            {
                alert('发送内容不能为空！');
                return false;
            }
            var myDate = new Date();
            var sendTime = myDate.getFullYear() + "年-" + (myDate.getMonth() + 1) + "月" + myDate.getDate() + "日" + myDate.getHours() + ":" + myDate.getMinutes();
            var time = Date.now() + 8 * 3600 * 1000;
            if (content != '' || type != "") {
                var ubelongs = null;
                if (this.level != 66) {
                    ubelongs = this.ubelong;
                }
                var obj = {
                    userid: this.userid,
                    username: this.username,
                    content: content,
                    sendto: null,
                    sendtoname: null,
                    level: this.level,
                    belong: this.belong,
                    ubelong: ubelongs,
                    ip: this.ip,
                    time: time,
                    type: null,
                    sendtime: sendTime
                };
                if (CHAT.level == 66) {
                    obj.sendto = $("#sel").find("option:selected").val();
                    alert(obj.sendto);
                    obj.sendtoname = $("#sel").find("option:selected").text();
                    alert(obj.sendtoname);
                }
                if (type == "flower") {
                    obj.type = "flower";
                }
                this.socket.emit('message', obj);
                d.getElementById("Y_iSend_Input").value = '';
            }
            return false;
        },
        genUid: function () {
            return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
        },
        //更新系统消息，本例中在用户加入、退出的时候调用
        updateSysMsg: function (o, action) {
            //当前在线用户列表
            var onlineUsers = o.onlineUsers;
            //当前在线人数
            var onlineCount = o.onlineCount;
            //新加入用户的信息
            var user = o.user;

            //更新在线人数
            var userhtml = '';
            var separator = '';
            var userAp = '';
            var selUser = '<option value="all">所有人</option>';
            var optionss = d.createElement('option');
            for (key in onlineUsers) {
                if (onlineUsers.hasOwnProperty(key)) {
                    if (CHAT.level == 66 && onlineUsers[key].belong == CHAT.userid)
                        userAp += '<li><a><img width="25px" src="/images/' + onlineUsers[key].level + '.png"/><span>' + onlineUsers[key].nick_name + '</span></a></li>';
                    //userAp += '<li><div class="UBase"><img class="USoundStatus" src="/images/pixel.gif"><img class="US_Pic" src="/images/201509070905306991.jpg"><span title="" class="UName" href="javascript:void(0)">'+onlineUsers[key].nick_name+'</span><img class="RoomUserRole RoomUser2" title="普通客户：可文字发言" src="/images/'+onlineUsers[key].level+'.png"></div></li>';
                    if (onlineUsers[key].nick_name != CHAT.username && CHAT.level == 66 && onlineUsers[key].belong == CHAT.userid) {
                        selUser += '<option value=' + onlineUsers[key].userid + '>' + onlineUsers[key].nick_name + '</option>';
                    }
                }
            }// d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;

            // d.getElementById("sel").innerHTML = selUser;
            // $('#sel').html(selUser);
            //alert(d.getElementById("sel").innerHTML);
            if (CHAT.level == 66)
                $('#User_List').html(userAp);
            //添加系统消息
            var html = '';
            html += '<li class="chatli"><span class="b">'
            html += o.user.nick_name;
            html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
            html += '</span></li>';
            var li = d.createElement('li');
            li.className = 'system J-mjrlinkWrap J-cutMsg';
            $(li).html(html);
            // li.innerHTML = html;
            if (CHAT.level == 66 && o.user.belong == CHAT.userid)
                this.msgObj.appendChild(li);
        },
        //第一个界面用户提交用户名
        usernameSubmit: function () {
            var username = this.genUid();
            if (username != "") {
                /*d.getElementById("username").value = '';
                 d.getElementById("loginbox").style.display = 'none';
                 d.getElementById("chatbox").style.display = 'block';*/
                this.init(username);
            }
            return false;
        },

        biaoqing: function (str) {
            str = str.replace(/\</g, '&lt;');
            str = str.replace(/\>/g, '&gt;');
            str = str.replace(/\n/g, '<br/>');
            str = str.replace(/\[em_([0-9]*)\]/g, '<img src="/face/$1.gif" border="0" />');
            return str;
        },

        init: function (username) {
            /*
             客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
             实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
             */
            this.userid = $("#userid").val();
            this.username = $('#nicknamei').html();
            this.level = $('#userlevel').val();
            this.belong = $('#belong').val();
            this.ubelong = $('#ubelong_name').val();
            this.ip = $("#ip").val();
            this.level_name = $('#level_name').val();
            this.name = $('#name').val();
            this.account = $('#account').val();
            // alert(this.level);
            //d.getElementById("showusername").innerHTML = this.username;
            //this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
            //this.scrollToBottom();
            //连接websocket后端服务器
            this.socket = io.connect('ws://139.196.164.208:3000');
            var ran_id = Math.floor(Math.random() * 1500);
            var myDate = new Date();
            // alert(this.ubelong);
            var login_start = myDate.getFullYear() + "年" + (myDate.getMonth()+1) + "月" + myDate.getDate() + "日" + myDate.getHours() + ":" + myDate.getMinutes();
            //告诉服务器端有用户登录
            this.socket.emit('login', {
                _id: this.userid,
                name: this.name,
                nick_name: this.username,
                level: this.level,
                belong: this.belong,
                ubelong: this.level==66?null:this.ubelong,
                ip: this.ip,
                account: this.account,
                random_id: ran_id,
                login_start: login_start,
                level_name: this.level_name
            });
            //监听新用户登录
            this.socket.on('login', function (o) {
                CHAT.updateSysMsg(o, 'login');
            });
            //监听用户退出
            this.socket.on('logout', function (o) {
                CHAT.updateSysMsg(o, 'logout');
            });
            //監聽公告
            this.socket.on('fabugonggao', function (obj) {
                //alert(obj.gonggao);
                $("#gonggao").html(obj.gonggao);
                $("#gundongspan").html(obj.gonggao);
            });
            //监听喊单
            this.socket.on('fabuhandan', function (obj) {
                //alert(obj.dkqs);
                $("#dkqs").html(obj.dkqs);
                $("#kcdw").html(obj.kcdw);
                $("#pcdw").html(obj.pcdw);
                $("#zsdw").html(obj.zsdw);
                $("#zydw").html(obj.zydw);
                $("#bz").html(obj.bz);
                $("#hduser").html(obj.hduser);
                $("#hdtime").html(obj.hdtime);
            });
            //监听消息发送
            this.socket.on('message', function (obj) {

                var myDate = new Date();
                var isme = (obj.userid == CHAT.userid) ? true : false;
                var timeSpan = '<span>'myDate.getMonth()+'月'+myDate.getDate()+'日' + myDate.getHours() + ':' + myDate.getMinutes() + '</span>';
                if (isme) {

                } else {

                }
                if ((obj.level == 66 && obj.userid == CHAT.userid) || (CHAT.level != 66 && CHAT.belong == obj.userid)) {
                    var imgoflevel = '<img width="30" class="Role Manager2" src="/images/' + obj.level + '.png">';
                    var contentDiv = '<strong>' + obj.username + '：</strong>';
                    if ((CHAT.level == 66 && obj.sendto != 'all') || CHAT.userid == obj.sendto)
                        contentDiv += '<img src="/images/r-middle-pic03.png"/><a>' + obj.sendtoname + '</a>';
                    var usernameDiv = "";

                    if (obj.type == "flower") {
                        usernameDiv = '<p><img class="Picture" src="/images/xh.gif"/>';
                    } else {
                        usernameDiv = '<p>' + CHAT.biaoqing(obj.content);
                    }
                    usernameDiv += '</p>';

                    var section = d.createElement('li');
                    $(section).html(timeSpan + imgoflevel + contentDiv + usernameDiv);
                    //section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;
                    if ((CHAT.userid == obj.sendto || obj.sendto == 'all') || CHAT.level == 66) {
                        d.getElementById("mastermessage").appendChild(section);
                        $("#msmelist").mCustomScrollbar('update');
                        $("#msmelist").mCustomScrollbar("scrollTo", "last");
                    }
                } else if ((obj.level != 66 && obj.userid == CHAT.userid) || (CHAT.level == 66 && obj.belong == CHAT.userid)) {
                    var imgoflevel = '<img width="30" class="Role Manager2" src="/images/' + obj.level + '.png">';
                    var contentDiv = '<a><label class="usernlist">' + obj.username + '</label>：</a>';
                    var usernameDiv = "";

                    if (obj.type == "flower") {
                        usernameDiv = '<p><img class="Picture" src="/images/xh.gif"/>';
                    } else {
                        usernameDiv = '<p>' + CHAT.biaoqing(obj.content);
                    }
                    usernameDiv += '</p>';
                    var section = d.createElement('li');
                    $(section).html(timeSpan + imgoflevel + contentDiv + usernameDiv);
                    // section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;
                    CHAT.msgObj.appendChild(section);
                    $("#usermessage").mCustomScrollbar('update');
                    $("#usermessage").mCustomScrollbar("scrollTo", "last");
                }
                if (CHAT.level == 66) {
                    $(".usernlist").addClass("clicksender");
                    $(".usernlist").click(function () {
                        var selnameid = obj.userid;
                        //$("#sel option[value='" + selnameid + "']").attr("selected", true);
                        $("#sel").val(selnameid);
                    });
                }

                // $("#Y_PubMes_Div").mCustomScrollbar('update');
                //   $("#Y_PubMes_Div").mCustomScrollbar("scrollTo", "last");
            });

        }
    };

    //通过“回车”提交信息
    d.getElementById("Y_iSend_Input").onkeydown = function (e) {
        e = e || event;
        if (e.keyCode === 13) {
            CHAT.submit();
        }
    };
})();