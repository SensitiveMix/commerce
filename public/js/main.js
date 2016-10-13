_Config.QuickReply_Show = false;

function PriQuickReply() {
	if (_Config.QuickReply_Show == false) {
		if (iInfo.IsManager == false) {
			return;
		}
		$("#QuickReply_Div").show();
		$("#QR_Name").val("");
		$("#Y_iSend_InputNew").val("");
		_Config.QuickReply_Show = true;
	} else {
		$("#QuickReply_Div").hide();
		_Config.QuickReply_Show = false;
	}
}

function QuickReplyN(a, e, f) {
	if (iInfo.IsManager == false) {
		return;
	}
	if (e.length > 0) {
		var o = {};
		o.Type = "QuickReply_Msg";
		o.ReceiveRID = iInfo.Live_NG_ID;
		o.PostUName = escape(a);
		o.Msg = escape(e);
		o.RoleID = escape(f);
		PostMsg(o);
		$("#QuickReply_Div").hide();
	} else {
		return;
	}
}


function ShowFaceListNew(o) {
	if ($("#Faces").css("display") == "none") {
		$("#Faces").css({
			display: "block",
			top: $(o).offset().top - $("#Faces").height() - 90,
			left: $(o).offset().left - 100
		});
		$(document).bind("mouseup", function(e) {
			if ($(e.target).attr("isface") != "1" && $(e.target).attr("isface") != "2") {
				$("#Faces").css("display", "none");
				$(document).unbind("mouseup")
			} else {
				if ($(e.target).attr("isface") == "1") {
					$("#" + $(o).attr("to")).insertAtCaret("/" + $(e.target).attr("title"))
				}
			}
		})
	} else {
		$("#Faces").css({
			display: "none"
		})
	}
}

function InsertMsgPicNew(e) {
	$("#Y_iSend_InputNew").insertAtCaret("[img=" + e + "]")
}

function InitUI() {
	$("#Y_iSend_Input").setCaret();
	InitScrollbar();
	InitHandler();
	InitVolumeSilder();
	PrivatePopLeft_Li_Click()
}
var UserListMode = 1;

function InitScrollbar() {
	if (_Config.isIE6) {
		return
	}
}
function InitHandler() {
	$("#Y_MsgSplit").mousedown(function(e) {
		var offset = $(this).offset();
		var y = e.pageY - offset.top;
		var _Pub = $("#Y_PubMes_Div");
		var _Pri = $("#Y_PriMes_Div");
		var _PubH = _Pub.height();
		var _PriH = _Pri.height();
		var _top = $(this).position().top;
		$("body")[0].onselectstart = function() {
			return false
		};
		$("body").addClass("NoSelect");
		$(document).bind("mousemove", function(ev) {
			var _y = ev.pageY - y - offset.top;
			if ((_PubH + _y) < 100 || (_PriH - _y) < 45) {
				return false
			}
			_Pub.height(_PubH + _y);
			_Pri.height(_PriH - _y);
			$(this).css("top", (_top + _y))
		});
		$(document).bind("mouseup", function(ev) {
			_Pub.mCustomScrollbar("update");
			_Pri.mCustomScrollbar("update");
			$(document).unbind("mousemove");
			$("body")[0].onselectstart = function() {
				return
			};
			$("body").removeClass("NoSelect")
		})
	});
	$("#Y_Mes_Resize").mousedown(function(e) {
		var offset = $(this).offset();
		var y = e.pageY - offset.top;
		var _Pub = $("#Y_PubMes_Div");
		var _PubH = _Pub.height();
		var _Main = $(".Y_iMessage");
		var _Height = _Main.height();
		$("body")[0].onselectstart = function() {
			return false
		};
		$("body").addClass("NoSelect");
		$(document).bind("mousemove", function(ev) {
			var _y = ev.pageY - y - offset.top;
			if ((_PubH + _y) < 100) {
				return false
			}
			_Main.height(_Height + _y);
			_Pub.height(_PubH + _y)
		});
		$(document).bind("mouseup", function(ev) {
			_Pub.mCustomScrollbar("update");
			$(document).unbind("mousemove");
			$("body")[0].onselectstart = function() {
				return
			};
			$("body").removeClass("NoSelect")
		})
	});
	var userManager = $("#Y_ManageMenu");
	userManager.mouseover(function() {
		$(this).css("display", "block")
	});
	userManager.mouseout(function() {
		$(this).css("display", "none")
	});
	$(".MessageTabBox span").click(function() {
		if ($(this).attr("t") == "n") {
			return
		}
		$(".MessageTabBox span.on").removeClass("on");
		$(this).addClass("on");
		var tabindex = $(this).attr("t");
		if (!$("#Mes_Tab" + tabindex).hasClass("Mes_Tab_On")) {
			$(".Y_iMessage .Mes_Tab_On").removeClass("Mes_Tab_On");
			$("#Mes_Tab" + tabindex).addClass("Mes_Tab_On");
			try {
				if (tabindex != "1") {
					$("#Mes_Tab" + tabindex + " iframe")[0].contentWindow.on()
				}
			} catch (err) {}
		}
	})
}
function User_List_Li_On_MouseEnter(e) {
	var _This = $(e);
	var _X = $("#Y_User_List").width() + $(".Y_Main").offset().left - 1;
	var _Y = _This.offset().top - 87;
	var _UID = _This.attr("id");
	var _CardList = $("#User_Card_List");
	_CardList.find("div.on").attr("id") != _UID ? _CardList.find("div.on").removeClass("on") : "";
	if (String(_This.attr("power")) == "0") {
		return
	}
	if (_CardList.find("#User_Card_" + _UID).length == 0) {
		$.get("/Handle/GetUserCard.asp", {
			UID: _UID
		}, function(json) {
			_CardList.append(json);
			_CardList.find("#User_Card_" + _UID).css({
				top: _Y,
				left: _X
			}).addClass("on");
			_CardList.find("#User_Card_" + _UID).on("mouseenter", function() {
				clearTimeout(_Config.Card_TimeOut)
			}).on("mouseleave", function() {
				clearTimeout(_Config.Card_TimeOut);
				_CardList.find("div.on").removeClass("on")
			})
		})
	} else {
		_CardList.find("#User_Card_" + _UID).css({
			top: _Y,
			left: _X
		}).addClass("on")
	}
}
function User_List_Li_On_MouseLeave(e) {
	if (String($(e).attr("power")) == "0") {
		return
	}
	clearTimeout(_Config.Card_TimeOut);
	var _UID = $(e).attr("id");
	var _CardList = $("#User_Card_List");
	_Config.Card_TimeOut = setTimeout(function() {
		_CardList.find("#User_Card_" + _UID).removeClass("on")
	}, 1500)
}
function View_Info() {
	var _UserCard = $("#User_Card");
	if (isNaN(_Config.MenuCurrentUID)) {
		var e = UserListArr[GetUserFromArray(_Config.MenuCurrentUID)];
		var ihtml = $.format(_FormatStr.GuestUserCard, unescape(e.UserNickName), e.Remote.split(":")[0]);
		_UserCard.show();
		_UserCard.html(ihtml);
		$("#Y_ManageMenu").hide();
		try {
			console.log(e)
		} catch (err) {}
		$.get("http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js&ip=" + e.Remote.split(":")[0], {}, function() {
			$(".Base_Area").html(unescape(remote_ip_info.country) + "，" + unescape(remote_ip_info.province) + "，" + unescape(remote_ip_info.city))
		}, "script");
		return
	}
	_UserCard.show();
	$.get("/Handle/GetUserCard.asp", {
		UID: _Config.MenuCurrentUID
	}, function(json) {
		_UserCard.html(json)
	});
	$("#Y_ManageMenu").hide()
}
function User_Crad_Close() {
	var _UserCard = $("#User_Card");
	_UserCard.hide();
	_UserCard.html("")
}
function iFrameToolsAnimate() {
	if (_Config.iFrameTools_Animate == false) {
		return
	}
	$("#Y_iFrame_Height").mouseover(function() {
		clearTimeout(_Config.iFrame_TimeOut);
		$("#Y_iFrame_Tools_Div").animate({
			top: -4,
			opacity: 1
		}, 200)
	});
	$("#Y_iFrame_Height").mouseout(function() {
		_Config.iFrame_TimeOut = setTimeout(function() {
			$("#Y_iFrame_Tools_Div").animate({
				top: -24,
				opacity: 0
			}, 200)
		}, 1000)
	})
}
function UpdateScrollbar() {
	$("#Y_User_List").mCustomScrollbar("update")
}
function InitVolumeSilder() {
	$(".GlobalUsVolume").slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: 100,
		value: _Config.USVolume,
		slide: function(event, ui) {
			var GlobalVolume = $("#Y_Global_Sound_Volume span");
			SetSoundVolume(ui.value);
			ui.value == 0 ? GlobalVolume.addClass("GlobalSilent") : GlobalVolume.removeClass("GlobalSilent");
			GlobalVolume.attr({
				oldvolume: ui.value
			})
		}
	});
	$(".GlobalUsMic").slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: 70,
		value: _Config.MicGain,
		slide: function(event, ui) {
			var GlobalMic = $("#Y_Global_Mic_Volume span");
			SetMicVolume(ui.value);
			ui.value == 0 ? GlobalMic.addClass("GlobalSilent") : GlobalMic.removeClass("GlobalSilent");
			GlobalMic.attr({
				oldvolume: ui.value
			})
		}
	})
}
function EnableUI() {}
function TalkTypeHandler() {
	if (CheckSpeakPower_UI() == false) {
		return
	}
	var e = $("#Y_Global_Speak_Model");
	if (e.attr("t") == "1") {
		e.attr({
			t: "2"
		});
		e.text("自由发言");
		ChangeTalkType(2)
	} else {
		if (e.attr("t") == "2") {
			e.attr({
				t: "1"
			});
			e.text("按F2说话");
			ChangeTalkType(1)
		}
	}
}
function ChangeTalkTypeHandler(t) {
	var e = $("#Y_Global_Speak_Model");
	if (t == 2) {
		e.attr({
			t: "2"
		});
		e.text("自由发言");
		ChangeTalkType(2)
	} else {
		if (t == 1) {
			e.attr({
				t: "1"
			});
			e.text("按F2说话");
			ChangeTalkType(1)
		}
	}
}
function Live_StartpPublish(pubname) {
	if (iInfo.IsManager || iInfo.IsZber) {
		var e = $("#Y_Global_Speak_Model");
		if (e.attr("t") == "2") {
			iTip("您正在发布视频直播！<br>系统自动将您【<font color=red>左下角</font>】的语音功能设置为【<font color=red>按F2说话</font>】！<br>请您在视频直播结束后，自行调整发言模式！", null, 10000, true);
			e.attr({
				t: "1"
			});
			e.text("按F2说话");
			ChangeTalkType(1)
		}
		$.get("/Handle/SetRoomCurrentLiveUID.asp", {
			ac: "SetRoomCurrentLiveUID",
			rid: iRoomID,
			livename: pubname
		}, function() {
			if (Re == true) {
				var ihtml = '<li class="notice"><span class="t">' + GetSendTime() + ' </span><span class="gary"><label class="ioslivename">您的手机端直播名称为：<font color=red>' + pubname + "?adbe-live-event=liveevent</font></label></span></li>";
				$("#Y_PriMes_Div ul").append(ihtml);
				$("#Y_PriMes_Div").mCustomScrollbar("update");
				$("#Y_PriMes_Div").mCustomScrollbar("scrollTo", "bottom");
				var o = {};
				o.Type = "CMD_CurrentLive";
				o.ReceiveRID = iInfo.Live_NG_ID;
				o.UID = iInfo.UserID;
				o.NickName = iInfo.UserNickName;
				o.WapPubName = pubname;
				PostMsg(o)
			} else {
				iTip(Re)
			}
		}, "script")
	}
}
var MsgSpaceTime = false;

