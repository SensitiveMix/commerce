
	function Y_Vote_Close()
	{
		$("#Y_Vote").hide();
	}	
	function Vote_Bind_Drag()
	{
		var Vote_Div = $("#Y_Vote");
		var Vote_Title = $(".Y_Vote_Title");
		Vote_Title.mousedown(function(e){
			var offset = $(this).offset();
			var x = e.pageX - offset.left;
			var y = e.pageY - offset.top;
			var _left = Vote_Div.position().left;
			var _top = Vote_Div.position().top;
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
				if(_i_Top + Vote_Div.height() > $("body").height()){_i_Top = $("body").height() - Vote_Div.height();};//限制底部
				if(_i_Left < Vote_Div.width()/2 ){_i_Left = Vote_Div.width()/2;};//限制左边
				if( Math.abs(_i_Left) > ( $("body").width() - Vote_Div.width()/2 ) ){_i_Left = $("body").width() - Vote_Div.width()/2;};//限制右边
				
				Vote_Div.css("left",(_i_Left));
				Vote_Div.css("top",(_i_Top));
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
	function Vote_Init(_id,_tilte,narr_str,varr_str,_time,_dis,vote_speed)//名称数组和值数组
	{
		if(narr_str == "" || varr_str == "" || _time < 1){return;}
		var vote_div = $("#Y_Vote");
		var vote_title = $("#Y_Vote .Y_Vote_Title label");
		vote_title.html(_tilte);
		var vote_time = $("#Y_Vote_Time");
		_Config.Vote_Time = parseInt(_time);//倒计时
		vote_time.html(_Config.Vote_Time);
		_Config.Vote_TimeInterval = setInterval(function(){
			if(_Config.Vote_Time <= 0)
			{
				clearInterval(_Config.Vote_TimeInterval);
				vote_div.hide();
			}
			_Config.Vote_Time--;
			vote_time.html(_Config.Vote_Time);
		},1000);
		var vote_ul = $("#Y_Vote .Y_Vote_Content_List ul");
		var n_arr = narr_str.split(",");
		var v_arr = varr_str.split(",");
		var vote_html = '<li id="VoteOp_{2}"><div class="Y_Vote_Content_List_OpLeft" title="{0}"><div><label>{0}</label></div></div><div class="Y_Vote_Content_List_OpRight"><label>{1}</label><input type="button" value="投票" class="{4}" onclick="Set_Vote(this,{3},{2})"></div></li>';
		var vote_sum = 0;
		for(i=0;i < n_arr.length;i++)
		{
			var _vote_li = $.format(vote_html,unescape(n_arr[i]),v_arr[i],i,_id,_dis==-1?'Vote_Button_Enable':_dis.indexOf(i.toString())!=-1?'Vote_Button_Enable':'');
			vote_ul.append(_vote_li);
			vote_sum += parseInt(v_arr[i]);
		}
		vote_div.show();
		for(i=0;i < n_arr.length;i++)
		{
			var _n = Math.round(v_arr[i]/vote_sum*100)?Math.round(v_arr[i]/vote_sum*100):0;
			$(vote_ul.find("li")[i]).find(".Y_Vote_Content_List_OpLeft div").stop(true).animate({'width':(_n<1?1:_n)+'%'},vote_speed);
		}
	}	
	function Vote_Do(e)
	{
		var VoteOp = $("#VoteOp_" + e.VoteOp);
		var iNum = parseInt(VoteOp.find(".Y_Vote_Content_List_OpRight label").html())+1;
		VoteOp.find(".Y_Vote_Content_List_OpRight label").html(iNum);
		var vote_sum = 0;
		$("#Y_Vote .Y_Vote_Content_List_OpRight label").each(function(){
			vote_sum += parseInt($(this).html());
		});
		$("#Y_Vote li").each(function(){
			var _n = Math.round(parseInt( $(this).find(".Y_Vote_Content_List_OpRight label").html() )/vote_sum*100);
			$(this).find(".Y_Vote_Content_List_OpLeft div").stop(true).animate({'width':(_n<1?1:_n)+'%'},300);
		});
		//VoteOp.find(".Y_Vote_Content_List_OpLeft div").stop(true).animate({'width':Math.round(iNum/vote_sum*100)==0?1:Math.round(iNum/vote_sum*100)+'%'},300);
	}
	
	function Vote_GetRecord()
	{
		var vote_ul = $("#Y_Vote .Y_Vote_Content_List ul");
		vote_ul.html('');
		//ajax
		$.get("/Handle/GetVote.asp",{ac:'GetVote',rid:iRoomID,t:getDataTimes()},function(json){
			var e = eval("("+json+")");
			Vote_Init(e.id,e.title,e.ops,e.vs,e.time,e.dis,900);
		});
	}
	
	function Set_Vote(e,vote_id,_v)
	{
		if(iInfo.IsLogin == false){iTip("游客无法参与投票！");return;}
		var _This = $(e);
		if(_This.hasClass("Vote_Button_Enable") == true){iTip("您已经投过该选项！");return;}
		if( isNaN(vote_id) || isNaN(_v) ){iTip("参数错误！");return;}
		$.get("/Handle/SetVote.asp",{ac:'SetVote',vid:vote_id,v:_v,t:getDataTimes()},function(){
			if(SetVoteRe == true)
			{
				//发消息
				var o = {};
				o.Type = 'CMD_VoteUpdate';
				o.ReceiveRID = iInfo.Live_NG_ID;
				o.VoteOp = _v;
				PostMsg(o);
				//屏蔽按钮
				_This.addClass("Vote_Button_Enable");
			}
			else if(SetVoteRe == 2)
			{
				//屏蔽按钮
				_This.addClass("Vote_Button_Enable");
				iTip(SetVoteReMsg);
			}
			else
			{
				//屏蔽所有按钮
				$("#Y_Vote input").addClass("Vote_Button_Enable");
				iTip(SetVoteRe);
			}
		},"script");
	}
	
	function Start_Vote_CMD()
	{
		var o = {};
		o.Type = 'CMD_Vote_Start';
		o.ReceiveRID = iInfo.Live_NG_ID;
		PostMsg(o);
	}
	
	function Stop_Vote_CMD()
	{
		var o = {};
		o.Type = 'CMD_Vote_Stop';
		o.ReceiveRID = iInfo.Live_NG_ID;
		PostMsg(o);
	}
	
	function Start_Vote()
	{
		Vote_GetRecord();
	}
	
	function Stop_Vote()
	{
		_Config.Vote_Time = 0;
	}
	
	Vote_Bind_Drag();//绑定拖动事件
	$(function(){
		Vote_GetRecord();
	});