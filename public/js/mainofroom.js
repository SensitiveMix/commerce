/*$(function(){
	$(".R-main").height($(window).height() - 46 - 15)
})*/
$(window).resize(function() {
		$(".R-main").height($(window).height() - 46 - 15);
		/*$(".send-text").width($(".R-middle").width() - 118 - 42)*/
		$(".middle-ctn").height($(".R-main").height() - 124)
		$(".chat").height($(".middle-ctn").height())
		$(".chat ul").height($(".middle-ctn").height() - 145)
		$(".ctr-center").height($(".R-main").height() - 650)
})
function Rmain_Height() {
	//if ($(window).height() >= "870") {$(".R-main").height(870)}
	 $(".R-main").height($(window).height() - 46 - 15);
}
/*function Send_Height() {
	$(".send-text").width($(".R-middle").width() - 118 - 42)
}*/
function Middle_Height() {
	$(".middle-ctn").height($(".R-main").height() - 124)
}
function Chat_Height() {
	$(".chat").height($(".middle-ctn").height())
}
function Chatul_Height() {
	$(".chat ul").height($(".middle-ctn").height() - 145)
}
function Ctrcenter_Height() {
	$(".ctr-center").height($(".R-main").height() - 640)
}