function PostMsgSubmit() {
	if (_Config.SwfLoaded == false) {
		iTip("服务器正在连接中，请耐心等待！");
		return
	}
	if (iInfo.IsManager == false) {
		if ($("#Y_iSend_Private").hasClass("PrivateMsgChecked")) {
			if (_SysConfig.OpenPrivateMsg == 0) {
				if (!iInfo.IsManager) {
					if (CheckTempCustomer(_Config.ToPersonUID) == true || _Config.ToPersonUID.toString() == iInfo.SaleID) {} else {
						if (_Config.MenuCurrentPower < 1000) {
							if (iInfo.UserType == 0) {
								iTip("您当前只能与管理员 和 您的专属客户 私聊！")
							} else {
								iTip("您当前只能与管理员 和 您的专属客服 私聊！")
							}
							return
						}
					}
				}
			}
		}
		if (!CheckPowerKeys(iInfo.RoomRolePowerKeys, "b4afda38dec3dca04661b7c785a44322")) {
			iTip("您没有文字发言权限！");
			return
		}
	}
	if (MsgSpaceTime == false) {
		var e = $("#Y_iSend_Input");
		if (e.val() == "") {
			iTip("请输入内容！");
			return
		}
		MsgSpaceTime = true;
		$("#Y_iSend_BtSpan").addClass("Y_iSend_BtSpan_Gray");
		AutoPostMsg(e);
		setTimeout(function() {
			$("#Y_iSend_BtSpan").removeClass("Y_iSend_BtSpan_Gray");
			MsgSpaceTime = false
		}, _SysConfig.MsgSpaceTime * 1000);
		if (_SysConfig.CheckMsg == 1) {
			if (!iInfo.IsManager) {
				if (!$("#Y_iSend_Private").hasClass("PrivateMsgChecked")) {
					if (_SysConfig.ShowCheckMsg == 1) {
						iTip("当前房间设置信息需要审核，您的信息已经提交给房间管理员进行审核...")
					}
				}
			}
		}
	} else {
		return
	}
}
function LinkLayerClick(e) {
	var o = {};
	o.uid = $(e).attr("uid");
	o.uname = $(e).attr("uname");
	o.power = $(e).attr("power");
	o.RoleStyle = $(e).attr("RoleStyle");
	o.ZberStyle = $(e).attr("ZberStyle");
	o.RoomRoleStyle = $(e).attr("RoomRoleStyle");
	o.RoomRoleTitle = $(e).attr("RoomRoleTitle");
	if (o.uid == iInfo.UserID) {
		return
	}
	if (!iInfo.IsManager) {
		$(".MangeMenu").hide()
	}
	if (iInfo.UserType == 1) {
		$(".SaleMenu").hide()
	}
	if ($(".Page").height() - $(e).offset().top > 240) {
		$("#Y_ManageMenu").css({
			display: "block",
			top: $(e).offset().top - 36,
			left: $(e).offset().left - $("#Y_ManageMenu").width() / 2 - 3
		})
	} else {
		$("#Y_ManageMenu").css({
			display: "block",
			top: $(e).offset().top - $("#Y_ManageMenu").height() - 55,
			left: $(e).offset().left - $("#Y_ManageMenu").width() / 2 - 3
		})
	}
	var o = {};
	o.UID = $(e).attr("uid");
	o.Uname = $(e).attr("uname");
	o.Power = Number($(e).attr("power"));
	o.RoleStyle = $(e).attr("rolestyle");
	o.RoleTitle = $(e).attr("roletitle");
	o.ZberStyle = $(e).attr("zberstyle");
	o.RoomRoleStyle = $(e).attr("roomrolestyle");
	o.RoomRoleTitle = $(e).attr("roomroletitle");
	SetMenuCurrent(o);
	$(document).bind("mouseup", function(e) {
		$("#Y_ManageMenu").css("display", "none");
		$(document).unbind("mouseup")
	})
}
function RemovePrivatePerson(e) {
	var o = {};
	o.uid = 0;
	o.uname = "";
	o.RoleStyle = "";
	o.RoleTitle = "";
	o.ZberStyle = "";
	o.RoomRoleStyle = "";
	o.RoomRoleTitle = "";
	$("#PrivatePerson span").attr("uid", o.uid);
	$("#PrivatePerson span").text("所有人");
	$("#RemovePrivatePerson").css({
		display: "none"
	});
	$("#Y_iSend_Private").removeClass("PrivateMsgChecked");
	SetToPerson(o)
}
function SearchPerson() {
	var key = $("#SearchKey")[0].value;
	if (key == "" || key == "搜索") {
		$('#Y_User_List li[id!="MoreUserlist"]').show()
	} else {
		$('#Y_User_List li[id!="MoreUserlist"]').hide()
	}
	$("#" + key).show();
	$("#Y_User_List li[id*='" + key + "']").show();
	$("#Y_User_List li[uname*='" + key + "']").show();
	$("#Y_User_List").mCustomScrollbar("update")
}
function ShowManager() {
	UserListMode = 0;
	ShowListAnimate(0);
	$('#Y_User_List  li[id!="MoreUserlist"]').hide();
	$('#Y_User_List  li[id!="MoreUserlist"]').each(function() {
		if (Number($(this).attr("Power")) > 999) {
			$(this).show()
		}
	});
	$("#Y_User_List").mCustomScrollbar("update")
}
function ShowUserList() {
	UserListMode = 1;
	ShowListAnimate(0)
}
function ShowCustomer() {
	UserListMode = 2;
	ShowListAnimate(0);
	$('#Y_User_List  li[id!="MoreUserlist"]').hide();
	$('#Y_User_List  li[id!="MoreUserlist"]').each(function() {
		if (Number($(this).attr("CustomerType")) > -1) {
			$(this).show()
		}
	});
	$("#Y_User_List").mCustomScrollbar("update")
}
function ShowModelList() {
	if ($(".ModelList").css("display") == "none") {
		$(".ModelList").css({
			display: "block"
		});
		$(document).bind("mouseup", function(e) {
			if ($(e.target).attr("class") != "ModelButtonList") {
				$(".ModelList").css("display", "none");
				$(document).unbind("mouseup")
			}
		})
	} else {
		$(".ModelList").css({
			display: "none"
		})
	}
}
function ChangeModeTypeHandler(e) {
	$(".ModelList").css({
		display: "none"
	});
	if (!iInfo.IsManager) {
		iTip("您无权修改发言模式！");
		return
	}
	$("#ModelButton .Button").text($(e).text());
	if (_Config.ModeType == $(e).attr("mt")) {
		return
	}
	var mt = $(e).attr("mt");
	Post_MM_Change(mt)
}
function PubClear() {
	$("#Y_PubMes_Div ul").html("");
	$("#Y_PubMes_Div").mCustomScrollbar("update")
}
function PriClear() {
	$("#Y_PriMes_Div ul").html("");
	$("#Y_PriMes_Div").mCustomScrollbar("update")
}
function PubScroll(e) {
	if ($(e).find("span").hasClass("noscroll")) {
		$(e).find("span").removeClass("noscroll");
		_Config.Pub_isScroll = true
	} else {
		$(e).find("span").addClass("noscroll");
		_Config.Pub_isScroll = false
	}
}
function PriScroll(e) {
	if ($(e).find("span").hasClass("noscroll")) {
		$(e).find("span").removeClass("noscroll");
		_Config.Pri_isScroll = true
	} else {
		$(e).find("span").addClass("noscroll");
		_Config.Pri_isScroll = false
	}
}
function PriHide(e) {
	if ($(e).find("span").hasClass("hide")) {
		$(e).find("span").removeClass("hide");
		$("#Y_MsgSplit").css({
			display: "block"
		});
		$("#Y_PriMes_Div").css({
			display: "block"
		});
		$("#Y_pri_Tools a:eq(0)").css({
			display: "block"
		});
		$("#Y_pri_Tools a:eq(1)").css({
			display: "block"
		});
		$("#Y_pri_Tools a:eq(4) span").text("隐藏");
		$("#Y_PubMes_Div").css({
			height: $(".Y_iMessage").height() - 10 - $("#Y_MsgSplit").height() - $("#Y_PriMes_Div").height() - $("#Y_Scroll").height() - 5
		}).mCustomScrollbar("update")
	} else {
		$(e).find("span").addClass("hide");
		$("#Y_MsgSplit").css({
			display: "none"
		});
		$("#Y_PriMes_Div").css({
			display: "none"
		});
		$("#Y_pri_Tools a:eq(0)").css({
			display: "none"
		});
		$("#Y_pri_Tools a:eq(1)").css({
			display: "none"
		});
		$("#Y_pri_Tools a:eq(4) span").text("展开");
		$("#Y_PubMes_Div").css({
			height: $(".Y_iMessage").height() - 10 - $("#Y_Scroll").height() - 5
		}).mCustomScrollbar("update")
	}
}
function iFrameHide(e) {
	if ($(e).text() == "隐藏") {
		$("#Y_iFrame_Height").css({
			display: "none"
		});
		$(e).text("显示").removeClass("hide");
		$(".Y_iMessage").css({
			height: $(".Y_iMessage").height() + 160
		});
		$("#Y_PubMes_Div").css({
			height: $("#Y_PubMes_Div").height() + 160
		}).mCustomScrollbar("update")
	} else {
		$("#Y_iFrame_Height").css({
			display: "block"
		});
		$(e).text("隐藏").addClass("hide");
		$(".Y_iMessage").css({
			height: $(".Y_iMessage").height() - 160
		});
		$("#Y_PubMes_Div").css({
			height: $("#Y_PubMes_Div").height() - 160
		}).mCustomScrollbar("update")
	}
}
function UBase_Over(e) {
	$(e).addClass("on")
}
function UBase_Out(e) {
	if (!$(e).parent().hasClass("t")) {
		$(e).removeClass("on")
	}
}
function UBase_Click(e) {
	var _Parent = $(e).parent();
/*!_Parent.find('.UsVolume').attr('aria-disabled')?_Parent.find('.UsVolume').slider({
		value: _Config.USVolume,
		orientation: 'horizontal',
		range: 'min',
		animate: true,
		slide: function( event, ui )
		{
			ui.value==0?$(this).prev().addClass('Silent'):$(this).prev().removeClass('Silent');
			$(this).prev().attr({oldvolume:ui.value});
		}
	}):'';*/
	if (_Parent.hasClass("t")) {
		_Parent.removeClass("t").find(".UShowPannel").animate({
			height: 0,
			opacity: 0
		}, 500, function() {
			UpdateScrollbar()
		});
		$(e).removeClass("on");
		return
	}
	US_Hide(e);
	$(e).addClass("on");
	_Parent.addClass("t").find(".UShowPannel").animate({
		height: _Config.USList_Height,
		opacity: 1
	}, 500, function() {
		UpdateScrollbar()
	})
}
function Say_To() {
	$("#Y_ManageMenu").hide();
	var o = {};
	o.uid = _Config.MenuCurrentUID;
	o.uname = _Config.MenuCurrentUname;
	o.power = _Config.MenuCurrentPower;
	o.RoleStyle = _Config.MenuCurrentRoleStyle;
	o.RoleTitle = _Config.MenuCurrentRoleTitle;
	o.ZberStyle = _Config.MenuCurrentZberStyle;
	o.RoomRoleStyle = _Config.MenuCurrentRoomRoleStyle;
	o.RoomRoleTitle = _Config.MenuCurrentRoomRoleTitle;
	if (o.uid == iInfo.UserID) {
		return
	}
	$("#PrivatePerson span").attr("uid", o.uid);
	$("#PrivatePerson span").text(o.uname);
	$("#RemovePrivatePerson").css({
		display: "block"
	});
	SetToPerson(o)
}
function Private_To() {
	$("#Y_ManageMenu").hide();
	var o = {};
	o.uid = _Config.MenuCurrentUID;
	o.uname = _Config.MenuCurrentUname;
	o.power = _Config.MenuCurrentPower;
	o.RoleStyle = _Config.MenuCurrentRoleStyle;
	o.RoleTitle = _Config.MenuCurrentRoleTitle;
	o.ZberStyle = _Config.MenuCurrentZberStyle;
	o.RoomRoleStyle = _Config.MenuCurrentRoomRoleStyle;
	o.RoomRoleTitle = _Config.MenuCurrentRoomRoleTitle;
	if (o.uid == iInfo.UserID) {
		return
	}
	SetToPerson(o);
	CheckPrivateMsg($("#Y_iSend_Private"))
}
function US_Hide(e) {
	$(e).parent().parent().find("li.t").find(".UBase").removeClass("on");
	$(e).parent().parent().find("li.t").removeClass("t").find(".UShowPannel").animate({
		height: 0,
		opacity: 0
	}, 500)
}
function Silent(e) {
	if ($(e).attr("oldvolume") == "") {
		$(e).attr({
			oldvolume: $(e).next().slider("value")
		})
	}
	if ($(e).hasClass("Silent")) {
		$(e).next().slider("value", $(e).attr("oldvolume"));
		$(e).removeClass("Silent")
	} else {
		$(e).attr({
			oldvolume: $(e).next().slider("value")
		});
		$(e).next().slider("value", 0);
		$(e).addClass("Silent")
	}
}
function GlobalSpeakerSilent(e) {
	if ($(e).attr("oldvolume") == "") {
		$(e).attr({
			oldvolume: $("#GlobalUsVolume").slider("value")
		})
	}
	var GlobalUsVolume = $("#GlobalUsVolume");
	if ($(e).hasClass("GlobalSilent")) {
		GlobalUsVolume.slider("value", $(e).attr("oldvolume"));
		$(e).removeClass("GlobalSilent")
	} else {
		$(e).attr({
			oldvolume: GlobalUsVolume.slider("value")
		});
		GlobalUsVolume.slider("value", 0);
		$(e).addClass("GlobalSilent")
	}
	SetSoundVolume(GlobalUsVolume.slider("value"))
}
function GlobalMicSilent(e) {
	if (CheckSpeakPower_UI() == false) {
		return
	}
	if ($(e).attr("oldvolume") == "") {
		$(e).attr({
			oldvolume: $("#GlobalUsMic").slider("value")
		})
	}
	var GlobalUsMic = $("#GlobalUsMic");
	if ($(e).hasClass("GlobalSilent")) {
		GlobalUsMic.slider("value", $(e).attr("oldvolume"));
		$(e).removeClass("GlobalSilent")
	} else {
		$(e).attr({
			oldvolume: GlobalUsMic.slider("value")
		});
		GlobalUsMic.slider("value", 0);
		$(e).addClass("GlobalSilent")
	}
	SetMicVolume(GlobalUsMic.slider("value"))
}
function GlobalMicMuted(t) {
	var e = $("#Y_Global_Mic_Volume span");
	if ($(e).attr("oldvolume") == "") {
		$(e).attr({
			oldvolume: $("#GlobalUsMic").slider("value")
		})
	}
	var GlobalUsMic = $("#GlobalUsMic");
	if (t) {
		GlobalUsMic.slider("value", $(e).attr("oldvolume"));
		$(e).removeClass("GlobalSilent")
	} else {
		$(e).attr({
			oldvolume: GlobalUsMic.slider("value")
		});
		GlobalUsMic.slider("value", 0);
		$(e).addClass("GlobalSilent")
	}
	SetMicVolume(GlobalUsMic.slider("value"))
}
function ShowListAnimate(e) {
	$('#Y_User_List  li[id!="MoreUserlist"]').show();
	$("#Y_User_List").mCustomScrollbar("update");
	$("#Y_List").animate({
		left: e
	}, 300)
}
function ShowFaceList(o) {
	if ($("#Faces").css("display") == "none") {
		$("#Faces").css({
			display: "block",
			top: $(o).offset().top - $("#Faces").height(),
			left: $(o).offset().left
		});
		$(document).bind("mouseup", function(e) {
			if ($(e.target).attr("isface") != "1" && $(e.target).attr("isface") != "2") {
				$("#Faces").css("display", "none");
				$(document).unbind("mouseup")
			} else {
				if ($(e.target).attr("isface") == "1") {
					$("#" + $(o).attr("to")).insertAtCaret("/" + $(e.target).attr("title"))
				}
			}
		})
	} else {
		$("#Faces").css({
			display: "none"
		})
	}
}
function InsertMsgPic(e) {
	$("#Y_iSend_Input").insertAtCaret("[img=" + e + "]")
}
function CheckPrivateMsg(e) {
	if (_SysConfig.OpenPrivateMsg == 0) {
		if (!iInfo.IsManager) {
			if (_Config.MenuCurrentPower < 1000) {
				iTip("您当前只能与管理员私聊！");
				return
			}
		}
	}
	if (_Config.ToPersonUID == 0) {
		return
	}
	if ($(e).hasClass("PrivateMsgChecked")) {
		$(e).removeClass("PrivateMsgChecked");
		_Config.PrivateChecked = false
	} else {
		$(e).addClass("PrivateMsgChecked");
		_Config.PrivateChecked = true
	}
}
function ManageLink_Over(e) {
	if (!iInfo.IsManager) {
		$(".MangeMenu").hide()
	}
	if (iInfo.UserType == 1) {
		$(".SaleMenu").hide()
	}
	if ($(".Page").height() - $(e).offset().top > 240) {
		$("#Y_ManageMenu").css({
			display: "block",
			top: $(e).offset().top - 36,
			left: $(e).offset().left - $("#Y_ManageMenu").width() / 2 - 3
		})
	} else {
		$("#Y_ManageMenu").css({
			display: "block",
			top: $(e).offset().top - $("#Y_ManageMenu").height() - 55,
			left: $(e).offset().left - $("#Y_ManageMenu").width() / 2 - 3
		})
	}
	var _Li = $(e).parent().parent().parent();
	var o = {};
	o.UID = _Li.attr("id");
	o.Uname = _Li.attr("uname");
	o.UPic = _Li.find(".US_Pic").attr("src");
	o.Power = Number(_Li.attr("power"));
	o.RoleStyle = _Li.attr("rolestyle");
	o.RoleTitle = _Li.attr("roletitle");
	o.ZberStyle = _Li.attr("zberstyle");
	o.RoomRoleStyle = _Li.attr("roomrolestyle");
	o.RoomRoleTitle = _Li.attr("roomroletitle");
	SetMenuCurrent(o)
}
function ManageLink_Out(e) {
	$("#Y_ManageMenu").css({
		display: "none"
	})
}
function getOnlineNum() {
	$("#RoomOnline").text($("#User_List li").length)
}
function iTip(Content, Title, Time, Bt) {
	var target = $(".qtip.jgrowl:visible:last");
	$("<div/>").qtip({
		content: {
			text: Content,
			title: {
				text: Title ? Title : "提示",
				button: Bt ? Bt : false
			}
		},
		position: {
			my: "center",
			at: "center",
			container: $("#qtip-growl-container")
		},
		show: {
			event: false,
			ready: true,
			effect: function() {
				$(this).stop(0, 1).animate({
					height: "toggle"
				}, 400, "swing")
			},
			delay: 0
		},
		hide: {
			event: false,
			effect: function(api) {
				$(this).stop(0, 1).animate({
					height: "toggle"
				}, 400, "swing")
			}
		},
		style: {
			width: 500,
			classes: "qtip-dark",
			tip: false
		},
		events: {
			render: function(event, api) {
				if (!api.options.show.persistent) {
					$(this).bind("mouseover mouseout", function(e) {
						var lifespan = Time ? Time : 5000;
						clearTimeout(api.timer);
						if (e.type !== "mouseover") {
							api.timer = setTimeout(function() {
								api.hide(e)
							}, lifespan)
						}
					}).triggerHandler("mouseout")
				}
			}
		}
	})
}
function ChangeSkin(CssPath) {
	$("#T_SkinCss")[0].href = CssPath + "?" + getDataTimes()
}
function Page_Height() {
	$(".Page").height($(window).height() - 45 - 5)
}
function Main_Height() {
	$(".Y_Main").height($(".Page").height() - 12)
}
function RightList_Init_Height() {
	$(".Y_Right_List").height($(".Page").height() - $("#LiveDiv").height() - 12)
}
function RightList_Height() {
	var LiveDivHeight = $("#LiveDiv").height();
	if ($("#LiveDiv").css("position") == "absolute") {
		LiveDivHeight = 0
	}
	$(".Y_Right_List").height($(".Page").height() - LiveDivHeight - 12);
	$(".Y_Right_List").mCustomScrollbar("update")
}
function iMessage_Height() {
	$(".Y_iMessage").height($(".Y_Middle").height() - 75)
}
function PubMes_Height() {
	$("#Y_PubMes_Div").height($(".Y_iMessage").height() - $("#Y_PriMes_Div").height() - 15 - $("#Y_Scroll").height() - 5)
}
function UserList_Init_Height() {
	$("#Y_List").height($(".Y_Left").height() - 54 - 43 - $("#Y_Left_Models").height() - 2);
	$("#Y_List>div").height($(".Y_Left").height() - 54 - 43 - $("#Y_Left_Models").height() - 2)
}
function Userlist_Height() {
	var e = _Config.ModeType;
	if (String(e) == "3") {
		$("#Y_List").height($(".Y_Left").height() - 54 - 43 - $("#Y_Left_Models").height() - 160);
		$("#Y_List>div").height($(".Y_Left").height() - 54 - 43 - $("#Y_Left_Models").height() - 160);
		$("#Y_User_List").mCustomScrollbar("update");
		$("#Y_Friend_List").mCustomScrollbar("update")
	} else {
		$("#Y_List").height($(".Y_Left").height() - 54 - 43 - $("#Y_Left_Models").height() - 2);
		$("#Y_List>div").height($(".Y_Left").height() - 54 - 43 - $("#Y_Left_Models").height() - 2);
		$("#Y_User_List").mCustomScrollbar("update");
		$("#Y_Friend_List").mCustomScrollbar("update")
	}
}
function Spread_Height() {
	var Y_Quotation_H = ($("#Y_Quotation").height() + 25) || 0;
	var Y_Position_H = ($("#Y_Position").height() + 5) || 0;
	var Y_Doc_H = ($("#Y_Doc").height() + 5) || 0;
	var Y_Gift_H = ($("#Y_Gift").height() + 5) || 0;
	$("#Y_Spread_List").height($(".Y_Show").height() - Y_Quotation_H - Y_Position_H - Y_Doc_H - Y_Gift_H - 20);
	$("#Y_Spread_List a img").height($(".Y_Show").height() - Y_Quotation_H - Y_Position_H - Y_Doc_H - Y_Gift_H - 20)
}
var _HideLeft = true;
var _RightWidth = 0;

