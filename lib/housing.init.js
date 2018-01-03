$(function(){
  // Listeners
  $('input').on('keyup',function(){
    input_edit(this);
  });
  $('input[type=checkbox]').on('change',function(){
    calculate();
  });
  $('#locations > li').on('click',function(){
    location_select(this);
  });
  $('select').on('change',function(){
    input_edit(this);
  });
  $('#reset-all').on('click',function(){
    input_reset_all();
  });
  $('.card-tabs > li').on('click',function(){
    tab_click(this);
  });
  $('#share > li > a').on('click',function(){
    share_click(this);
  });
  $(window).scroll(function(){
    window_scroll();
  });
  // Init functions
  date_build();
  cookies_get();
  init_values();
});
