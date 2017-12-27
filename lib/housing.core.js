// TODO: need reset to default option for editable inputs and selects
// TODO: determine what is changeable when location is selected

var cookies;
var loc = {};
var send = {};
var values;
var master;

$(function(){
  $.fn.notFocused = function(val){
    if(!$(this).is(':focus')){
      $(this).val(val);
    }
    return this;
  }
}(jQuery));

function Debug(){}
Debug.prototype.log = function(x){
  if(isLocalHost() || location.hostname === 'beta.realisticmortgage.com')
    console.log(x);
};
Debug.prototype.mode = function(){
  var c_inputs = $('.menu > ul > li > .input > input, .menu > ul > li > .input > select');
  var i_inputs = $('.insight > .input > input');
  $.each(c_inputs,function(){
    var id = '(' + $(this).attr('id') + ') ';
    $(this).parent().siblings('.label').prepend(id);
  });
  $.each(i_inputs,function(){
    var id = '(' + $(this).attr('id') + ') ';
    $(this).parent().before(id);
  });
};
var debug = new Debug();

api_call = function(){
  debug.log('\tapi_call()');
  // values = api.calculate(
  values = calculate(
    send.month,
    send.year,
    send.price,
    send.upfront,
    send.closing,
    send.down,
    send.term,
    send.interest,
    send.pmi,
    send.hoa,
    send.extra,
    send.hoi,
    send.flood,
    send.tax,
    send.appreciation,
    send.rent
  );
};
cookies_get = function(){
  debug.log('cookies_get()');
  cookies = Cookies.get();
  if(isLocalHost()){
    cookies = {};
    // version 1.0
    // cookies._ga = 'GA1.2.123456789.1234567890';
    // cookies._gat = '1';
    // cookies._gid = 'GA1.2.123456789.1234567890';
    // cookies.appreciation = '{"id":"e16","val":"2.5"}';
    // cookies.assessment = '{"id":"e18","val":"50"}';
    // cookies.city = '{"id":"e15","val":"20.1"}';
    // cookies.closing = '{"id":"e3a","val":"4%"}';
    // cookies.county = '{"id":"e14","val":"9.1"}';
    // cookies.down = '{"id":"e2a","val":"3%"}';
    // cookies.down = '{"id":"e4a","val":"7%"}';
    // cookies.down = '{"id":"e4z","val":"20000"}';
    // cookies.extra = '{"id":"e13","val":"100"}';
    // cookies.flood = '{"id":"e6","val":"460"}';
    // cookies.hoa = '{"id":"e12","val":"100"}';
    // cookies.hoi = '{"id":"e5","val":"800"}';
    // cookies.interest = '{"id":"e10","val":"3.835"}';
    // cookies.loan = '{"id":"e9","val":"15"}';
    // cookies.none = 'san_francisco';
    // cookies.pmi = '{"id":"e11","val":"1.15"}';
    // cookies.price = '{"id":"e1a","val":"200000"}';
    // cookies.purchase_m = '{"id":"e7","val":"7"}';
    // cookies.purchase_y = '{"id":"e8","val":"2016"}';
    // cookies.rent = '{"id":"e17","val":"1400"}';

    // version 1.1
    // cookies._ga = 'GA1.2.123456789.1234567890';
    // cookies._gat = '1';
    // cookies._gid = 'GA1.2.123456789.1234567890';
    // cookies.location = "atlanta";
    // cookies.month = 9;
    // cookies.year = 1998;
    // cookies.price = 299999;
    // cookies.upfront = 29999;
    // cookies.closing = "4.9%";
    // cookies.down = "4.9%";
    // cookies.term = 29;
    // cookies.interest = "3.99%";
    // cookies.pmi = "1.99%";
    // cookies.hoa = 99;
    // cookies.extra = 99;
    // cookies.hoi = 1999;
    // cookies.flood = 999;
    // cookies.tax = "0.99%";
    // cookies.appreciation = "1.99%";
    // cookies.rent = 1299;
  }
  if(!cookies.version || cookies.version < 1.1) cookies_migrate();
  cookies_set('version',1.1);
};
cookies_migrate = function(){
  // checks if each cookie has old format, if so removes it
  $.each(cookies,function(i,v){
    if(isJsonString(v) || i == 'none'){
      cookies_remove(i);
    }
  });
};
cookies_remove = function(name){
  Cookies.remove(name);
  delete cookies[name];
  debug.log('\tCookies.remove("' + name + '")');
}
cookies_remove_all = function(){
  $.each(cookies,function(x){
    if(!isAnalyticsCookie(x)) // don't remove analytics cookies
      cookies_remove(x);
  });
}
cookies_set = function(name,value){
  Cookies.set(name,value,{expires:3650});
  cookies[name] = value;
  debug.log('\tCookie.set("' + name + '","' + value + '",{expires:3650})');
};
copyObject = function(x){
  return JSON.parse(JSON.stringify(x));
};
date_display = function(d,format){
  var m = d.getMonth();
  var yyyy = d.getFullYear();
  var mmm;
  switch(m){
    case 0: mmm = 'Jan'; break;
    case 1: mmm = 'Feb'; break;
    case 2: mmm = 'Mar'; break;
    case 3: mmm = 'Apr'; break;
    case 4: mmm = 'May'; break;
    case 5: mmm = 'Jun'; break;
    case 6: mmm = 'Jul'; break;
    case 7: mmm = 'Aug'; break;
    case 8: mmm = 'Sep'; break;
    case 9: mmm = 'Oct'; break;
    case 10: mmm = 'Nov'; break;
    case 11: mmm = 'Dec'; break;
  }
  if(format == 'm') return m;
  else if(format == 'mmm') return mmm;
  else if(format == 'yyyy') return yyyy;
  else return mmm + ' ' + yyyy;
};
date_build = function(){
  debug.log('date_build()');
  var today = new Date();
  var m = today.getMonth();
  var yyyy = today.getFullYear();
  var first_year = new Date();
  first_year.setFullYear(yyyy - 30);
  first_year = date_display(first_year,'yyyy');
  // build month options
  var m_options = [];
  for(var x=0; x<12; x++){
    var d = new Date(yyyy,x);
    var h = date_display(d,'mmm');
    var o = $('<option></option>').val(x).html(h);
    if(x == m) o.prop('selected',true);
    m_options.push(o);
  }
  $('#month').append(m_options);
  // build year options
  var y_options = [];
  for(var x=0; x<44; x++){
    var d = new Date(first_year + x,0);
    var h = date_display(d,'yyyy');
    var o = $('<option></option>').val(h).html(h);
    if(yyyy == h) o.prop('selected',true);
    y_options.push(o);
  }
  $('#year').append(y_options);
};
function debounce(func,wait,immediate){
  var timeout;
  return function(){
    var context = this, args = arguments;
    var later = function(){
      timeout = null;
      if(!immediate){
        func.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if(callNow){
      func.apply(context, args);
    }
  };
}
display_all = function(){
  debug.log('\tdisplay_all()');

  var _i = values.inputs;
  $('#locations > li[data-value="' + loc.id + '"]').addClass('selected');
  $('#month').val(_i.month.display);
  $('#year').val(_i.year.display);
  $('#price').notFocused(_i.price.display);
  $('#upfront').notFocused(_i.upfront.display);
  $('#upfront_opposite').text(_i.upfront.opposite);
  $('#closing').notFocused(_i.closing.display);
  $('#closing_opposite').text(_i.closing.opposite);
  $('#down').notFocused(_i.down.display);
  $('#down_opposite').text(_i.down.opposite);
  $('#term').notFocused(_i.term.display);
  $('#interest').notFocused(_i.interest.display);
  $('#pmi').notFocused(_i.pmi.display);
  $('#hoa').notFocused(_i.hoa.display);
  $('#extra').notFocused(_i.extra.display);
  $('#hoi').notFocused(_i.hoi.display);
  $('#flood').notFocused(_i.flood.display);
  $('#tax').notFocused(_i.tax.display);
  $('#appreciation').notFocused(_i.appreciation.display);
  $('#rent').notFocused(_i.rent.display);

  // var _o = values.outputs;
  // $('#u0').html(_o.loan);
  // $('#u11m').html(_o.monthly_pmi);
  // $('#u12').html(_o.monthly_hoi);
  // $('#u13').html(_o.monthly_flood);
  // $('#u92').html(_o.monthly_tax);
  // $('#u99').html(_o.monthly_insurance);
  // $('#u91').html(_o.monthly_dues);
  // $('#u94a').html(_o.total_monthly_payments);
  // $('#u93').html(_o.monthly_principle_interest_with_extra);
  // $('#u90').html(_o.monthly_principle);
  // $('#u89').html(_o.monthly_interest);
  // $('#u96a').html(_o.years_to_pay_off);
  // $('#u95').html(_o.number_of_payments);
  // $('#u97').html(_o.total_principle_interest);
  // $('#u98').html(_o.total_interest);
  // $('#u17').html(_o.yearly_rent);
  // $('[data-output="u94z"]').html(_o.total_monthly_payments);
  // $('[data-output="u96z"]').html(_o.years_to_pay_off);
      var _i = values.inputs;
      var _o = values.outputs;
      var _first = values.first;
      var _final = values.final;
          // TODO: move all these to calculated variables in housing.calculate2.js, should make "total cost" in totals and graph same value
      $('#u90').html(_first.principle.monthly.toFixed());
      $('#u89').html(_first.interest.monthly.toFixed());
      $('#u93').html(_first.pi.monthly.toFixed());
      $('#u92').html(_first.tax.monthly.toFixed());
      $('#u11m').html(_first.pmi.monthly.toFixed());
      $('#u12').html(_first.hoi.monthly.toFixed());
      $('#u13').html(_first.flood.monthly.toFixed());
      $('#u99').html(parseInt(_first.pmi.monthly.toFixed()) + parseInt(_first.hoi.monthly.toFixed()) + parseInt(_first.flood.monthly.toFixed()));
      $('#u91').html(_first.hoa.monthly.toFixed());
          // var tm = parseInt(_first.pi.monthly.toFixed()) + parseInt(_first.tax.monthly.toFixed()) + parseInt(_first.pmi.monthly.toFixed()) + parseInt(_first.hoi.monthly.toFixed()) + parseInt(_first.flood.monthly.toFixed()) + parseInt(_first.hoa.monthly.toFixed());
          // $('#u94a').html(tm);
          $('#u94a').html(_first.payments.monthly);
      $('#u96a').html(_o.years_to_pay_off);
      $('#u95').html(_o.number_of_payments);
      $('#u97').html(_o.loan + _final.interest.total);
      $('#u0').html(_o.loan);
      $('#u98').html(_final.interest.total);
      $('#u88').html(_final.tax.total);
      $('#u87').html(_final.pmi.total)
      $('#u86').html(_final.hoi.total)
      $('#u85').html(_final.flood.total);
      $('#u84').html(_final.pmi.total + _final.hoi.total + _final.flood.total);
      $('#u83').html(_final.hoa.total);
      $('#u82').html(_i.down.number);
      $('#u81').html(_i.closing.number);
      $('#u80').html(_i.upfront.number);
          // var tl = _o.loan + _final.interest.total + _final.tax.total + _final.pmi.total + _final.hoi.total + _final.flood.total + _final.hoa.total + _i.upfront.number;
          // $('#u79').html(tl);
          $('#u79').html(_final.payments.total);
      $('#u17').html(_o.yearly_rent);
          // $('[data-output="u94z"]').html(tm);
          $('[data-output="u94z"]').html(_first.payments.monthly);
      $('[data-output="u96z"]').html(_o.years_to_pay_off);

  $('[data-output="location-name"]').html(locations[loc.id].name);
  $('[data-output="location-image"]').attr('src','img/' + locations[loc.id].image);

  // debug.log('\tamoritization()');
  // amoritization();

  // debug.log('\tformat_all()');
  // format_all();
};
// format = function(){
//   $.each($('[data-format="currency"]').not('input'),function(){
//     if(!AutoNumeric.test(this)){
//       new AutoNumeric(this,{
//         currencySymbol: '$',
//         decimalPlaces: 0
//       });
//     }
//     else {
//       // console.log(this.parentNode);
//
//       // AutoNumeric.reformatAndSet(this.parentNode);
//
//       $(this).global.reformat();
//
//       // $(this).autoNumeric(update,{
//       //   currencySymbol: '$',
//       //   decimalPlaces: 0
//       // });
//
//       // $(this).update({
//       //   currencySymbol: '$',
//       //   decimalPlaces: 0
//       // });
//
//       // new AutoNumeric(this,{
//       //   currencySymbol: '$',
//       //   decimalPlaces: 0
//       // });
//     }
//   });
// };
format_all = function(){
  $.each($('[data-format="currency"]').not('input'),function(){
    var html = $(this).html();
    var formatted = formatCurrency(html);
    $(this).html(formatted);
  });
  $.each($('input[data-format="currency"]'),function(){
    var value = $(this).val();
    var formatted = formatCurrency(value);
    $(this).val(formatted);
  });
};
formatCurrency = function(value){
  var formatted = AutoNumeric.format(value,{
    currencySymbol: '$',
    decimalPlaces: 0
  });
  return formatted;
};
formatNumber = function(value){
  var formatted = AutoNumeric.format(value,{
    decimalPlaces: 0
  });
  return formatted;
};
var unformatCurrency = function(value){
  var unformatted = AutoNumeric.unformat(value,{
    currencySymbol: '$',
    decimalPlaces: 0
  });
  return unformatted;
};
FV = function(rate,nper,pmt,pv,type){
  // FV means "future value"
  type || (type = 0);
  var pow = Math.pow(1 + rate, nper), fv;
  if(rate){
    fv = (pmt*(1+rate*type)*(1-pow)/rate)-pv*pow;
  }
  else {
    fv = -1 * (pv + pmt * nper);
  }
  return fv.toFixed(2);
};
input_edit = debounce(function(x){
  var id = $(x).attr('id'); // id of input being edited
  debug.log('input_edit(#'+id+')');
  var name = $(x).data('cookie'); // data-cookie of input being edited
  var value = $(x).val(); // value of input being edited
  if(value != values.inputs[name].display){
    if(value){
      cookies_set(name,value); // if value in input field, set cookie
      // values[name].display = value;
      send[name] = value;
    }
    else{
      cookies_remove(name); // if nothing in input field, remove cookie
      // values[name].display = null;
      send[name] = null;
    }
    // if(id == 'upfront' || id == 'e4z'){
    if(id == 'upfront'){
      cookies_remove('down');
      master_set('upfront');
    }
    else if(id == 'down'){
      cookies_remove('upfront');
      master_set('down');
    }
    else if(id == 'tax'){
      if(loc.id != 'custom'){
        loc.id = 'custom';
        location_set($('[data-value="custom"]'));
      }
    }
    api_call();
    amoritization(values);
    display_all();
    ga('send','event','input','edit',id);
    debug.log("\tga('send','event','input','edit','" + id + "')");
  }
},500);
init_values = function(){
  debug.log('init_values()');
  loc.id = cookies.location || "atlanta"; // Location
  loc.data = locations[loc.id] || {};
  send.price = loc.data.price || cookies.price || "250000"; // Purchase price
  send.upfront = loc.data.upfront || cookies.upfront || null; // Total at closing
  send.down = loc.data.down || cookies.down || "10%"; // Down payment
  if(send.upfront){
    master_set('upfront');
  }
  else {
    master_set('down');
  }
  send.closing = loc.data.closing || cookies.closing || "4%"; // Closing costs
  send.tax = loc.data.tax || cookies.tax || "0.87%"; // Effective tax rate
  send.hoi = loc.data.hoi || cookies.hoi || null; // Yearly homeowners insurance -> calc_hoi()
  send.flood = loc.data.flood || cookies.flood || null; // Yearly flood insurance -> calc_flood()
  send.month = loc.data.month || cookies.month || $('#month').val(); // Purchase month
  send.year = loc.data.year || cookies.year || $('#year').val(); // Purchase year
  send.term = loc.data.term || cookies.term || "30"; // Loan term
  send.interest = loc.data.interest || cookies.interest || "3.94%"; // Yearly interest rate
  send.pmi = loc.data.pmi || cookies.pmi || "1.15%"; // Yearly PMI rate
  send.hoa = loc.data.hoa || cookies.hoa || "0"; // Monthly HOA dues
  send.extra = loc.data.extra || cookies.extra || "0"; // Extra monthly payment
  send.appreciation = loc.data.appreciation || cookies.appreciation || "2%"; // Yearly appreciation rate
  send.rent = loc.data.rent || cookies.rent || "1275"; // Monthly rent comparison
  api_call();
  amoritization(values);
  display_all();
};
isAnalyticsCookie = function(x){
  if(x == '_ga' || x == '_gid' || x == '_gat')
    return true;
  else
    return false;
};
isNumber = function(n){
  //'use strict';
  //n = n.replace(/\./g,'').replace(',','.');
  //return !isNaN(parseFloat(n)) && isFinite(n);
  n = n.replace(',','');
  return parseFloat(n);
}
isObject = function(x){
  if(typeof x === 'object' && x !== null)
    return true;
  else
    return false;
};
isJsonString = function(x){
  if(typeof x != 'string'){
    return false;
  }
  else if(x.substring(0,1) != '{' && x.substring(0,1) != '['){
    return false;
  }
  else {
    try {
      JSON.parse(x);
    }
    catch(e){
      return false;
    }
    return true;
  }
}
isLocalHost = function(){
  if(location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '')
    return true;
  else
    return false;
};
isVersionCookie = function(x){
  if(x == 'version')
    return true;
  else
    return false;
};
location_select = function(x){
  debug.log('location_select()');
  if($(x).data()){
    loc.id = $(x).data('value');
    if(locations[loc.id]){
      location_set(x);
    }
    ga('send','event','location','click',loc.id);
    debug.log("\tga('send','event','location','click','" + loc.id + "')");
  }
  else {
    ga('send','event','location','click','unknown');
    debug.log("\tga('send','event','location','click','unknown')");
  }
};
location_set = function(x){
  $('#locations > li').removeClass();
  $(x).addClass('selected');
  loc.data = locations[loc.id] || {};
  $.each(locations[loc.id],function(i,v){
    if(i != 'name'){
      send[i] = v;
      cookies_remove(i);
    }
  });
  cookies_set('location',loc.id);
  api_call();
  amoritization(values);
  display_all();
};
master_set = function(x){
  debug.log('\tmaster_set("'+x+'")');
  if(x == 'upfront'){
    $('#upfront, #e4z').removeClass('slave');
    $('#down').addClass('slave');
    master = 'upfront';
    send.down = null;
  }
  if(x == 'down'){
    $('#down').removeClass('slave');
    $('#upfront, #e4z').addClass('slave');
    master = 'down';
    send.upfront = null;
  }
}
share_click = function(x){
  debug.log('share_click()');
  if($(x).data()){
    var s = $(x).data('share');
    ga('send','event','share','click',s);
    debug.log("\tga('send','event','share','click','" + s + "')");
  }
  else {
    ga('send','event','share','click','unknown');
    debug.log("\tga('send','event','share','click','unknown')");
  }
};
tab_click = function(x){
  debug.log('tab_click()');
  var id = $(x).data('tab');
  if(!$(x).hasClass('selected')){
    // if tab is not already selected then fire event
    ga('send','event','tab','click',id);
    debug.log("\tga('send','event','tab','click','" + id + "')");
  }
  $(x).siblings('li').removeClass('selected');
  $(x).parent().siblings('.tab').removeClass('visible');
  $(x).addClass('selected');
  $('#' + id).addClass('visible');
};
table_row = function(a){
  var tr = '<tr>';
  $.each(a,function(k,v){
    tr += '<td>' + v + '</td>';
  });
  tr += '</tr>';
  return tr;
};
window_scroll = function(){
  if($(window).width() < 480){
    var end_tracking = $('.card.edit').offset().top - $('.top-bar').outerHeight();
    if($(window).scrollTop() < end_tracking){
      $('.floater').removeClass('show');
      // var tracking_distance = $('.card.mortgage').outerHeight(); // 300
        var tracking_distance = $('.card.mortgage > .content').outerHeight(); // 300
      var start_tracking = end_tracking - tracking_distance;
      var opacity = 1;
      if($(window).scrollTop() > start_tracking){
        var tracking_position = (($(window).scrollTop() - start_tracking) / tracking_distance);
        opacity = 1 - tracking_position;
      }
      $('.card.mortgage').css('opacity', opacity);
    }
    else {
      $('.floater').addClass('show');
      $('.card.mortgage').css('opacity', 0);
    }
  }
  else {
    if($(window).scrollTop() < $('.top-bar').outerHeight()){
      $('.floater').removeClass('show');
    }
    else {
      $('.floater').addClass('show');
    }
    $('.card.mortgage').css('opacity', 1);
  }
};