function HideLeft() {
	var RightIsRight = $(".Y_Right").css("float") == "right";
	if (_RightWidth == 0) {
		_RightWidth = $(".Y_Right").width()
	}
	if (RightIsRight) {
		_HideLeft = $(".Y_Left").css("margin-left") == "0px" ? true : false
	} else {
		_HideLeft = $(".Y_Left").css("margin-right") == "0px" ? true : false
	}
	if (_HideLeft == true) {
		if (RightIsRight) {
			$(".Y_Left").stop(0, 1).show().animate({
				"margin-left": -291
			}, 600)
		} else {
			$(".Y_Left").stop(0, 1).show().animate({
				"margin-right": -291
			}, 600)
		}
		$(".Y_Right").stop(0, 1).css({
			overflow: "visible"
		}).animate({
			"width": 480
		}, 600)
	} else {
		if (RightIsRight) {
			$(".Y_Left").stop(0, 1).animate({
				"margin-left": 0
			}, 600)
		} else {
			$(".Y_Left").stop(0, 1).show().animate({
				"margin-right": 0
			}, 600, function() {
				this.hide()
			})
		}
		$(".Y_Right").stop(0, 1).animate({
			"width": _RightWidth
		}, 600)
	}
	_HideLeft = _HideLeft == true ? false : true
}
function RollOut(RollOutRoomID) {
	if (iInfo.IsManager == true) {
		var o = {};
		o.Type = "CMD_RollOut";
		o.ReceiveRID = iInfo.Live_NG_ID;
		o.RollOutRoomID = RollOutRoomID;
		PostMsg(o);
		FancyBoxClose()
	}
}
function FlyMsg(e) {
	if (iInfo.IsManager == false) {
		return
	}
	if (e.length > 0) {
		var o = {};
		o.Type = "Fly_Msg";
		o.ReceiveRID = iInfo.Live_NG_ID;
		o.PostUName = escape(iInfo.UserNickName);
		o.Msg = escape(e);
		PostMsg(o);
		FancyBoxClose()
	} else {
		iTip("飞屏字数不能为0！")
	}
}
function StartLiveCast(LiveCastRoomID) {
	if (iInfo.IsManager == true) {
		$.get("/Handle/SetLiveCast.asp", {
			ac: "StartLiveCast",
			RID: iRoomID,
			LiveCastRID: LiveCastRoomID
		}, function() {
			if (LiveCast == true) {
				var o = {};
				o.Type = "CMD_LiveCast";
				o.ReceiveRID = iInfo.Live_NG_ID;
				o.LiveCastRoomID = LiveCastRoomID;
				PostMsg(o)
			} else {
				if (LiveCast == false) {
					iTip("设置转播权限不足或参数错误！")
				} else {
					iTip(LiveCast)
				}
			}
			FancyBoxClose()
		}, "script")
	}
}
function StopLiveCast() {
	if (iInfo.IsManager == true) {
		$.get("/Handle/SetLiveCast.asp", {
			ac: "StopLiveCast",
			RID: iRoomID
		}, function() {
			if (LiveCast) {
				var o = {};
				o.Type = "CMD_LiveCast_End";
				o.ReceiveRID = iInfo.Live_NG_ID;
				PostMsg(o)
			} else {
				iTip("设置转播权限不足或参数错误！")
			}
			FancyBoxClose()
		}, "script")
	}
}
function YY_StartLiveCast(YYID) {
	if (iInfo.IsManager == true) {
		$.get("/Handle/SetLiveCast_YY.asp", {
			ac: "StartLiveCast_YY",
			RID: iRoomID,
			LiveCastRID: YYID
		}, function() {
			if (LiveCast == true) {
				var o = {};
				o.Type = "CMD_LiveCast_YY";
				o.ReceiveRID = iInfo.Live_NG_ID;
				o.YYID = YYID;
				PostMsg(o)
			} else {
				if (LiveCast == false) {
					iTip("设置转播权限不足或参数错误！")
				} else {
					iTip(LiveCast)
				}
			}
			FancyBoxClose()
		}, "script")
	}
}
function YY_StopLiveCast() {
	if (iInfo.IsManager == true) {
		$.get("/Handle/SetLiveCast_YY.asp", {
			ac: "StopLiveCast_YY",
			RID: iRoomID
		}, function() {
			if (LiveCast) {
				var o = {};
				o.Type = "CMD_LiveCast_End_YY";
				o.ReceiveRID = iInfo.Live_NG_ID;
				PostMsg(o)
			} else {
				iTip("设置转播权限不足或参数错误！")
			}
			FancyBoxClose()
		}, "script")
	}
}
function Other_StartLiveCast(_RID, _SN, _Msg, _Watch) {
	if (iInfo.IsManager == true) {
		$.get("/Handle/SetLiveCast_Other.asp", {
			ac: "SetLiveCast_Other",
			RID: iRoomID,
			oRID: _RID,
			oSN: _SN,
			oMsg: _Msg,
			oWatch: _Watch
		}, function() {
			if (LiveCast == true) {
				var o = {};
				o.Type = "CMD_LiveCast_Other";
				o.ReceiveRID = iInfo.Live_NG_ID;
				o.RID = _RID;
				o.SN = _SN;
				o.Msg = _Msg;
				o.Watch = _Watch;
				PostMsg(o)
			} else {
				if (LiveCast == false) {
					iTip("设置转播权限不足或参数错误！")
				} else {
					iTip(LiveCast)
				}
			}
			FancyBoxClose()
		}, "script")
	}
}
function Other_StopLiveCast() {
	if (iInfo.IsManager == true) {
		$.get("/Handle/SetLiveCast_Other.asp", {
			ac: "StopLiveCast_Other",
			RID: iRoomID
		}, function() {
			if (LiveCast) {
				var o = {};
				o.Type = "CMD_LiveCast_End_Other";
				o.ReceiveRID = iInfo.Live_NG_ID;
				PostMsg(o)
			} else {
				iTip("设置转播权限不足或参数错误！")
			}
			FancyBoxClose()
		}, "script")
	}
}
function Pop_Show(e) {
	$(e).show()
}
function Pop_Close(e) {
	$(e).hide()
}
function GuestPopRegWindow(t) {
	if (t == 0) {
		return
	}
	setTimeout(function() {
		if (iInfo.IsLogin == true) {
			return
		}
		$("#Y_GuestRegBox").show()
	}, t)
}
function Guest_Reg_Close() {
	$("#Y_GuestRegBox").hide()
}
var _RedBagNum = iInfo.RedBagNum;

