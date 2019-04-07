// TODO: need reset to default option for editable inputs and selects
// TODO: determine what is changeable when location is selected

var cookies;
var loc = {};
var values = {};
var king;
var queen;
var pawn;

$(function(){
  $.fn.notFocused = function(val){
    if(!$(this).is(':focus')){
      $(this).val(val);
    }
    return this;
  }
}(jQuery));

amoritization_click = function(){
  var cl = $('<close></close>').on('click',function(){
    amoritization_close();
  });
  var at = '<div>';
  at += '<div class="table">';
  at += `<div class="labels">
          <row>
            <cell>Date</cell>
            <cell>Monthly appreciation rate</cell>
            <cell>Home value</cell>
            <cell>Extra payment</cell>
            <cell>Balance</cell>
            <cell>Equity</cell>
            <cell>Unequitable cost</cell>
            <cell>Recoverable payments (from sale)</cell>
            <cell>Total payments</cell>
          </row>
        </div>`;
  at += '<div class="rows">';
  $.each(values.monthly_amoritization,function(i,v){
    // var appreciation_monthly = PMT(values.inputs.appreciation.percent, 12, v.value);
    // var appreciation_monthly = 12 * (Math.pow(1 + values.inputs.appreciation.percent,(1/12)) - 1);
    // r = m × [ ( 1 + i)1/m - 1 ]
    at += `<row>
            <cell>${ v.date } (${ v.month }mo)</cell>
            <cell><input id="monthly-appreciation-rate-${ i }" value="${ (values.outputs.monthly_nominal_appreciation / 12 * 100).toFixed(5) }%"></cell>
            <cell>${ v.value.toFixed(0) }</cell>
            <cell><input id="extra-payment-${ i }" value="${ values.inputs.extra.number.toFixed(0) }"></cell>
            <cell>${ v.balance.toFixed(0) }</cell>
            <cell>${ v.equity.toFixed(0) }</cell>
            <cell>${ v.cost_sale.toFixed(0) }</cell>
            <cell style="color: rgb(0,${ ((Math.round((v.equity/v.payments.total)*100)/100*255*1.5)-127.5) },0)">${ (Math.round((v.equity/v.payments.total)*100)) }%</cell>
            <cell>${ v.payments.total.toFixed(0) }</cell>
          </row>`;
  });
  at += '</div>';
  at += '</div>';
  at += '</div>';
  $('#amoritization-table').append(cl).append(at);
  $('#amoritization-table').addClass('show');
  ga('send','event','amoritization','click','open');
  debug.log("\tga('send','event','amoritization','click','open')");
};
amoritization_close = function(){
  $('#amoritization-table').empty().removeClass('show');
  ga('send','event','amoritization','click','close');
  debug.log("\tga('send','event','amoritization','click','close')");
};
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

