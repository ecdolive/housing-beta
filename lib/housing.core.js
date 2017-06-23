var e = {};
var u = {};
var cookies;
var slave;

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
  //auto_width($('#e19z'));
  auto_width($('#u94z'));
  auto_width($('#u96z'));
  //console.log('auto_width_inputs() done');
};

closeMenu = function(){
  $('body').removeClass('menu-open').addClass('menu-closed');
};

cookies_get = function(){
  console.log('cookies_get()');
  cookies = Cookies.get();
  //if(!$.isEmptyObject(cookies)){
    //console.log('cookies exist');
    $.each(cookies,function(i,v){
      console.log('\t' + i + ': ' + v);
      cookies[i] = JSON.parse(v);
    });
  /*}
  else {
    console.log('cookies do not exist');
    cookies.price = {};
    cookies.price.id = 'e1a';
    cookies.price.val = '300000';
  }*/
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

date_options = function(){
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
  console.log('date_options()');
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
  var c_inputs = $('c-input > input, c-input > select');
  var i_inputs = $('i-input > input');
  $.each(c_inputs,function(){
    var id = '(' + $(this).attr('id') + ') ';
    $(this).parent().siblings('c-name').prepend(id);
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

inputEdit = debounce(function(x){
  var id = $(x).attr('id');
  var val = $(x).val();
  if(val != e[id]){ // if value changed
    var name = $(x).attr('data-cookie');
    // update cookie
    //if(val && parseFloat(val) != 0){ // does not allow for zero values
    if(val){ // allows for zero values
      var value = JSON.stringify({
        'id': id,
        'val': val
      });
      Cookies.set(name,value,{expires:3650});
      //console.log('Cookie: set "' + name + '" to "' + value + '";');
    }
    else {
      Cookies.remove(name);
      //console.log('Cookie: remove "' + name + '";');
    }
    calculate(id,val);
  }
},100);

function isNumber(n){
  //'use strict';
  //n = n.replace(/\./g,'').replace(',','.');
  //return !isNaN(parseFloat(n)) && isFinite(n);
  n = n.replace(',','');
  return parseFloat(n);
}

isPercentage = function(x){
  //x || (x = '');
  return String(x).indexOf('%') > -1 ? true : false;
};

makePercent = function(a,b){
  //return ((a / b) * 100).toFixed(1) + '%';
  return ((a / b) * 100).toFixed(1).replace('.0','') + '%';
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

openMenu = function(){
  $('body').removeClass('menu-closed').addClass('menu-open');
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

slave_set = function(x){
  if(x == 'down'){
    //console.log('set slave to down');
    $('#e4a, #e4z').removeClass('slave');
    $('#e2a').addClass('slave');
    slave = 'down';
  }
  if(x == 'total'){
    //console.log('set slave to total');
    $('#e2a').removeClass('slave');
    $('#e4a, #e4z').addClass('slave');
    slave = 'total';
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