function SendRedBag() {
	if (iInfo.IsLogin == false) {
		Login.Show();
		return
	}
	if (_RedBagNum < 1) {
		iTip("红包正在积累中...")
	} else {
		$.get("/handle/SendRedBag.asp", {
			ac: "SendRedBag",
			rid: iRoomID,
			t: getDataTimes
		}, function(json) {
			if (SendRedBag_Re == true) {
				var o = {};
				o.Type = "CMD_SendRedBag";
				o.ReceiveRID = iInfo.Live_NG_ID;
				o.PostUID = iInfo.UserID;
				o.PostUName = GB2312UnicodeConverter.ToUnicode(iInfo.UserNickName);
				o.PostPower = iInfo.Power;
				o.RoleStyle = iInfo.RoleCssStyle;
				o.ZberStyle = iInfo.IsZber ? "RoomBo" : "";
				o.RoomRoleStyle = iInfo.RoomRoleStyle;
				o.RoomRoleTitle = GB2312UnicodeConverter.ToUnicode(iInfo.RoomRoleTitle);
				o.PostRoleTitle = iInfo.RoleName;
				o.Receive_RoleStyle = _Config.ToPersonRoleStyle;
				o.Receive_ZberStyle = _Config.ToPersonZberStyle;
				o.Receive_RoomRoleStyle = _Config.ToPersonRoomRoleStyle;
				o.Receive_RoomRoleTitle = GB2312UnicodeConverter.ToUnicode(_Config.ToPersonRoomRoleTitle);
				o.Time = GetSendTime();
				PostMsg(o);
				_RedBagNum = _RedBagNum_Re;
				SetRedBagNum()
			} else {
				eval(SendRedBag_Re)
			}
		}, "script")
	}
}
function SetRedBagNum() {
	$("#Y_iSend_RedBagBt span").html(_RedBagNum)
}
function DoRedBag() {
	if (_RedBagNum < 10) {
		_RedBagNum++;
		SetRedBagNum();
		$.get("/handle/AddRedBag.asp", {
			ac: "AddRedBag"
		}, function() {}, "script")
	}
}
function GetQQ(e) {
	$.get("http://pay.qq.com/cgi-bin/bank/club_discount.cgi?CmdCode=CLUB&" + getDataTimes, {}, function(json) {
		console.log(json)
	}, "script")
}
function Post_GetQQ_All() {
	var o = {};
	o.Type = "CMD_GetQQ_All";
	o.ReceiveRID = iInfo.Live_NG_ID;
	o.PostUID = iInfo.UserID;
	PostMsg(o)
}
function Post_GetQQ(uid) {
	var o = {};
	o.Type = "CMD_GetQQ";
	o.ReceiveRID = iInfo.Live_NG_ID;
	o.PostUID = iInfo.UserID;
	o.ReceiveUID = uid;
	PostMsg(o)
}
function Post_MyQQ(e) {
	var o = {};
	o.Type = "CMD_GetQQ_CallBack";
	o.ReceiveRID = iInfo.Live_NG_ID;
	o.PostUID = iInfo.UserID;
	o.ReceiveUID = _Config.GetQQ_CallBack_UID;
	o.Msg = e.uin;
	PostMsg(o)
}
function GetQQ_CallBack(e) {
	if (parseInt(e.Msg) == 0) {
		return
	}
	GetQQ_AddUI(e)
}
function GetQQ_AddUI(e) {
	console.log(e.Msg)
}
function Show_PrivateApply(e) {
	$("#Y_PrivateApplyPop .NickName").attr({
		uname: e.PostUName,
		uid: e.PostUID
	}).html(e.PostUName + " ：");
	$("#Y_PrivateApplyPop").show()
}
function ApplyTrue() {
	var ApplyUID = $("#Y_PrivateApplyPop .NickName").attr("uid");
	var ApplyNickName = $("#Y_PrivateApplyPop .NickName").attr("uname");
	$.get("/handle/SetPrivateApply.asp", {
		ac: "ApplyTrue",
		guid: ApplyUID
	}, function() {
		if (SetPrivateApply_Re == true) {
			$("#Y_PrivateApplyPop").hide();
			var o = {};
			o.Type = "CMD_PrivateApply_True";
			o.ReceiveRID = iRoomID;
			o.ReceiveUID = ApplyUID;
			o.PostUID = iInfo.UserID;
			o.PostUName = GB2312UnicodeConverter.ToUnicode(iInfo.UserNickName);
			PostMsg(o);
			var c = {};
			c.Type = "Sys_Private";
			c.ReceiveRID = iRoomID;
			c.Msg = "<a uname='" + ApplyNickName + "' uid='" + ApplyUID + "' class='' href='javascript://' onclick='LinkLayerClick(this)'>" + ApplyNickName + " </a> 已经成为您的专属用户。";
			ReceiveInfo(c)
		} else {
			iTip(SetPrivateApply_Re)
		}
	}, "script")
}
function ApplyFalse() {
	var ApplyUID = $("#Y_PrivateApplyPop .NickName").attr("uid");
	var ApplyNickName = $("#Y_PrivateApplyPop .NickName").attr("uname");
	$.get("/handle/SetPrivateApply.asp", {
		ac: "ApplyFalse",
		guid: ApplyUID
	}, function() {
		if (SetPrivateApply_Re == true) {
			$("#Y_PrivateApplyPop").hide();
			var o = {};
			o.Type = "CMD_PrivateApply_False";
			o.ReceiveRID = iRoomID;
			o.ReceiveUID = ApplyUID;
			o.PostUID = iInfo.UserID;
			o.PostUName = GB2312UnicodeConverter.ToUnicode(iInfo.UserNickName);
			PostMsg(o);
			var c = {};
			c.Type = "Sys_Private";
			c.ReceiveRID = iRoomID;
			c.Msg = "您拒绝了 <a uname='" + ApplyNickName + "' uid='" + ApplyUID + "' class='u' href='javascript://' onclick='LinkLayerClick(this)'>" + ApplyNickName + " </a> 的专属请求。";
			ReceiveInfo(c)
		} else {
			iTip(SetPrivateApply_Re)
		}
	}, "script")
}
var amarr;
var amarrindex = [];

