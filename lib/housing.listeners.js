$(function(){

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

  $('select').on('change',function(){
    input_edit(this);
  });
});
