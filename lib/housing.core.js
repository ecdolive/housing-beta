// BUG: date_build() doesn't create the year 1999

var values;
// var e = {};
var u = {};
var cookies;
var master;
var loc,loc_data,month,year,price,upfront,closing,down,term,interest,pmi,hoa,extra,hoi,flood,tax,appreciation,rent;

$(function(){
  $.fn.notFocused = function(val){
    if(!$(this).is(':focus')){
      $(this).val(val);
    }
    return this;
  }
}(jQuery));

api_call = function(){
  values = api_calculate(month,year,price,upfront,closing,down,term,interest,pmi,hoa,extra,hoi,flood,tax,appreciation,rent);
};
auto_width = function(el){
  var w = 0;
  var div = $('<div></div>');
  $('body').append(div);
  $(div).css({
    position: 'absolute',
    left: -1000,
    top: -1000,
    display: 'none'
  });
  $(div).html($(el).val());
  var styles = ['font-size','font-style','font-weight','font-family','line-height','text-transform','letter-spacing'];
  $(styles).each(function(){
    var s = this.toString();
    $(div).css(s,$(el).css(s));
  });
  w = $(div).outerWidth();
  $(div).remove();
  $(el).css('width',w);
};
auto_width_inputs = function(){
  auto_width($('#e4z'));
  auto_width($('#e1z'));
  auto_width($('#u94z'));
  auto_width($('#u96z'));
  //console.log('auto_width_inputs() done');
};
cookies_get = function(){
  // console.log('cookies_get()');
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
  if(isLocalHost()) console.log('\t\tCookies.remove("' + name + '");');
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
  if(isLocalHost()) console.log('\t\tCookie.set("' + name + '","' + value + '",{expires:3650});');
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
  // console.log('date_build()');
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
    var d = new Date(first_year + x,x);
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
debug = function(){
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
display_all = function(){
  $('#locations > li[data-value="' + loc + '"]').addClass('selected');
  $('#month').val(values.month.display);
  $('#year').val(values.year.display);
  $('#price').notFocused(values.price.display);
  $('#upfront').notFocused(values.upfront.display);
  $('#upfront_opposite').text(values.upfront.opposite);
  $('#closing').notFocused(values.closing.display);
  $('#closing_opposite').text(values.closing.opposite);
  $('#down').notFocused(values.down.display);
  $('#down_opposite').text(values.down.opposite);
  $('#term').notFocused(values.term.display);
  $('#interest').notFocused(values.interest.display);
  $('#pmi').notFocused(values.pmi.display);
  $('#hoa').notFocused(values.hoa.display);
  $('#extra').notFocused(values.extra.display);
  $('#hoi').notFocused(values.hoi.display);
  $('#flood').notFocused(values.flood.display);
  $('#tax').notFocused(values.tax.display);
  $('#appreciation').notFocused(values.appreciation.display);
  $('#rent').notFocused(values.rent.display);

  $('#u0').val(values._output.loan);
  $('#u11m').val(values._output.monthly_pmi);
  $('#u91').val(values._output.monthly_principle_interest);
  $('#u92').val(values._output.monthly_tax_insurance_dues);
  $('#u94a').val(values._output.total_monthly_payments);
  $('#u93').val(values._output.monthly_mortgage_payment);
  $('#u96a').val(values._output.years_to_pay_off);
  $('#u95').val(values._output.number_of_payments);
  $('#u97').val(values._output.total_mortgage_payments);
  $('#u98').val(values._output.total_interest);
  $('#u17').val(values._output.yearly_rent);

  $('#e4z').notFocused(values.upfront.number);
  $('#e1z').notFocused(values.price.display);
  $('#u94z').val(values._output.total_monthly_payments);
  $('#u96z').val(values._output.years_to_pay_off);
};
input_edit = debounce(function(x){
  var id = $(x).attr('id'); // id of input being edited
  var name = $(x).data('cookie'); // data-cookie of input being edited
  var value = $(x).val(); // value of input being edited
  if(value != values[name].display){
    if(value){
      cookies_set(name,value); // if value in input field, set cookie
      // values[name].display = value;
      window[name] = value;
    }
    else{
      cookies_remove(name); // if nothing in input field, remove cookie
      // values[name].display = null;
      window[name] = null;
    }
    if(id == 'upfront' || id == 'e4z'){
      Cookies.remove('down'); // remove cookie, but leave value for calculate()
      master_set('upfront');
    }
    else if(id == 'down'){
      Cookies.remove('upfront'); // remove cookie, but leave value for calculate()
      master_set('down');
    }
  }
  api_call();
  display_all();
  auto_width_inputs();
},100);
inputs_fill = function(){
  // TODO: put loc into loc_data object
  loc = cookies.location || "atlanta"; // Location
  loc_data = {};
  $.each(locations[loc], function(i,v){
    if(i != 'name') loc_data[i] = v;
  });
  price = loc_data.price || cookies.price || "250000"; // Purchase price
  upfront = loc_data.upfront || cookies.upfront || null; // Total at closing
  down = loc_data.down || cookies.down || "3%"; // Down payment
  if(upfront){
    master_set('upfront');
    down = null;
  }
  else {
    master_set('down');
  }
  closing = loc_data.closing || cookies.closing || "5%"; // Closing costs
  tax = loc_data.tax || cookies.tax || "0.87%"; // Effective tax rate
  hoi = loc_data.hoi || cookies.hoi || null; // Yearly homeowners insurance -> calc_hoi()
  flood = loc_data.flood || cookies.flood || null; // Yearly flood insurance -> calc_flood()
  month = loc_data.month || cookies.month || $('#month').val(); // Purchase month
  year = loc_data.year || cookies.year || $('#year').val(); // Purchase year
  term = loc_data.term || cookies.term || "30"; // Loan term
  interest = loc_data.interest || cookies.interest || "3.875%"; // Yearly interest rate
  pmi = loc_data.pmi || cookies.pmi || "1.15%"; // Yearly PMI rate
  hoa = loc_data.hoa || cookies.hoa || "0"; // Monthly HOA dues
  extra = loc_data.extra || cookies.extra || "0"; // Extra monthly payment
  appreciation = loc_data.appreciation || cookies.appreciation || "2%"; // Yearly appreciation rate
  rent = loc_data.rent || cookies.rent || "1275"; // Monthly rent comparison
  api_call();
  display_all();
  auto_width_inputs();
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
  if(typeof x === 'object' && x !== null) return true;
  else return false;
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
  if(location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '') return true;
  else return false;
};
isVersionCookie = function(x){
  if(x == 'version')
    return true;
  else
    return false;
};
location_select = function(x){
  // console.log('location_select()');
  // TODO: optimize this function
  if($(x).data()){
    loc = $(x).data('value');
    if(locations[loc]){
      $('#locations > li').removeClass();
      $(x).addClass('selected');
      loc_data = {};
      $.each(locations[loc],function(i,v){
        if(i != 'name'){
          loc_data[i] = v;
          window[i] = v;
          cookies_remove(i);
        }
      });
      cookies_set('location',loc);
      api_call();
      display_all();
      auto_width_inputs();
    }
  }
};
master_set = function(x){
  if(x == 'upfront'){
    $('#upfront, #e4z').removeClass('slave');
    $('#down').addClass('slave');
    master = 'upfront';
  }
  if(x == 'down'){
    $('#down').removeClass('slave');
    $('#upfront, #e4z').addClass('slave');
    master = 'down';
  }
}
menu_close = function(x){
  $('body').removeClass('menu-open').addClass('menu-closed');
  if(x) ga('send','event','Menu','close',x);
  else ga('send','event','Menu','close');
};
menu_open = function(x){
  $('body').removeClass('menu-closed').addClass('menu-open');
  if(x) ga('send','event','Menu','open',x);
  else ga('send','event','Menu','open');
};
menu_toggle = function(){
  if($('body').hasClass('menu-closed')) menu_open('details toggle');
  else menu_close('details toggle');
};
table_row = function(a){
  var tr = '<tr>';
  $.each(a,function(k,v){
    tr += '<td>' + v + '</td>';
  });
  tr += '</tr>';
  return tr;
};