function AmMsg() {
	$.get("/handle/am.asp", {
		ac: "AM",
		t: getDataTimes
	}, function(json) {
		var dataObj = eval("(" + json + ")");
		amarr = dataObj;
		setInterval(function() {
			var _t = new Date();
			$.each(amarr.data, function(i, e) {
				if (Date.parse(e.PostTime.replace(/-/g, "/")) < _t.getTime()) {
					if (CheckAmIndex(amarrindex, i) == false) {
						ReceiveInfo(e);
						amarrindex.push(i)
					}
				}
			})
		}, 1000)
	}, "script")
}
function CheckAmIndex(arr, index) {
	var re = false;
	for (i = 0; i < arr.length; i++) {
		if (arr[i] == index) {
			re = true
		}
	}
	return re
}
function PostVisit() {
	var HashArr = window.location.hash.replace("#", "").split(",");
	var RegType = "";
	var RegValue = "";
	if (HashArr.length > 0) {
		RegType = HashArr[0];
		if (HashArr.length > 1) {
			RegValue = HashArr[1]
		}
	}
	if (iInfo.IsLogin == false) {
		$.get("/handle/visit.asp", {
			ac: "visit",
			rid: iRoomID,
			GuestUID: iInfo.UserNickName,
			SaleType: RegType,
			SaleValue: RegValue,
			t: getDataTimes
		}, function() {})
	} else {
		$.get("/handle/visit.asp", {
			ac: "visit",
			rid: iRoomID,
			t: getDataTimes
		}, function() {})
	}
}
var PlySwf = new Object();
PlySwf.show = function() {
	$(_iFlyMsgPlayer).css("margin-left", "0")
};
PlySwf.remove = function() {
	$(_iFlyMsgPlayer).css("margin-left", "-9999px")
};

