/**
 * Created by sunNode on 16/11/20.
 */
$(function () {
  if ($(window).width() > 720) {
    var master = $('#menu-master').width()
    $('.submenu').width(master + 'px')
    var slide_width = $('.btn-search-add-cart').width() - master - 3
    $('.slide-fa').width(slide_width + 'px')
  }
})

$('.person').hover(function () {
  $('.person_ul').css('display', 'block')
}, function () {
  $('.person_ul').css('display', 'none')
})

$('.person_ul').hover(function () {
  $('.person_ul').css('display', 'block')
}, function () {
  $('.person_ul').css('display', 'none')
})
function search_product () {
  if ($('#search_engine').val() == '') {
    layer.msg('PLEASE ENTER PRODUCT')
  } else {
    $.ajax({
      url: 'SEO_Engine',
      type: 'GET',
      data: {
        name: $('#search_engine').val()
      },
      dataType: 'json',
      traditional: true,
      success: function (result) {
        if (result.length == 1) {
          self.location.href = result[0].SEO_Url
        }
        console.log(result)
      },
      error: function (err) {
        if (err.status == 500) {
          layer.msg('NOT FOUND')
        } else {
          layer.alert('NOT FOUND')
        }
      }
    })
  }
}
document.onkeydown = function () {
  if (event.keyCode == 13 && $('#search_engine').val() != '') {
    search_product()
  } else {
  }
}
