$(function(){

  $('#btn-open').on('click',function(){
    openMenu();
  });

  $('#btn-close').on('click',function(){
    closeMenu();
  });

  $('input').on('keyup',function(){
    inputEdit(this);
  });

  $('input[type=checkbox]').on('change',function(){
    calculate();
  });

  $('select').on('change',function(){
    inputEdit(this);
  });
});