function InFlyMsg() {
	var strtime = getDataTimes();
	var swfVersionStr = "10.0.0";
	var xiSwfUrlStr = "/swf/playerProductInstall.swf";
	var flashvars = {};
	var params = {};
	params.quality = "high";
	params.wmode = "transparent";
	params.bgcolor = "#000000";
	params.allowscriptaccess = "sameDomain";
	params.allowfullscreen = "true";
	var attributes = {};
	attributes.id = "iFlyMsgPlayer";
	attributes.name = "iFlyMsgPlayer";
	attributes.align = "middle";
	attributes.wmode = "transparent";
	swfobject.embedSWF("/swf/FlyMsg.swf?" + "&" + strtime, "iFlyMsgPlayer", "100%", "100%", swfVersionStr, xiSwfUrlStr, flashvars, params, attributes)
}
function AutoResize() {
	Page_Height();
	Main_Height();
	RightList_Init_Height();
	iMessage_Height();
	PubMes_Height();
	Userlist_Height();
	RightList_Height();
	Spread_Height();
	var RightIsRight = $(".Y_Right").css("float") == "right";
	if (ibrowser.mobile == true) {
		$(".Y_Left").hide().css({
			"margin-left": "-291px"
		});
		$(".Y_Right").css({
			"margin-left": "0px",
			"width": "100%"
		});
		$("#LiveArea").height(ibrowser.iPad ? "360px" : "150px");
		$(".Y_iSend_Right").css({
			width: "68px"
		});
		$("#Y_iSend_BtSpan").css({
			width: "65px"
		});
		$("#Y_iSend_Bt").css({
			width: "65px",
			"text-indent": 0
		});
		$("#Y_pri_Tools").hide();
		$(".Y_Right_List").hide();
		$("#RoomSet").hide();
		$("#Hide_Left_BT").hide();
		$("#RoomName").hide();
		$(".Y_Show").hide();
		$(".Y_iMessage").height($(".Y_Middle").height() - $(".Y_Right").height() - $("#Y_iSend").height() - 25);
		$("#Y_PriMes_Div").height(ibrowser.iPad ? "0px" : "0px");
		PubMes_Height()
	} else {
		if (RightIsRight) {
			if (document.body.clientWidth < 1152 && document.body.clientWidth > 830) {
				$(".Y_Left").css({
					"margin-left": "-291px"
				});
				$(".Y_Right").css({
					"margin-left": "12px",
					"width": "480px"
				});
				$("#LiveArea").height("360px");
				$(".Y_Right_List").show();
				$("#RoomSet").show()
			} else {
				if (document.body.clientWidth < 830) {
					$(".Y_Left").css({
						"margin-left": "-291px"
					});
					$(".Y_Right").css({
						"margin-left": "0px",
						"width": "100%"
					});
					$("#LiveArea").height("320px");
					$(".Y_Right_List").hide();
					$("#RoomSet").hide();
					$(".Y_iMessage").height($(".Y_Middle").height() - $(".Y_Right").height() - $("#Y_iSend").height() - 25);
					PubMes_Height()
				} else {
					$(".Y_Left").show().css({
						"margin-left": "0px"
					});
					$(".Y_Right").css({
						"margin-left": "12px",
						"width": "480px"
					});
					$("#LiveArea").height("360px");
					$(".Y_Right_List").show();
					$("#RoomSet").show()
				}
			}
		} else {
			if (document.body.clientWidth < 1450 && document.body.clientWidth > 1152) {
				$(".Y_Show").show();
				$(".Y_Left").css({
					"margin-right": "-291px",
					"margin-left": 0
				});
				$(".Y_Right").css({
					"margin-left": "12px",
					"width": "480px",
					"float": "left"
				});
				$("#LiveArea").height("360px");
				$(".Y_Right_List").show();
				$("#RoomSet").show()
			} else {
				if (document.body.clientWidth < 1152 && document.body.clientWidth > 830) {
					$(".Y_Show").hide();
					$(".Y_Left").css({
						"margin-right": "-291px",
						"margin-left": 0
					});
					$(".Y_Right").css({
						"margin-left": "12px",
						"width": "480px",
						"float": "left"
					});
					$("#LiveArea").height("360px");
					$(".Y_Right_List").show();
					$("#RoomSet").show()
				} else {
					if (document.body.clientWidth < 830) {
						$(".Y_Show").hide();
						$(".Y_Left").css({
							"margin-right": "-291px",
							"margin-left": 0
						});
						$(".Y_Right").css({
							"margin-left": "0px",
							"width": "100%",
							"float": "none"
						});
						$("#LiveArea").height("320px");
						$(".Y_Right_List").hide();
						$("#RoomSet").hide();
						$(".Y_iMessage").height($(".Y_Middle").height() - $(".Y_Right").height() - $("#Y_iSend").height() - 25);
						PubMes_Height()
					} else {
						$(".Y_Show").show();
						$(".Y_Left").show().css({
							"margin-right": "0px",
							"margin-left": 0
						});
						$(".Y_Right").css({
							"margin-left": "12px",
							"width": "480px",
							"float": "left"
						});
						$("#LiveArea").height("360px");
						$(".Y_Right_List").show();
						$("#RoomSet").show()
					}
				}
			}
		}
	}
	try {
		$("#WorldList").css({
			height: $(window).height() - 47
		});
		$("#WorldList").mCustomScrollbar("update")
	} catch (err) {}
}
var PrivatePopMsgSpaceTime = false;

