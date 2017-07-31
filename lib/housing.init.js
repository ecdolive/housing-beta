$(function(){
  // Listeners
  $('#btn-open').on('click',function(){
    menu_open();
  });
  $('#btn-close, #tint').on('click',function(){
    menu_close();
  });
  $('#btn-details').on('click',function(){
    menu_toggle();
  });
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
  $('#share > li > a').on('click',function(){
    share_click(this);
  });
  // Init functions
  date_build();
  cookies_get();
  init_values();
});
