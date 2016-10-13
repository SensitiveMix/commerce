$.format = function(source, params) {
	if (arguments.length == 1) {
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.format.apply(this, args)
		}
	}
	if (arguments.length > 2 && params.constructor != Array) {
		params = $.makeArray(arguments).slice(1)
	}
	if (params.constructor != Array) {
		params = [params]
	}
	$.each(params, function(i, n) {
		source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n)
	});
	return source
};
var ibrowser = {};
ibrowser.iPhone = navigator.userAgent.indexOf("iPhone") > -1;
ibrowser.iPad = navigator.userAgent.indexOf("iPad") > -1;
ibrowser.mobile = !! navigator.userAgent.match(/AppleWebKit.*Mobile.*/);
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, "")
};

function StringToDate(string) {
	return new Date(Date.parse(string.replace(/-/g, "/")))
}
function countTimeLength(interval, date1, date2) {
	var objInterval = {
		"D": 1000 * 60 * 60 * 24,
		"H": 1000 * 60 * 60,
		"M": 1000 * 60,
		"S": 1000,
		"T": 1
	};
	interval = interval.toUpperCase();
	var dt1 = Date.parse(StringToDate(date1));
	var dt2 = Date.parse(StringToDate(date2));
	try {
		return (((dt2 - dt1) / objInterval[interval]).toFixed(0))
	} catch (e) {
		return e.message
	}
}
function nowTime() {
	var date = new Date();
	var theYear = date.getFullYear();
	var theMonth = date.getMonth() + 1;
	var theDay = date.getDate();
	var theHour = date.getHours();
	var theMinutes = date.getMinutes();
	var theSeconds = date.getSeconds();
	return theYear + "-" + add0(theMonth) + "-" + add0(theDay) + " " + add0(theHour) + ":" + add0(theMinutes) + ":" + add0(theSeconds);

	function add0(num) {
		if (num < 10) {
			return "0" + num
		} else {
			return num
		}
	}
}
Date.prototype.format = function(format) {
	var o = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S": this.getMilliseconds()
	};
	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
		}
	}
	return format
};

function getSWF(movieName) {
	if (navigator.appName.indexOf("Microsoft") != -1) {
		return window[movieName]
	} else {
		return document[movieName]
	}
}
function GetNewTime(AddMinute) {
	var d = new Date(new Date() - AddMinute * 60 * 1000 * -1);
	return d.format("yyyy-MM-dd hh:mm:ss")
}
function getDataTimes() {
	var strDate, strTime;
	strDate = new Date();
	strTime = strDate.getTime();
	return strTime
}
function getGUID() {
	var StrRe, StrD, StrPa;
	if ($.cookie("Guest_Name")) {
		StrRe = $.cookie("Guest_Name")
	} else {
		StrPa = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"];
		StrD = new Date();
		StrRe = StrPa[StrD.getMonth()] + StrPa[StrD.getDate()] + StrPa[StrD.getHours()] + StrPa[StrD.getMinutes()] + StrPa[StrD.getSeconds()] + StrD.getMilliseconds();
		$.cookie("Guest_Name", StrRe, {
			path: "/",
			expires: 365
		})
	}
	return StrRe
}
function GetSendTime() {
	var d = new Date();
	return (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes())
}
function GetTimeDiffSecond(e) {
	var now = new Date();
	return (now.getTime() - e) / 1000
}
function pop(l, t) {
	new Dialog(t, {
		"title": l
	}).show()
}
function CheckPowerKeys(Str, Key) {
	if (Str.indexOf(Key) > -1) {
		return true
	} else {
		return false
	}
}
function ReplaceKeys(istr) {
	istr = htmlencode(istr);
	var rarr = rKeys.split("_");
	for (var c = 0; c < rarr.length; c++) {
		while (istr.indexOf(rarr[c]) > -1) {
			istr = istr.replace(rarr[c], "*")
		}
	}
	return istr
}
function ReplaceKeys_UID(istr) {
	istr = htmlencode_UID(istr);
	var rarr = rKeys.split("_");
	for (var c = 0; c < rarr.length; c++) {
		while (istr.indexOf(rarr[c]) > -1) {
			istr = istr.replace(rarr[c], "*")
		}
	}
	return istr
}
function htmlencode_UID(str) {
	while (str.indexOf("!") > -1) {
		str = str.replace(/!/g, "！")
	}
	str = str.replace(/\([^\)]*\)/g, "");
	str = str.replace(/\<[^\>]*\)/g, "");
	str = str.replace(/<script.*?>.*?<\/script>/ig, "");
	str = str.replace(/script/ig, "");
	str = str.replace(/</g, "");
	str = str.replace(/>/g, "");
	str = str.replace(/\(/g, "");
	str = str.replace(/\)/g, "");
	str = str.replace(/=/g, "");
	while (str.indexOf("  ") > -1) {
		str = str.replace(/  /g, "&nbsp;")
	}
	str = str.replace(/x22/g, "&quot;");
	str = str.replace(/x27/g, "&#39;");
	return str
}
function htmlencode(str) {
	while (str.indexOf("!") > -1) {
		str = str.replace(/!/g, "！")
	}
	str = str.replace(/\([^\)]*\)/g, "");
	str = str.replace(/\<[^\>]*\)/g, "");
	str = str.replace(/script/ig, "");
	str = str.replace(/<script.*?>.*?<\/script>/ig, "");
	str = str.replace(/<\/?[^>]*>/g, "");
	str = str.replace(/</g, "&lt;");
	str = str.replace(/>/g, "&gt;");
	while (str.indexOf("  ") > -1) {
		str = str.replace(/  /g, "&nbsp;")
	}
	str = str.replace(/x22/g, "&quot;");
	str = str.replace(/x27/g, "&#39;");
	return str
}
function removeHTMLTag(str) {
	str = str.replace(/<\/?[^>]*>/g, "");
	str = str.replace(/[ | ]*\n/g, "\n");
	str = str.replace(/&nbsp;/ig, "");
	return str
}
$.browser = {};
$.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
var AgentType = navigator.userAgent.match(/.*Mobile.*/) ? "mobile" : "computer";