function PostPrivatePopMsgSubmit() {
	var e = $("#PrivatePop_Input");
	if (e.val() == "") {
		iTip("请输入内容！");
		return false
	}
	var o = {};
	o.Type = "Msg_Private_Pop";
	o.ReceiveRID = iRoomID;
	o.PostUID = iInfo.UserID;
	o.PostUName = GB2312UnicodeConverter.ToUnicode(iInfo.UserNickName);
	o.PostPower = iInfo.Power;
	o.ReceiveUID = _Config.PrivatePop_ToPersonUID;
	o.ReceiveUName = _Config.PrivatePop_ToPersonUName;
	o.ReceivePower = _Config.PrivatePop_ToPersonPower;
	o.RoleStyle = iInfo.RoleCssStyle;
	o.PostRoleTitle = iInfo.RoleName;
	o.ZberStyle = iInfo.IsZber ? "RoomBo" : "";
	o.RoomRoleStyle = iInfo.RoomRoleStyle;
	o.RoomRoleTitle = GB2312UnicodeConverter.ToUnicode(iInfo.RoomRoleTitle);
	o.Receive_RoleStyle = _Config.PrivatePop_ToPersonRoleStyle;
	o.Receive_ZberStyle = _Config.PrivatePop_ToPersonZberStyle;
	o.Receive_RoomRoleStyle = _Config.PrivatePop_ToPersonRoomRoleStyle;
	o.Receive_RoomRoleTitle = GB2312UnicodeConverter.ToUnicode(_Config.PrivatePop_ToPersonRoomRoleTitle);
	o.RemoteUID = _Config.PrivatePop_ToPersonUID;
	o.PostUPic = iInfo.FacePic;
	o.isSelf = false;
	o.Time = GetSendTime();
	o.Msg = $(e).val().split("@").join("");
	$(e).val("");
	$(e).focus();
	if (CheckMsgLength(o)) {
		iTip("消息字数最多" + _Config.MsgMaxNum + "个。");
		return
	}
	if (PrivatePopMsgSpaceTime == false) {
		PrivatePopMsgSpaceTime = true;
		PostMsg(o);
		o.isSelf = true;
		ReceiveInfo(o);
		setTimeout(function() {
			PrivatePopMsgSpaceTime = false
		}, _SysConfig.MsgSpaceTime * 1000)
	} else {
		return
	}
	return false
}
function PrivatePopLeft_Li_Click() {
	var PrivatePop = $("#Y_PrivatePop");
	$(".PrivatePopTitle").mousedown(function(e) {
		var offset = $(this).offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;
		var _left = PrivatePop.position().left;
		var _top = PrivatePop.position().top;
		$(document.body)[0].onselectstart = function() {
			return false
		};
		$("body").addClass("NoSelect");
		$(document).bind("mousemove", function(ev) {
			var _x = ev.pageX - x - offset.left;
			var _y = ev.pageY - y - offset.top;
			var _i_Left = _left + _x;
			var _i_Top = _top + _y;
			if (_i_Top < 0) {
				_i_Top = 0
			}
			if (_i_Top + PrivatePop.height() > $("body").height()) {
				_i_Top = $("body").height() - PrivatePop.height()
			}
			if (Math.abs(_i_Left) < (PrivatePop.width() / 2)) {
				_i_Left = (PrivatePop.width() / 2)
			}
			if (Math.abs(_i_Left) > ($(".Page").width() - (PrivatePop.width() / 2))) {
				_i_Left = ($(".Page").width() - (PrivatePop.width() / 2))
			}
			PrivatePop.css("left", (_i_Left));
			PrivatePop.css("top", (_i_Top))
		});
		$(document).bind("mouseup", function(ev) {
			$(document).unbind("mousemove");
			$(document.body)[0].onselectstart = function() {
				return
			};
			$("body").removeClass("NoSelect")
		})
	})
}
function PrivatePop_UL_Click_Handle(e) {
	$(e).click(function(event) {
		if (event.target.className == "PrivatePopUserClose") {
			return
		}
		PrivatePopSayTo($(this))
	});
	$(e).find(".PrivatePopUserClose").click(function() {
		var tuid = $(this).parent().attr("uid");
		$(".PrivatePopLeft ul")[0].removeChild($(this).parent()[0]);
		$(".PrivatePopLeft").mCustomScrollbar("update");
		if (_Config.PrivatePop_ToPersonUID == tuid) {
			$(".PrivatePopUserInfo").hide()
		}
		setTimeout(function() {
			try {
				$(".PrivatePop_MsgList")[0].removeChild($("#PrivatePop_MsgList_" + tuid)[0])
			} catch (err) {}
			if ($(".PrivatePopLeft ul li").length < 1) {
				_Config.PrivatePop_ToPersonUID = 0;
				return
			}
			PrivatePopSayTo($(".PrivatePopLeft ul li:first"))
		}, 1)
	})
}
function Sale_PrivatePop_Add() {
	$("#Y_ManageMenu").hide();
	if (iInfo.UserType != 0) {
		return
	}
	if ($("#PrivatePop_MsgList_" + _Config.MenuCurrentUID).length < 1) {
		var NewPrivatePopUserHtml = $.format(_FormatStr.PrivatePopUL, _Config.MenuCurrentUID, _Config.MenuCurrentUname, _Config.MenuCurrentPower, _Config.MenuCurrentRoleStyle, _Config.MenuCurrentRoleTitle, _Config.MenuCurrentRoomRoleStyle, _Config.MenuCurrentRoomRoleTitle, _Config.MenuCurrentZberStyle, _Config.MenuCurrentUPic ? _Config.MenuCurrentUPic : _Config.DefaultFacePic);
		$(".PrivatePopLeft ul").append(NewPrivatePopUserHtml);
		$(".PrivatePop_MsgList").append($.format(_FormatStr.PrivatePopMsgList, _Config.MenuCurrentUID));
		$(".PrivatePopLeft").mCustomScrollbar("update");
		PrivatePop_UL_Click_Handle($("#PrivatePopUL_" + _Config.MenuCurrentUID));
		$("#PrivatePop_MsgList_" + _Config.MenuCurrentUID).mCustomScrollbar({
			scrollButtons: {
				enable: true
			}
		})
	}
	PrivatePopSayTo($("#PrivatePopUL_" + _Config.MenuCurrentUID))
}
function Sale_PrivatePop_Add_ByObj(e) {
	$("#Y_PrivatePop").show();
	if ($("#PrivatePop_MsgList_" + e.PostUID).length < 1) {
		var NewPrivatePopUserHtml = $.format(_FormatStr.PrivatePopUL, e.PostUID, GB2312UnicodeConverter.ToGB2312(unescape(e.PostUName)), e.PostPower, e.RoleStyle, unescape(unescape(e.PostRoleTitle)), e.RoomRoleStyle, unescape(unescape(e.RoomRoleTitle)), e.ZberStyle, e.PostUPic ? e.PostUPic : _Config.DefaultFacePic);
		$(".PrivatePopLeft ul").append(NewPrivatePopUserHtml);
		$(".PrivatePopLeft").mCustomScrollbar("update");
		$(".PrivatePop_MsgList").append($.format(_FormatStr.PrivatePopMsgList, e.PostUID));
		PrivatePop_UL_Click_Handle($("#PrivatePopUL_" + e.PostUID));
		$("#PrivatePop_MsgList_" + e.PostUID).mCustomScrollbar({
			scrollButtons: {
				enable: true
			}
		})
	}
	if (_Config.PrivatePop_ToPersonUID != 0) {
		if (_Config.PrivatePop_ToPersonUID != e.PostUID) {
			SetPrivatePopMsgNum(Number($("#PrivatePopUL_" + e.PostUID).find(".UserMsgNum").text()) + 1, $("#PrivatePopUL_" + e.PostUID).find(".UserMsgNum"))
		}
	} else {
		PrivatePopSayTo($("#PrivatePopUL_" + e.PostUID))
	}
}
function PrivatePop_ShowUIDMsgList(uid) {
	SetPrivatePopMsgNum(0, $("#PrivatePopUL_" + uid).find(".UserMsgNum"));
	$("#PrivatePop_MsgList_" + uid).show()
}
function PrivatePopSayTo(e) {
	$("#Y_PrivatePop").show();
	var o = {};
	o.uid = $(e).attr("uid");
	o.uname = $(e).attr("uname");
	o.power = Number($(e).attr("power"));
	o.RoleStyle = $(e).attr("rolestyle");
	o.RoleTitle = $(e).attr("roletitle");
	o.ZberStyle = $(e).attr("zberstyle");
	o.RoomRoleStyle = $(e).attr("roomrolestyle");
	o.RoomRoleTitle = $(e).attr("roomroletitle");
	o.upic = $(e).find("img").attr("src");
	SetPrivatePopToPerson(o);
	$(".PrivatePopLeft ul li.on").removeClass("on");
	$(e).attr({
		"class": "on"
	});
	$("#PrivatePopTitle_UserName").text($(e).attr("uname"));
	$(".PrivatePopUserName .Role")[0].className = "Role " + $(e).attr("rolestyle");
	$(".PrivatePopUserName .Role").attr({
		"title": $(e).attr("roletitle")
	});
	if (Number($(e).attr("power")) > 999) {
		$(".PrivatePopUserName .RM")[0].className = "RM RoomManager"
	}
	$(".PrivatePopUserName .RB")[0].className = "RB " + $(e).attr("zberstyle");
	$(".PrivatePopUserName .RoomUserRole")[0].className = "RoomUserRole " + $(e).attr("roomrolestyle");
	$(".PrivatePopUserName .RoomUserRole").attr({
		"title": $(e).attr("roomroletitle")
	});
	$(".PrivatePopMain_Right .UserPic").attr({
		"src": $(e).find("img").attr("src")
	});
	$(".PrivatePopUIDMsgList").hide();
	PrivatePop_ShowUIDMsgList($(e).attr("uid"));
	$(".PrivatePopUserInfo").hide();
	$.get("/handle/GetSaleUserInfo.asp", {
		UID: $(e).attr("uid"),
		t: getDataTimes
	}, function(json) {
		if (json) {
			$(".PrivatePopUserInfo").show();
			var dataObj = eval("(" + json + ")");
			$(".PrivatePopUserInfo .PrivatePopInfo_UName").text(unescape(dataObj.UName));
			$(".PrivatePopUserInfo .PrivatePopInfo_Sex").addClass("Sex" + dataObj.Sex);
			$(".PrivatePopUserInfo .PrivatePopInfo_Tel").text(unescape(dataObj.Tel));
			$(".PrivatePopUserInfo .PrivatePopInfo_QQ").text(unescape(dataObj.QQ));
			$(".PrivatePopUserInfo .PrivatePopInfo_About").text(unescape(dataObj.About));
			$(".PrivatePopUserInfo .PrivatePopInfo_About").mCustomScrollbar({
				scrollButtons: {
					enable: true
				}
			});
			$(".PrivatePopUserInfo .PrivatePopInfo_About").mCustomScrollbar("update")
		} else {
			$(".PrivatePopUserInfo").hide()
		}
	})
}
function SetPrivatePopToPerson(e) {
	_Config.PrivatePop_ToPersonUID = e.uid;
	_Config.PrivatePop_ToPersonUName = e.uname;
	_Config.PrivatePop_ToPersonPower = e.power;
	_Config.PrivatePop_ToPersonRoleStyle = e.RoleStyle;
	_Config.PrivatePop_ToPersonRoleTitle = e.RoleTitle;
	_Config.PrivatePop_ToPersonZberStyle = e.ZberStyle;
	_Config.PrivatePop_ToPersonRoomRoleStyle = e.RoomRoleStyle;
	_Config.PrivatePop_ToPersonRoomRoleTitle = e.RoomRoleTitle;
	_Config.PrivatePop_ToPersonUPic = e.upic
}
function SetUserMoney(num) {
	iInfo.Money = num;
	$("#UserMoney").val(num)
}
function SetUserScore(num) {
	iInfo.Score = num;
	$("#UserScore").val(num)
}
function PrivatePopMin() {
	$("#Y_PrivatePop").hide()
}
function SetPrivatePopMsgNum(num, e) {
	$(e).text(num);
	num > 0 ? $(e).show() : $(e).hide()
}
var iBell;

function Msg_Bell(url) {
	if (!iBell) {
		try {
			iBell = getSWF(_Config.BellPlayerID);
			iBell.i_Play(url)
		} catch (err) {}
	} else {
		try {
			iBell.i_Play(url)
		} catch (err) {}
	}
}
$(window).resize(function() {
	AutoResize()
});

function showqqkf()
{
	if(iInfo.IsLogin == true){return;}	
	QQKFs.Show();
	//$("#bgg").css({display:"block"});
	/*$.get("/handle/visit.asp", {
			ac: "visitnew",
			rid: iRoomID,
			GuestUID: iInfo.UserID,			
			t: getDataTimes
		}, function() {})*/
}

$(function() {
	InitUI();
	$("#Hide_Left_BT").bind("click", function() {
		HideLeft()
	});
	if (_SysConfig.ShowUserList == 0) {
		_HideLeft = false
	}
	SetRedBagNum();
	setInterval(DoRedBag, 10 * 60 * 1000);
	
	setInterval(showqqkf,10 * 60 *1000);
	InFlyMsg();
	AutoResize()
});