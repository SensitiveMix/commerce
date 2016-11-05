// 代码整理：懒人之家

var FancyForm=function(){
	return{
		inputs:".FancyForm input, .FancyForm textarea",
		setup:function(){
			var a=this;
			this.inputs=$(this.inputs);
			a.inputs.each(function(){
				var c=$(this);
				a.checkVal(c)
			});
			a.inputs.live("keyup blur",function(){
				var c=$(this);
				a.checkVal(c);
			});
		},checkVal:function(a){
			a.val().length>0?a.parent("li").addClass("val"):a.parent("li").removeClass("val")
		}
	}
}();




$(document).ready(function() {
	FancyForm.setup();
});




var searchAjax=function(){};
var G_tocard_maxTips=30;

$(function(){(
	function(){
		
		var a=$(".plus-tag");
		
		$("a em",a).live("click",function(){
			var c=$(this).parents("a"),b=c.attr("title"),d=c.attr("value");
			delTips(b,d)
		});
		
		hasTips=function(b){
			var d=$("a",a),c=false;
			d.each(function(){
				if($(this).attr("title")==b){
					c=true;
					return false
				}
			});
			return c
		};

		isMaxTips=function(){
			return	
			$("a",a).length>=G_tocard_maxTips
		};

		setTips=function(c,d){
			if(hasTips(c)){
				return false
			}if(isMaxTips()){
				alert("最多添加"+G_tocard_maxTips+"个标签！");
				return false
			}
			var b=d?'value="'+d+'"':"";
			a.append($("<a "+b+' title="'+c+'" href="javascript:void(0);" ><span>'+c+"</span><em></em></a>"));
			searchAjax(c,d,true);
			return true
		};

		delTips=function(b,c){
			if(!hasTips(b)){
				return false
			}
			$("a",a).each(function(){
				var d=$(this);
				if(d.attr("title")==b){
					d.remove();
					return false
				}
			});
			searchAjax(b,c,false);
			return true
		};

		getTips=function(){
			var b=[];
			$("a",a).each(function(){
				b.push($(this).attr("title"))
			});
			return b
		};

		getTipsId=function(){
			var b=[];
			$("a",a).each(function(){
				b.push($(this).attr("value"))
			});
			return b
		};
		
		getTipsIdAndTag=function(){
			var b=[];
			$("a",a).each(function(){
				b.push($(this).attr("value")+"##"+$(this).attr("title"))
			});
			return b
		}
	}
	
)()});







// 更新选中标签标签
$(function(){
	setSelectTips();
	$('.plus-tag').append($('.plus-tag a'));
});
var searchAjax = function(name, id, isAdd){
	setSelectTips();
};
// 搜索
(function(){
	var $b = $('.plus-tag-add button'),$i = $('.plus-tag-add input');
	$i.keyup(function(e){
		if(e.keyCode == 13){
			$b.click();
		}
	});
	$b.click(function(){
		var name = $i.val().toLowerCase();
		if(name != '') setTips(name,-1);
		$i.val('');
		$i.select();
	});
})();
// 推荐标签
(function(){
	var str = ['展开推荐标签', '收起推荐标签']
	$('.plus-tag-add a').click(function(){
		var $this = $(this),
				$con = $('#mycard-plus');

		if($this.hasClass('plus')){
			$this.removeClass('plus').text(str[0]);
			$con.hide();
		}else{
			$this.addClass('plus').text(str[1]);
			$con.show();
		}
	});
	$('.default-tag a').live('click', function(){
		var $this = $(this),
				name = $this.attr('title'),
				id = $this.attr('value');
		setTips(name, id);
	});
	// 更新高亮显示
	setSelectTips = function(){
		var arrName = getTips();
		if(arrName.length){
			$('#myTags').show();
		}else{
			$('#myTags').hide();
		}
		$('.default-tag a').removeClass('selected');
		$.each(arrName, function(index,name){
			$('.default-tag a').each(function(){
				var $this = $(this);
				if($this.attr('title') == name){
					$this.addClass('selected');
					return false;
				}
			})
		});
	}

})();
// 更换链接
(function(){
	var $b = $('#change-tips'),
		$d = $('.default-tag div'),
		len = $d.length,
		t = 'nowtips';
	$b.click(function(){
		var i = $d.index($('.default-tag .nowtips'));
		i = (i+1 < len) ? (i+1) : 0;
		$d.hide().removeClass(t);
		$d.eq(i).show().addClass(t);
	});
	$d.eq(0).addClass(t);
})();