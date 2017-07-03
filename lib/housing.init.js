// Initiate once html has loaded
$(function(){
  /*location_set('atlanta');
  cookies_get();
  date_options();
  defaults();
  calculate();*/

  date_build();
  defaults_set();
  cookies_get();
  saved_set();
  ui_set();
  calculate();
});