cookies_get = function(){
  debug.log('cookies_get()');
  cookies = Cookies.get();
  if(isLocalHost()){
    cookies = {};
    // version 1.1
    // cookies._ga = 'GA1.2.123456789.1234567890';
    // cookies._gat = '1';
    // cookies._gid = 'GA1.2.123456789.1234567890';
    // cookies.location = "seattle";
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
    // cookies.king = "upfront";
    // cookies.queen = "down";
    // cookies.pawn = "closing";
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
init_values = function(){
  debug.log('init_values()');
  loc.id = cookies.location || "atlanta"; // Location
  loc.data = locations[loc.id] || {};

  values.inputs = {};
  values.inputs.price = {};
  values.inputs.upfront = {};
  values.inputs.down = {};
  values.inputs.closing = {};
  values.inputs.tax = {};
  values.inputs.hoi = {};
  values.inputs.flood = {};
  values.inputs.month = {};
  values.inputs.year = {};
  values.inputs.term = {};
  values.inputs.interest = {};
  values.inputs.pmi = {};
  values.inputs.hoa = {};
  values.inputs.extra = {};
  values.inputs.appreciation = {};
  values.inputs.rent = {};
  // 1. try to set from the selected location's default value, 2. try to set from cookie, 3. set using the standard default
  values.inputs.price.display = loc.data.price || cookies.price || "250000"; // Purchase price
  king = cookies.king || null;
  queen = cookies.queen || null;
  pawn = cookies.pawn || null;
  switch(king){
    case "upfront": values.inputs.upfront.display = loc.data.upfront || cookies.upfront || null; break;
    case "down": values.inputs.down.display = loc.data.down || cookies.down || "10%"; break;
    case "closing":
    default: values.inputs.closing.display = loc.data.closing || cookies.closing || "4%"; king = "closing"; break;
  }
  switch(queen){
    case "upfront": values.inputs.upfront.display = loc.data.upfront || cookies.upfront || null; break;
    case "closing": values.inputs.closing.display = loc.data.closing || cookies.closing || "4%"; break;
    case "down":
    default: values.inputs.down.display = loc.data.down || cookies.down || "10%"; queen = 'down'; break;
  }
  switch(pawn){
    case "down": break;
    case "closing": break;
    case "upfront":
    default: pawn = 'upfront'; break;
  }
  debug.log('king: ' + king + ', queen: ' + queen + ', pawn: ' + pawn);
  set_king(king);
  values.inputs.tax.display = loc.data.tax || cookies.tax || "0.87%"; // Effective tax rate
  values.inputs.hoi.display = loc.data.hoi || cookies.hoi || null; // Yearly homeowners insurance -> calc_hoi()
  values.inputs.flood.display = loc.data.flood || cookies.flood || null; // Yearly flood insurance -> calc_flood()
  values.inputs.month.display = loc.data.month || cookies.month || $('#month').val(); // Purchase month
  values.inputs.year.display = loc.data.year || cookies.year || $('#year').val(); // Purchase year
  values.inputs.term.display = loc.data.term || cookies.term || "30"; // Loan term
  values.inputs.interest.display = loc.data.interest || cookies.interest || "4.5%"; // Yearly interest rate
  values.inputs.pmi.display = loc.data.pmi || cookies.pmi || "1.15%"; // Yearly PMI rate
  values.inputs.hoa.display = loc.data.hoa || cookies.hoa || "0"; // Monthly HOA dues
  values.inputs.extra.display = loc.data.extra || cookies.extra || "0"; // Extra monthly payment
  values.inputs.appreciation.display = loc.data.appreciation || cookies.appreciation || "2%"; // Yearly appreciation rate
  values.inputs.rent.display = loc.data.rent || cookies.rent || "1275"; // Monthly rent comparison
  calculate();
  amoritization_graph();
  display_all();
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
      values.inputs[name].display = value;
    }
    else{
      cookies_remove(name); // if nothing in input field, remove cookie
      // values[name].display = null;
      values.inputs[name].display = null;
    }
    if(id == 'upfront'){
      set_king('upfront');
    }
    else if(id == 'down'){
      set_king('down');
    }
    else if(id == 'closing'){
      set_king('closing');
    }
    else if(id == 'tax'){
      if(loc.id != 'custom'){
        loc.id = 'custom';
        location_set($('[data-value="custom"]'));
      }
    }
    calculate();
    amoritization_graph();
    display_all();
    ga('send','event','input','edit',id);
    debug.log("\tga('send','event','input','edit','" + id + "')");
  }
},500);
input_reset_all = function(){
  // if(confirm('Reset all inputs?')){
  //   cookies_remove_all();
  //   $('#locations > li').removeClass();
  //   init_values();
  //   ga('send','event','reset','click','all');
  //   debug.log("\tga('send','event','reset','click','all')");
  // }
  var p = {};
  p.text = {};
  p.text.title = 'Reset inputs';
  // p.text.body = 'All inputs will be reset to their default values. You can also reset individual inputs if you just want to change something.';
  p.text.body = 'Reset all inputs to their default values?';
  p.text.no = 'Cancel';
  p.text.yes = 'Reset inputs';
  p.action = {};
  p.action.no = false;
  p.action.yes = function(){
    cookies_remove_all();
    delete locations.custom.tax;
    $('#locations > li').removeClass();
    init_values();
    ga('send','event','reset','click','all');
    debug.log("\tga('send','event','reset','click','all')");
  };
  prompt(p);
};
prompt = function(p){
  debug.log('prompt("' + p.text.title + '")');
  var wrapper = $('<section></section>').addClass('prompt').on('click',function(){
    wrapper.remove();
    if(p.action.no) p.action.no();
  });
  var box = $('<div></div>').addClass('box').on('click',function(){
    return false;
  });
  var title = $('<div></div>').addClass('title').html(p.text.title);
  var body = $('<div></div>').addClass('body').html(p.text.body);
  var options = $('<ul></ul>').addClass('noselect');
  var no = $('<li></li>').html(p.text.no).on('click',function(){
    wrapper.remove();
    if(p.action.no) p.action.no();
  });
  var yes = $('<li></li>').html(p.text.yes).on('click',function(){
    wrapper.remove();
    p.action.yes();
  });
  options.append(no, yes)
  box.append(title, body, options);
  wrapper.append(box);
  $('body').append(wrapper);
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
  debug.log('location_set()');
  $('#locations > li').removeClass();
  $(x).addClass('selected');
  loc.data = locations[loc.id] || {};
  if(loc.id == 'custom'){
    loc.data.tax = cookies.tax || values.inputs.tax;
    cookies_set('tax',loc.data.tax);
  }
  $.each(locations[loc.id],function(i,v){
    if(i != 'name'){
      values.inputs[i] = v;
      if(i != 'tax') cookies_remove(i);
    }
  });
  cookies_set('location',loc.id);
  calculate();
  amoritization_graph();
  display_all();
};
set_king = function(x){
  debug.log('\tset_king("'+x+'")');
  if(king == x){
    debug.log('Do nothing because king is not changing.');
  }
  else {
    $('#upfront, #down, #closing').removeClass('pawn');
    if(x == 'upfront'){
      if(king == x){}
      else if(king == 'down'){ king = x; queen = 'down'; pawn = 'closing'; values.inputs.closing = null; }
      else if(king == 'closing'){ king = x; queen = 'closing'; pawn = 'down'; values.inputs.down = null; }
      else { king = x; queen = 'closing'; pawn = 'down'; values.inputs.down = null; }
    }
    else if(x == 'down'){
      if(king == x){}
      else if(king == 'upfront'){ king = x; queen = 'upfront'; pawn = 'closing'; values.inputs.closing = null; }
      else if(king == 'closing'){ king = x; queen = 'closing'; pawn = 'upfront'; values.inputs.upfront = null; }
      else { king = x; queen = 'closing'; pawn = 'upfront'; values.inputs.upfront = null; }
    }
    else if(x == 'closing'){
      if(king == x){}
      else if(king == 'upfront'){ king = x; queen = 'upfront'; pawn = 'down'; values.inputs.down = null; }
      else if(king == 'down'){ king = x; queen = 'down'; pawn = 'upfront'; values.inputs.upfront = null; }
      else { king = x; queen = 'down'; pawn = 'upfront'; values.inputs.upfront = null; }
    }
    cookies_remove(pawn);
    cookies_set('king',king);
    cookies_set('queen',queen);
    cookies_set('pawn',pawn);
  }
  $('#' + pawn).addClass('pawn');
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
  // If phone width
  if($(window).width() < 480){
    var top_bar_height = 138; // (130 + 8) instead of $('.top-bar').outerHeight() to fix jumping around on scroll
    var end_tracking = $('.card.edit').offset().top - top_bar_height;
    if($(window).scrollTop() < end_tracking){
      $('#floater').removeClass('show');
      $('#locations').removeClass('collapsed');
      var tracking_distance = $('#card-mortgage > .content').outerHeight(); // 300
      var start_tracking = end_tracking - tracking_distance;
      var opacity = 1;
      if($(window).scrollTop() > start_tracking){
        var tracking_position = (($(window).scrollTop() - start_tracking) / tracking_distance);
        opacity = 1 - tracking_position;
      }
      $('#card-mortgage').css('opacity', opacity);
    }
    else {
      $('#card-mortgage').css('opacity', 0);
      $('#floater').addClass('show');
      $('#locations').addClass('collapsed');
    }
  }
  // If larger than phone width
  else {
    if($(window).scrollTop() < $('.top-bar').outerHeight()){
      $('#card-mortgage').css('opacity', 1);
      $('#floater').removeClass('show');
      $('#locations').removeClass('collapsed');
    }
    else {
      $('#card-mortgage').css('opacity', 0);
      $('#floater').addClass('show');
      $('#locations').addClass('collapsed');
    }
    // $('#card-mortgage').css('opacity', 1);
  }
};
