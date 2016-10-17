jQuery(document).ready(function($){

/* Product Carousel
==================================================================*/

	$(".products-carousel .carousel").owlCarousel({
		navigation: true,
		pagination: false,
		navigationText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
	});


/* MI Slider
==================================================================*/

	if($().catslider) {
		$('#mi-slider').catslider();
	}


/* Cart
==================================================================*/

	var cartPanel = $.jPanelMenu({
	    menu: '#cart-panel',
	    trigger: '#shopping-cart a'
	});

	cartPanel.on();
	

/* Price Slider
==================================================================*/

	if($().slider) {
		$("#slider-range").slider({
			range: true,
			min: 0,
			max: 500,
			values: [ 0, 500 ],
			slide: function( event, ui ) {
				$( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
			}
		});
		$( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) + " — $" + $( "#slider-range" ).slider( "values", 1 ) );
	}


/* Product Gallery
==================================================================*/

	var sync1 = $("#product-large");
	var sync2 = $("#product-thumb");
	 
	sync1.owlCarousel({
		singleItem : true,
		slideSpeed : 1000,
		navigation: false,
		pagination:false,
		afterAction : syncPosition,
		responsiveRefreshRate : 200,
	});
	 
	sync2.owlCarousel({
		items : 5,
		itemsDesktop : [1199,5],
		itemsDesktopSmall : [979,4],
		itemsTablet : [768,4],
		itemsMobile : [479,3],
		pagination:false,
		navigation: true,
		navigationText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
		responsiveRefreshRate : 100,
		afterInit : function(el){
			el.find(".owl-item").eq(0).addClass("synced");
		}
	});
	 
	function syncPosition(el){
		var current = this.currentItem;
		$("#product-thumb")
			.find(".owl-item")
			.removeClass("synced")
			.eq(current)
			.addClass("synced");
		if($("#product-thumb").data("owlCarousel") !== undefined){
			center(current)
		}
	}
	 
	$("#product-thumb").on("click", ".owl-item", function(e){
		e.preventDefault();
		var number = $(this).data("owlItem");
		sync1.trigger("owl.goTo",number);
	});
	 
	function center(number){
		var sync2visible = sync2.data("owlCarousel").owl.visibleItems;
		var num = number;
		var found = false;
		for(var i in sync2visible) {
			if(num === sync2visible[i]) {
				var found = true;
			}
		}
	 
		if(found===false) {
			if(num>sync2visible[sync2visible.length-1]) {
				sync2.trigger("owl.goTo", num - sync2visible.length+2)
			} else {
				if(num - 1 === -1){
					num = 0;
				}
				sync2.trigger("owl.goTo", num);
			}
		} else if(num === sync2visible[sync2visible.length-1]) {
			sync2.trigger("owl.goTo", sync2visible[1])
		} else if(num === sync2visible[0]) {
			sync2.trigger("owl.goTo", num-1)
		}
	}

});