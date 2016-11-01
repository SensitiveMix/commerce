// $(function () {
//     $('li[data-crosscate="0"]').on('click',function () {
//         $('#show_category_path').empty();
//         $('li[data-crosscate="0"]').removeClass('current');
//         $(this).addClass('current');
//         var firstName = $('li[data-crosscate="0"].current').attr('title');
//         firstName = '<b>'+firstName+'</b><span class="color4">（请选择下级类目）</span>';
//         $('#show_category_path').append(firstName);
//         var category = <%=category %>;
//         console.log(category);
//         if(category.length != 0) {
//         <% category.forEach(function (item) { %>
//                 <%if(item.firstCategory == firstName){ %>
//                         <% if(item.sencondCategory.length != 0) {%>
//                             <% item.secondCategory.forEach(function (secondItem) {%>
//                                 var mysecondTitle = '<li data-crosscate="0" title="<%=secondItem.secondTitle %>" data-leaf="0" data-valid="1" data-param="catePubId=135005" data-en="<%=secondItem.secondTitle %>" data-cn="<%=secondItem.secondTitle %>"><%=secondItem.secondTitle %></li>'
//                                 $('#catagory1').append(mysecondTitle);
//                             <%}) %>
//                         <% }%>
//
//                     <%}%>
//          <% } %>
//     }
//
// })