function GetBrowser() {
	return !$.browser.mozilla
}
function guidGenerator() {
	var S4 = function() {
			return (((1 + Math.random()) * 65536) | 0).toString(16).substring(1)
		};
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4())
}
function UnSecret(e) {
	var SStr = ["S", "K", "R", "E", "O", "h", "v", "z", "j", "t"];
	for (var i = 0; i < SStr.length; i++) {
		for (var j = 0; j < e.length; j++) {
			e = e.replace(SStr[i], i)
		}
	}
	return e
}
function FancyBoxClose() {
	$.fancybox.close()
}
function iUserInfo() {
	var e = new Object();
	e.IsLogin = false;
	e.UserID = "";
	e.RoomID = "";
	e.BestAccount = "";
	e.UserNickName = "";
	e.FacePic = "";
	e.Live_NG_ID = location.pathname.substr(1);
	e.IsManager = false;
	e.LevelClass = "";
	e.InComeClass = "";
	e.Money = 0;
	e.Score = 0;
	e.FixIcon = "";
	e.VIPIcon = "";
	e.LevelID = 0;
	e.LoginTime = "";
	e.LoginIP = "";
	e.IsZber = false;
	e.MicTime = "";
	e.MicIndex = 0;
	e.time = 0;
	e.RoleCssStyle = "";
	e.RoleName = "";
	e.RoleID = 0;
	e.RoleWeight = 0;
	e.RoomRoleStyle = "";
	e.RoomRoleTitle = "";
	e.EnterTime = getDataTimes();
	e.iPhone = ibrowser.iPhone;
	e.iPad = ibrowser.iPad;
	e.mobile = ibrowser.mobile;
	return e
}
var iInfo = iUserInfo();

