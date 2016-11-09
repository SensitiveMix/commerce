/*!
 * BootstrapSelection v0.1.0 (https://coding.net/u/packy/p/bootstrap-chinese-region/git)
 * Copyright 2015 packy <lpreterite@126.com>
 * Licensed under MIT (https://coding.net/u/packy/p/bootstrap-chinese-region/git/blob/master/LICENSE)
 */


(function(root,factory){
	//CommonJs support
	if(typeof module === 'object' && module && typeof module.exports === 'object'){
		module.exports = factory();
	// AMD
	}else if ( typeof define === "function" && define.amd ) {
		define( "bs-chinese-region", ["jquery","bootstrap"], factory);
	//Brower globals
	}else{
		factory(root.jQuery);
	}
})(window,function($){

	var ChineseRegion = function($el){
		this._areas = [];
		this._defaultId = "";
		this.$el = $el;
		this.$input = this.$el.find('input[type=text]');
		this.$tabContent = this.$el.find('.tab-content');
		this.$tabContent.children().first().on('click','a',$.proxy(this.onClearAreas,this));
		this.$tabContent.children().on('click','a',$.proxy(this.onAreasChanged,this));
		this.$tabContent.children().last().on('click','a',$.proxy(this.onClose,this));
		this.$el.parents('form').on('submit',$.proxy(this.onSubmit,this));
		if(!!$.fn.dropdown.Constructor) this.initDropdownModule();

		this._defaultId = this.$el.data('def-val') !== undefined ? this.$el.find(this.$el.data('def-val')).val() : this.$input.val();
		this.submitType = this.$el.data('submit-type');
		this.level(this.$el.data('min-level'),this.$el.data('max-level'));
	};
	ChineseRegion.prototype = new $.fn.dropdown.Constructor();
	/**
	 * 重写Dropdown.toggle方法
	 */
	ChineseRegion.prototype._toggle = ChineseRegion.prototype.toggle;
	ChineseRegion.prototype.toggle = function() {
		ChineseRegion.prototype._toggle.call(this.$input);
	};
	/**
	 * 重设Dropdown设置
	 * @return {[type]} [description]
	 */
	ChineseRegion.prototype.initDropdownModule = function() {
		this.$el.on('click','.dropdown-menu',function(e){
			$(e.target).trigger('click.bs.tab.data-api');//触发tab事件响应，因取消了事件冒泡后不会触发。
			e.stopPropagation();//取消事件冒泡，阻止下拉框关闭
		});
	};
	ChineseRegion.prototype.onClearAreas = function(e) {
		this.areas = [];
	};
	ChineseRegion.prototype.onClose = function(e) {
		this.toggle();
		var data = this.getAreaData($(e.target));
		this.$el.trigger('completed.bs.chinese-region',[this.areas]);
	};
	ChineseRegion.prototype.onSubmit = function(e) {
		if(this.submitType == 'id'){
			this.$input.val(this.areas[this.areas.length-1].id);
		}
	};
	/**
	 * 根据DOM取得数据
	 * @param  {jQuery} $el jQuery对象
	 * @return {JSON}     data-数据
	 */
	ChineseRegion.prototype.getAreaData = function($el) {
		var data = $el.data();
		data.name = $el.text();
		return data;
	};
	/**
	 * 当选择了地区后
	 */
	ChineseRegion.prototype.onAreasChanged = function(e) {
		var currentId = $(e.target).attr('data-id');
		this.areas = this.getCurrentAreas(currentId);
		this.renderAreasPanel(this.getAreasByParentId(currentId));

		this.$el.trigger('changed.bs.chinese-region',[this.areas]);
	};
	/**
	 * 根据父级Id取得地址数据
	 * @param  {String} id   父级Id
	 * @return {Array}      地址数据
	 */
	ChineseRegion.prototype.getAreasByParentId = function(id) {
		var result = [];
		for (var i = 0; i < this._source.length; i++) {
			if(this._source[i].level>this.maxLevel || this._source[i].level<this.minLevel) continue;
			if(this._source[i].parentId != id) continue;
			result.push(this._source[i]);
		}
		return result;
	};
	/**
	 * 根据层级取得地址数据
	 * @param  {String} level 层级
	 * @return {Array}       地址数据
	 */
	ChineseRegion.prototype.getAreasByLevel = function(level) {
		var result = [];
		for (var i = 0; i < this._source.length; i++) {
			if(this._source[i].level>this.maxLevel || this._source[i].level<this.minLevel) continue;
			if(this._source[i].level != level) continue;
			result.push(this._source[i]);
		}
		return result;
	};
	/**
	 * 根据Id取得地址数据
	 * @param  {String} id Id
	 * @return {Area}    地址数据
	 */
	ChineseRegion.prototype.getAreaById = function(id) {
		var result;
		for (var i = 0; i < this._source.length; i++) {
			if(this._source[i].id == id){
				result = this._source[i];
				break;
			}
		}
		return result;
	};
	ChineseRegion.prototype.getCurrentAreas = function(lastId) {
		var result = [];
		for (var i = this.minLevel; i <= this.maxLevel; i++) {
			var area = this.getAreaById(lastId);
			if(area === undefined) break;
			if(area.level>this.maxLevel || area.level<this.minLevel) continue;
			result.unshift(area);
			lastId = area.parentId;
		}
		return result;
	};
	/**
	 * 刷新地区显示
	 * @param  {Array or JSON} data     数据
	 * @param  {Boolean} first 是否首次重绘
	 */
	ChineseRegion.prototype.renderAreasPanel = function(data,first) {
		var $panel,$navbarButton;
		if(first){
			$panel = this.$tabContent.children(':first');
			$navbarButton = this.$el.find('.nav-tabs li:first');
		}else{
			$panel = this.$tabContent.children('.active').next();
			$navbarButton = this.$el.find('.nav-tabs li.active').next();
		}

		if(data && data.length){
			$panel.empty();
			for (var i = 0; i < data.length; i++) {
				var area = data[i];
				$panel.append('<a href="javascript:;" class="areas-item" data-id="'+area.id+'" data-type="'+area.type+'">'+area.name+'</a> ');
			}
		}
		$navbarButton.children('a').tab('show');
		this.$input.val('');
		this.$tabContent.children().find('a').removeClass('current');
		for (var i = 0; i < this.areas.length; i++) {
			this.$input.val(this.$input.val()+this.areas[i].name+' ');
			this.$tabContent.find('a[data-id='+this.areas[i].id+']').addClass('current');
		}
	};
	/**
	 * 重绘
	 */
	ChineseRegion.prototype.render = function(id) {
		this.renderAreasPanel(this.getAreasByLevel(this.minLevel),true);

		this.areas = this.getCurrentAreas(id);
		for (var i = 0; i < this.areas.length; i++) {
			var area = this.areas[i];
			this.renderAreasPanel(this.getAreasByParentId(area.id));
		}
	};

	/**
	 * 设置数据源
	 * @param  {JSON} data   数据
	 * @param  {Function} filter 过滤方法
	 */
	ChineseRegion.prototype.source = function(data,filter) {
		if(arguments.length<=0) return this._source;
		this._source = typeof filter == 'function'?filter(data):data;
		this.render(this._defaultId);
	};

	/**
	 * 设置层级范围
	 * @param  {String} min 最小值
	 * @param  {String} max 最大值
	 */
	ChineseRegion.prototype.level = function(min,max) {
		this.minLevel = min;
		this.maxLevel = max;
	};

	/**
	 * 定义属性
	 * @param  {Object} 类(可原型)
	 * @param  {String} 属性名字
	 * @param  {JSON}    属性设置
	 */
	Object.defineProperty(ChineseRegion.prototype,'areas',{
	    configurable: false,//能否重定义
	    get: function(){
	        return this._areas;
	    },
	    set: function(value){
	        this._areas = value;
	    }
	});

	Object.defineProperty(ChineseRegion.prototype,'minLevel',{
	    configurable: false,//能否重定义
	    get: function(){
	        return this._minLevel;
	    },
	    set: function(value){
	        this._minLevel = value;
	    }
	});

	Object.defineProperty(ChineseRegion.prototype,'maxLevel',{
	    configurable: false,//能否重定义
	    get: function(){
	        return this._maxLevel;
	    },
	    set: function(value){
	        this._maxLevel = value;
	    }
	});

	$.fn.chineseRegion = function(){
		var options = Array.prototype.shift.apply(arguments),
			arg = arguments,
			chineseRegion = this.data('bs-chinese-region');
		if(chineseRegion === undefined) this.data('bs-chinese-region',(chineseRegion = new ChineseRegion(this)));
		if(typeof options == 'string') chineseRegion[options].apply(chineseRegion,arg);
		return this;
	};
	$.fn.chineseRegion.Constructor = ChineseRegion;
});