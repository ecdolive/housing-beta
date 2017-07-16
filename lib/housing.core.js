/*
BUG: date_build() doesn't create the year 1999
BUG: input edit below is not detecting changes in input value as intended
*/

var values = {}; // where all stored values are kept, default and edited
var e = {};
var u = {};
var cookies;
var master;
var loc;

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
  $('#e7').append(m_options);
  // build year options
  var y_options = [];
  for(var x=0; x<44; x++){
    var d = new Date(first_year + x,x);
    var h = date_display(d,'yyyy');
    var o = $('<option></option>').val(h).html(h);
    if(yyyy == h) o.prop('selected',true);
    y_options.push(o);
  }
  $('#e8').append(y_options);
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

FV = function(rate,nper,pmt,pv,type){
  type || (type = 0);
  var pow = Math.pow(1 + rate, nper), fv;
  if(rate){
    fv = (pmt*(1+rate*type)*(1-pow)/rate)-pv*pow;
  } else {
    fv = -1 * (pv + pmt * nper);
  }
  return fv.toFixed(2);
}

input_edit = debounce(function(x){
  var id = $(x).attr('id');
  var name = $(x).data('cookie');
  var value = $(x).val();
  if(value != values[name].display){ // if value changed, update cookie and recalculate
    // BUG: .display needs to update is this changes
    if(value) cookies_set(name,value);
    else cookies_remove(name);
    calculate(id,value);
  }
},100);

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

isPercentage = function(x){
  //x || (x = '');
  return String(x).indexOf('%') > -1 ? true : false;
};
isVersionCookie = function(x){
  if(x == 'version')
    return true;
  else
    return false;
};

/*location_select = function(x){
  if($(x).data()){
    var y = $(x).data('value');
    //console.log('there is a data element: ' + y);
    if(locs[y]){
      //console.log('it matches a locs: ' + locs[y].name);
      values.calc.tax = parseFloat(locs[y].tax_rate); $('#e14').val(values.calc.tax);
      calculate();
      $('#locations > li').removeClass();
      $(x).addClass('selected');
      Cookies.set('none',y,{expires:3650});
        // DELETE TAX RATE COOKIE
      //console.log("Cookies.set('none'," + y + ",{expires:3650})");
    }
    else {
      //console.log('it does not match a locs (this should not happen)');
    }
  }
  else {
    //console.log('there is no data element: ' + $(x).data());
  }
};*/
location_select = function(x){
  // console.log('location_select()');
  if($(x).data()){
    var y = $(x).data('value');
    if(locs[y]){
      // values.calc.tax = parseFloat(locs[y].tax_rate); $('#e14').val(values.calc.tax);
      values.location.display = y;
      $('#locations > li').removeClass();
      $(x).addClass('selected');
      // console.log('\tset attached variables');
      $.each(locs[y],function(i,v){
        if(i != 'name' && !values[i].saved){
          // console.log('\t\t'+i+' -> '+v);
          // values[i].location = v;
          // values[i].display = v;
          switch(i){
            // case 'price': edit_price(v,true); break;
            // case 'upfront': edit_upfront(v,true); break;
            // case 'down': edit_down(v,true); break;
            // case 'closing': edit_closing(v,true); break;
            // case 'term': edit_term(v,true); break;
            case 'interest': edit_interest(v,true); break;
            // case 'pmi': edit_pmi(v,true); break;
            // case 'hoa': edit_hoa(v,true); break;
            // case 'extra': edit_extra(v,true); break;
            // case 'hoi': edit_hoi(v,true); break;
            case 'flood': edit_flood(v,true); break;
            case 'tax': edit_tax(v,true); break;
            case 'appreciation': edit_appreciation(v,true); break;
            case 'rent': edit_rent(v,true); break;
          }
        }
      });
      // refresh_inputs();
      calculate();
      cookies_set('location',y);
      // DELETE TAX RATE COOKIE
    }
  }
};

makePercent = function(a,b){
  //return ((a / b) * 100).toFixed(1) + '%';
  return ((a / b) * 100).toFixed(1).replace('.0','') + '%';
};

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

NPER = function(rate,payment,present,future,type){
    // Handle if interest rate is 0
    if(rate == 0) return - (present / payment);
  // Copyright (c) 2012 Sutoiku, Inc. (MIT License)
  // Initialize type
  var type = (typeof type === 'undefined') ? 0 : type;
  // Initialize future value
  var future = (typeof future === 'undefined') ? 0 : future;
  // Evaluate rate and periods (TODO: replace with secure expression evaluator)
  rate = eval(rate);
  // Return number of periods
  var num = payment * (1 + rate * type) - future * rate;
  var den = (present * rate + payment * (1 + rate * type));
  return Math.log(num / den) / Math.log(1 + rate);
};

parsePercent = function(a){
  if(/%/i.test(a)){
    //return (parseInt(a)/100);
    return (parseFloat(a)/100);
  }
};

PMT = function(ir,np,pv,fv,type){
  //http://stackoverflow.com/questions/5294074/pmt-function-in-javascript
  var pmt, pvif;
  fv || (fv = 0);
  type || (type = 0);
  if(ir === 0){
    return -(pv + fv)/np;
  }
  pvif = Math.pow(1 + ir, np);
  pmt = - ir * pv * (pvif + fv) / (pvif - 1);
  if (type === 1){
    pmt /= (1 + ir);
  }
  return pmt;
};

master_set = function(x){
  if(x == 'upfront'){
    $('#e4a, #e4z').removeClass('slave');
    $('#e2a').addClass('slave');
    master = 'upfront';
  }
  if(x == 'down'){
    $('#e2a').removeClass('slave');
    $('#e4a, #e4z').addClass('slave');
    master = 'down';
  }
}

table_row = function(a){
  var tr = '<tr>';
  $.each(a,function(k,v){
    tr += '<td>' + v + '</td>';
  });
  tr += '</tr>';
  return tr;
};
