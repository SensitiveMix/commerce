			
			var i_LiveCastRoomID = '';
			var swf_version = '14.4.22';			
			var pubUrl = '/swf/LivePlayer_2.3.swf?Live_Type=1&PubName=&Live_NG_ID=7000';
			var liveUrl = 'http://yy.com/s/28120210/2265383044/yyscene.swf';
			var isYY = true;			
			function LiveCast_Do(RoomID)//转播
			{
				LiveCastRoomID = UnSecret(RoomID);
				liveUrl = "/swf/Play.swf?Live_Type=2&Live_NG_ID=" + LiveCastRoomID + "&" + swf_version;
				isYY = false;
				_Dis_Live(0);
				$("#LiveChange").hide();
			}			
			function LiveCast_End()//停止转播
			{
				LiveCastRoomID = "";
				pubUrl = "/swf/LivePlayer_2.3.swf?Live_Type=1&Live_NG_ID=" + iRoomID + "&" + swf_version;
				liveUrl = "/swf/Play.swf?Live_Type=2&Live_NG_ID=" + iRoomID + "&" + swf_version;
				_Dis_Live(0);
				if(iInfo.IsZber)
				{
					$("#LiveChange").show();
				}
			}			
			function LiveCast_Do_YY(YYID)//转播YY
			{
				LiveCastRoomID = YYID;
				var yynumarr = YYID.split(",");
				if(yynumarr.length>1)
				{
					liveUrl = "http://yy.com/s/" + yynumarr[0] + "/" + yynumarr[1] + "/mini.swf";
				}
				else
				{
					liveUrl = "http://yy.com/s/" + LiveCastRoomID + "/" + LiveCastRoomID + "/mini.swf";
				}
				isYY = true;
				_Dis_Live(0);
				$("#LiveChange").hide();
			}			
			function LiveCast_End_YY()//停止转播YY
			{
				LiveCastRoomID = "";
				pubUrl = "/swf/LivePlayer_2.3.swf?Live_Type=1&Live_NG_ID=" + iRoomID + "&" + swf_version;
				liveUrl = "/swf/Play.swf?Live_Type=2&Live_NG_ID=" + iRoomID + "&" + swf_version;
				isYY = false;
				_Dis_Live(0);
				if(iInfo.IsZber)
				{
					$("#LiveChange").show();
				}
			}			
			function LiveCast_Do_Other(RID,SN,Msg,Watch)//转播站外(e.RID,e.SN,e.Msg,e.Pub,e.Watch);
			{
				LiveCastRoomID = RID;
				liveUrl = "/swf/Play.swf?Live_Type=2&Live_NG_ID=" + RID + "&SnKey=" + SN + "&MsgUrl=" + Msg + "&WatchUrl="+Watch + "&" + swf_version;
				isYY = false;
				_Dis_Live(0);
				$("#LiveChange").hide();
			}			
			function LiveCast_End_Other()//停止转播站外
			{
				LiveCastRoomID = "";
				pubUrl = "/swf/LivePlayer_2.3.swf?Live_Type=1&Live_NG_ID=" + iRoomID + "&" + swf_version;
				liveUrl = "/swf/Play.swf?Live_Type=2&Live_NG_ID=" + iRoomID + "&" + swf_version;
				isYY = false;
				_Dis_Live(0);
				if(iInfo.IsZber)
				{
					$("#LiveChange").show();
				}
			}			
			function ChangeLiveMode()
			{
				if($('#i_Live_Player').attr('t')=='pub')
				{
					$("#LiveChange").html("切换到发布模式");
					_Dis_Live(0);
				}
				else
				{
					$("#LiveChange").html("切换到观看模式");
					_Dis_Live(1);
				}
			}					
			function LiveSetPubUserInfo(e)
			{
				clearTimeout(_Config.LivePubUserInfo_TimeOut);
				e = unescape(e).split(",");
				$("#LivePubUserInfo").text(e[0]);
				$("#LivePubUserInfo").attr({"uname":e[0],"uid":e[1],"title":"【"+e[0] + "】正在直播..."});
				//$("#LivePubUserInfo").attr({"href":"/profile/?" + e[1]});
				$("#LivePubUserInfo").css({"visibility":"visible"});
				$("#LivePubUserInfo").animate({top:0,opacity:1},200);
				_Config.LivePubUserInfo_TimeOut = setTimeout(function(){$("#LivePubUserInfo").animate({top:-35,opacity:0},200);},2000);
				var o ={};
				o.UID = e[1];
				o.NickName = e[0];
				SetCurrentLiveUID(o);
			}			
			function ShowPubUserInfo()
			{
				clearTimeout(_Config.LivePubUserInfo_TimeOut);
				$("#LivePubUserInfo").animate({top:0,opacity:1},200);
				//_Config.LivePubUserInfo_TimeOut = setTimeout(function(){$("#LivePubUserInfo").animate({top:-35,opacity:0},200);},2000);
			}						
			function LiveRefresh()//刷新视频窗口
			{
				if($('#i_Live_Player').attr('t')=='pub')
				{
					_Dis_Live(1);
				}
				else
				{
					_Dis_Live(0);
				}
			}			
			function LiveZoom()
			{
				var isLarge = $("#LiveZoom").text()=="放大";//放大模式下
				$("#LiveZoom").text(isLarge?"缩小":"放大");
				var Live_Title = $("#Live_Title");
				var Live_Div = $("#LiveDiv");
				var RightIsRight = $(".Y_Right").css("float")=="right";//判断Y_Right是靠左还是靠右
				if(isLarge)//放大
				{
					$(".Y_Right").css({overflow:"visible"});
					$("#LiveDiv").css({height:"396px",width:"480px",position:"absolute","z-index":"9999",top:"0px",bottom:"auto",left:RightIsRight?"auto":"512px",right:RightIsRight?"512px":"auto","margin-bottom":"0px"});
					$("#LiveArea").css({height:"360px",width:"480px"});
					Live_Title.mousedown(function(e){
						var offset = $(this).offset();
						var x = e.pageX - offset.left;
						var y = e.pageY - offset.top;
						var _left = Live_Div.position().left;
						var _top = Live_Div.position().top;
						$(document.body)[0].onselectstart=function(){
							return false;
						};
						$("body").addClass("NoSelect");
						$(document).bind("mousemove",function(ev){
							var _x = ev.pageX - x - offset.left;
							var _y = ev.pageY - y - offset.top;
							var _i_Left = _left+_x;
							var _i_Top = _top+_y;
							
							if(_i_Top < 0){_i_Top = 0};//限制顶部
							if(_i_Top + Live_Div.height() > $(".Y_Main").height()){_i_Top = $(".Y_Main").height() - Live_Div.height();};//限制底部
							if(RightIsRight == true)
							{
								if(Math.abs(_i_Left) + $(".Y_Right").width() > $(".Y_Main").width()){_i_Left = $(".Y_Right").width() - $(".Y_Main").width()};//限制左边
								if( _i_Left > 1 ){_i_Left = 0};//限制右边
							}
							else
							{
								if(Math.abs(_i_Left) > $(".Y_Main").width() - $("#LiveDiv").width() - $(".Y_Show").width()-22){_i_Left = $(".Y_Main").width() - $("#LiveDiv").width() - $(".Y_Show").width()-22 };//限制右边
								if( _i_Left < 0-$(".Y_Show").width()-10 ){_i_Left = 0-$(".Y_Show").width()-10};//限制左边
							}
							
							Live_Div.css("left",(_i_Left));
							Live_Div.css("top",(_i_Top));
						});
						$(document).bind("mouseup",function(ev){
							$(document).unbind("mousemove");
							$(document.body)[0].onselectstart=function() {
								return ;
							};
							$("body").removeClass("NoSelect");
						});
					});//事件结束
					$("#LiveTool").show();
				}
				else//缩小
				{
					$(".Y_Right").css({overflow:"hidden"});
					$("#LiveDiv").css({height:"auto",width:"100%",position:"relative","z-index":"999",top:"0px",left:"0px"});
					$("#LiveArea").css({height:_oldHeight!=""?_oldHeight:"200px",width:"100%","margin-bottom":"10px"});
					
					Live_Title.unbind("mousedown");
					$("#LiveTool").hide();
				}
				if(isYY)
				{
					$("#i_Live_Player").height($("#LiveArea").height()+36);
				}
				RightList_Height();
				//console.log("------------------"+isLarge);
			}						
			document.write('&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:void(0)" id="LiveZoom" onclick="LiveZoom()" title="放大/缩小">放大</a>');
			document.write('&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:void(0)" id="LiveRefresh" onclick="LiveRefresh()" title="刷新视频">刷新</a>');
			if(iInfo.IsZber)
			{
				document.write('&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:void(0)" id="LiveChange" onclick="ChangeLiveMode()" title="切换发布/观看模式">切换到发布模式</a>');
			}						
			//初始化加载时,根据css皮肤样式,来判断当前视频框处于放大或缩小状态,绑定或卸载事件
			var _oldHeight = "";
			function OnZoomMode()
			{
				var Live_Title = $("#Live_Title");
				var Live_Div = $("#LiveDiv");
				var isLarge = $("#LiveDiv").css("position")=="absolute";
				$("#LiveZoom").text(isLarge?"缩小":"放大");
				if(isLarge)//处于放大模式下,则绑定事件
				{
					Live_Title.mousedown(function(e){
						var offset = $(this).offset();
						var x = e.pageX - offset.left;
						var y = e.pageY - offset.top;
						var _left = Live_Div.position().left;
						var _top = Live_Div.position().top;
						$(document.body)[0].onselectstart=function(){
							return false;
						};
						$("body").addClass("NoSelect");
						$(document).bind("mousemove",function(ev){
							var _x = ev.pageX - x - offset.left;
							var _y = ev.pageY - y - offset.top;
							var _i_Left = _left+_x;
							var _i_Top = _top+_y;
							
							if(_i_Top < 0){_i_Top = 0};//限制顶部
							if(_i_Top + Live_Div.height() > $(".Y_Main").height()){_i_Top = $(".Y_Main").height() - Live_Div.height();};//限制底部
							if(Math.abs(_i_Left) + $(".Y_Right").width() > $(".Y_Main").width()){_i_Left = $(".Y_Right").width() - $(".Y_Main").width()};//限制左边
							if( Math.abs(_i_Left) < (  $("#LiveDiv").width() - $(".Y_Right").width() ) ){_i_Left = -(  $("#LiveDiv").width() - $(".Y_Right").width() )};//限制右边
							
							Live_Div.css("left",(_i_Left));
							Live_Div.css("top",(_i_Top));
						});
						$(document).bind("mouseup",function(ev){
							$(document).unbind("mousemove");
							$(document.body)[0].onselectstart=function() {
								return ;
							};
							$("body").removeClass("NoSelect");
						});
					});//事件结束
				}
				else
				{
					_oldHeight = $("#LiveArea").height();
					Live_Title.unbind("mousedown");
					$("#LiveTool").hide();
				}
				RightList_Height();
			}
			
			function LivePlayerOver()
			{
				ShowPubUserInfo();
				return;
				clearTimeout(_Config.LiveOver_TimeOut);
				$("#LiveTool").show();
				_Config.LiveOver_TimeOut = setTimeout(function(){$("#LiveTool").hide();},2000);
			}
			
			function LivePlayerOut()
			{
				clearTimeout(_Config.LivePubUserInfo_TimeOut);
				_Config.LivePubUserInfo_TimeOut = setTimeout(function(){$("#LivePubUserInfo").animate({top:-35,opacity:0},200);},2000);
				return;
				clearTimeout(_Config.LiveOver_TimeOut);
				_Config.LiveOver_TimeOut = setTimeout(function(){$("#LiveTool").hide();},2000);
			}
			
			function LiveResizeOver()
			{
				return;
				clearTimeout(_Config.LiveOver_TimeOut);
				$("#LiveTool").show();
			}
			
			function LiveResizeOut()
			{
				return;
				if(_Config.LiveResize_Downing == true){return false;}
				clearTimeout(_Config.LiveOver_TimeOut);
				$("#LiveTool").hide();
			}
			
			$(function(){
				$("#Live_Title").mouseover(function(){
					//LivePlayerOver();
				});
				$("#Live_Title").mouseout(function(){
					//LivePlayerOut();
				});
				$("#LiveTool_Resize").mouseover(function(){
					LiveResizeOver();
				});
				$("#LiveTool_Resize").mouseout(function(){
					LiveResizeOut();
				});
				
				$("#LiveTool_Resize").mousedown(function(e){
					_Config.LiveResize_Downing = true;
					var offset = $(this).offset();
					var x = e.pageX - offset.left;
					var y = e.pageY - offset.top;
					var _LiveDiv = $("#LiveDiv");
					var _LiveDiv_H = _LiveDiv.height();
					var _LiveDiv_W = _LiveDiv.width();
					var _LiveArea = $("#LiveArea");
					var _LiveArea_H = _LiveArea.height();
					var _LiveArea_W = _LiveArea.width();
					$("body")[0].onselectstart=function(){
						return false;
					};
					$("body").addClass("NoSelect");
					$(document).bind("mousemove",function(ev){
						var _x = ev.pageX - x - offset.left;
						var _y = ev.pageY - y - offset.top;
						if(ev.pageX > ($("body").width() - ($("body").width() - $(".Page").width())/2) - 10 ){return false;}
						if((_LiveDiv_H + _y) < 100 || (_LiveDiv_H + _y) > $(".Y_Main").height()-6 || (_LiveDiv_W + _x) < 100 || (_LiveDiv_W + _x) > $(".Y_Main").width()-6){return false;}
						_LiveDiv.height(_LiveDiv_H + _y);
						_LiveDiv.width(_LiveDiv_W + _x);
						_LiveArea.height(_LiveArea_H + _y);
						_LiveArea.width(_LiveArea_W + _x);
						if(isYY)
						{
							$('#i_Live_Player').height(_LiveArea.height()+36);
						}
					});
					$(document).bind("mouseup",function(ev){
						$(document).unbind("mousemove");
						$("body")[0].onselectstart=function() {
							return ;
						};
						$("body").removeClass("NoSelect");
						_Config.LiveResize_Downing = false;
					});
				});
				OnZoomMode();
			});