function GetiInfo() {
	return iInfo
}
function GetSimpleUInfo() {
	var e = {};
	e.IsLogin = iInfo.IsLogin;
	e.UserID = iInfo.UserID;
	e.UserNickName = GB2312UnicodeConverter.ToUnicode(iInfo.UserNickName);
	e.RoomID = iInfo.RoomID;
	e.LevelID = iInfo.LevelID;
	e.FacePic = GB2312UnicodeConverter.ToUnicode(iInfo.FacePic);
	e.IsManager = iInfo.IsManager;
	e.Power = iInfo.Power;
	e.RoleCssStyle = iInfo.RoleCssStyle;
	e.RoleName = GB2312UnicodeConverter.ToUnicode(iInfo.RoleName);
	e.RoleID = iInfo.RoleID;
	e.RoleWeight = iInfo.RoleWeight;
	e.RoomRoleStyle = iInfo.RoomRoleStyle;
	e.RoomRoleTitle = iInfo.RoomRoleTitle;
	e.IsZber = iInfo.IsZber;
	e.EnterTime = getDataTimes();
	e.iPhone = ibrowser.iPhone;
	e.iPad = ibrowser.iPad;
	e.mobile = ibrowser.mobile;
	return e
}
var GB2312UnicodeConverter = {
	ToUnicode: function(str) {
		return escape(str).replace(/%u/gi, "\\u")
	},
	ToGB2312: function(str) {
		return unescape(str.replace(/\\u/gi, "%u"))
	}
};
var _Config = {};
_Config.DynamicFileServer = "";
_Config.USList_Height = 51;
_Config.USVolume = 50;
_Config.MicGain = 30;
_Config.isIE = false;
_Config.iFrameTools_Animate = true;
_Config.iFrameTools_Step = 10;
_Config.Pub_isScroll = true;
_Config.Pri_isScroll = true;
_Config.ModeType = 1;
_Config.ModeTypeDes = ["发言模式", "自由模式", "主席模式", "麦序模式"];
_Config.TalkType = 1;
_Config.KeyDown = false;
_Config.BindPlayerID = "TLivePlayer";
_Config.PlayerID = "iLivePlayer";
_Config.BindBellPlayerID = "TBellPlayer";
_Config.BellPlayerID = "iBellPlayer";
_Config.BellUrl = "/swf/bell.mp3";
_Config.CurrentMicShowTime = 0;
_Config.DefaultFacePic = "/images/DefaultFace.png";
_Config.Mic_StopApply = false;
_Config.Mic_Manage = false;
_Config.PrivateChecked = false;
_Config.ToPersonUID = 0;
_Config.ToPersonUName = "";
_Config.MenuCurrentUID = 0;
_Config.MenuCurrentUname = 0;
_Config.MenuCurrentPower = 0;
_Config.BlackList = {};
_Config.MsgMaxNum = 80;
_Config.ShoutedIndex = 0;
_Config.PublicMsgMaxNum = 100;
_Config.ULMaxNum = 100;
_Config.CurrentULNum = 0;
_Config.SwfLoaded = false;
_Config.PrivatePop_ToPersonUID = 0;
_Config.PrivatePop_ToPersonUName = "";
_Config.GiftToPersonUID = 0;
_Config.GiftToPersonUName = "";
_Config.CurrentGiftID = 0;
_Config.CurrentGiftPrice = 0;
_Config.CurrentGiftNum = 0;
_Config.CurrentGiftIcon = "";
_Config.CurrentGiftPic = "";
var iRoomID;
var Login = {
	Show: function() {
		$("#login_frame")[0].src = "/miniLogin.shtml?" + location.href;
		Reg.Hide();
		$(document).mousedown(function(e) {
			Login.Hide()
		});
		$("#Login_Box").show()
	},
	Hide: function() {
		$("#Login_Box_Opacity_Div").hide();
		$("#Login_Box").hide();
		$(document).unbind("mousedown")
	}
};
var Reg = {
	Show: function() {
		var HashArr = window.location.hash.replace("#", "").split(",");
		var RegType = "";
		var RegValue = "";
		if (HashArr.length > 0) {
			RegType = HashArr[0];
			if (HashArr.length > 1) {
				RegValue = HashArr[1]
			}
			if (RegType == "SID") {
				if (RegValue != "") {
					$("#reg_frame")[0].src = "/miniReg.asp?SID=" + RegValue + "&GoUrl=" + location.href
				}
			} else {
				if (RegType == "SCID") {
					if (RegValue != "") {
						$("#reg_frame")[0].src = "/miniReg.asp?SCID=" + RegValue + "&GoUrl=" + location.href
					}
				} else {
					$("#reg_frame")[0].src = "/miniReg.asp?GoUrl=" + location.href
				}
			}
		} else {
			$("#reg_frame")[0].src = "/miniReg.asp?GoUrl=" + location.href
		}
		Login.Hide();
		$(document).mousedown(function(e) {
			Reg.Hide()
		});
		$("#Reg_Box").show()
	},
	Hide: function() {
		$("#Reg_Box_Opacity_Div").hide();
		$("#Reg_Box").hide();
		$(document).unbind("mousedown")
	}
};
$(function() {
	if (iInfo.IsLogin == false) {
		if (window.location.hash.replace("#", "").split(",").length > 1) {
			Reg.Show()
		}
	}
});
var QQKF = {
	Show: function() {
		$("#QQKF_Box").show();
		$(document).mousedown(function(e) {
			QQKF.Hide()
		})
	},
	Hide: function() {
		$("#QQKF_Box_Opacity_Div").hide();
		$("#QQKF_Box").hide();
		$(document).unbind("mousedown")
	}
};

var QQKFs = {
	Show: function() {
		$("#QQKFs_Box").show();
		$(document).mousedown(function(e) {
			QQKF.Hide()
		})
	},
	Hide: function() {
		$("#QQKFs_Box_Opacity_Div").hide();
		$("#QQKFs_Box").hide();
		$(document).unbind("mousedown")
	}
};
var Url = {
	encode: function(string) {
		return escape(this._utf8_encode(string))
	},
	decode: function(string) {
		return this._utf8_decode(unescape(string))
	},
	_utf8_encode: function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c)
			} else {
				if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128)
				} else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128)
				}
			}
		}
		return utftext
	},
	_utf8_decode: function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++
			} else {
				if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3
				}
			}
		}
		return string
	}
};

function on() {
	if ($("div:first").hasClass("mCustomScrollbar") == false) {
		$("div:first").mCustomScrollbar({
			scrollButtons: {
				enable: true
			}
		})
	} else {
		$("div:first").height($(window).height());
		$("div:first").mCustomScrollbar("update")
	}
}
window.onerror = function() {
	return true
};
var Is_WS = false;