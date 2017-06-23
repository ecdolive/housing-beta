/*
TODO:
finish changeClosing()
finish changeDown()
refactor defaults() code into common handlers
refactor change...() functions
*/

defaults = function(){
  console.log('defaults()');
  var c = copyObject(cookies);

  // price
    if(c.price){
      var p = c.price;
      e.e1a = p.val;
      e.e1z = p.val;
      $('#e1a, #e1z').val(p.val);
      delete c.price;
      console.log('\tcookie: price applied');
    }
    else {
      e.e1a = 250000; // Home purchase price
      e.e1z = e.e1a; // Home purchase price
    }
  // closing
    if(c.closing){
      var p = c.closing;
      e.e3a = p.val;
      delete c.closing;
      console.log('\tcookie: closing applied');
    }
    else {
      e.e3a = '5%'; // Closing costs
    }
    if(isPercentage(e.e3a)){
      e.e3b = parsePercent(e.e3a) * e.e1a;
      e.e3c = e.e3b;
    }
    else {
      e.e3b = makePercent(e.e3a,e.e1a);
      e.e3c = parseInt(e.e3a);
    }
    $('#e3a').val(e.e3a);
    $('#e3b').val(e.e3b);
  // down
    if(c.down){
      var p = c.down;
      // code chunk A start
      if(p.id == 'e4a' || p.id == 'e4z'){
        // if user defined total paid at closing...
        e.e4a = p.val;
        if(isPercentage(e.e4a)){
          e.e4b = parsePercent(e.e4a) * e.e1a;
          e.e4c = e.e4b;
        }
        else {
          e.e4b = makePercent(e.e4a,e.e1a);
          e.e4c = parseInt(e.e4a);
        }
        e.e4z = e.e4c;
        $('#e4a').val(e.e4a);
        $('#e4b').text(e.e4b);
        $('#e4z').val(e.e4z);
        // calculate down payment
        e.e2c = Math.round(e.e4c - e.e3c);
        e.e2a = makePercent(e.e2c,e.e1a);
        e.e2b = e.e2c;
        $('#e2a').val(e.e2a);
        $('#e2b').text(e.e2b);
        slave_set('down');
      }
      else if(p.id == 'e2a'){
        // if user defined down payment...
        e.e2a = p.val;
        if(isPercentage(e.e2a)){
          //console.log('\t\te2a is a percentage');
          e.e2b = Math.round(parsePercent(e.e2a) * e.e1a);
          e.e2c = e.e2b;
        }
        else {
          e.e2b = makePercent(e.e2a,e.e1a);
          e.e2c = parseInt(e.e2a);
        }
        $('#e2a').val(e.e2a);
        $('#e2b').text(e.e2b);
        // calculate actual "paid at closing" based on "closing costs" and "down payment"
        e.e4c = e.e2c + e.e3c;
        e.e4b = makePercent(e.e4c,e.e1a);
        e.e4a = e.e4c;
        e.e4z = e.e4c;
        $('#e4a').val(e.e4a);
        $('#e4b').text(e.e4b);
        $('#e4z').val(e.e4z);
        slave_set('total');
      }
      // code chunk A end
      delete c.down;
      console.log('\tcookie: down applied');
    }
    else {
      e.e2a = '5%'; // Down payment
      e.e2b = parsePercent(e.e2a) * e.e1a; // Down payment alt
      e.e2c = e.e2b; // Down payment int
      e.e4c = e.e2c + e.e3c;
      e.e4b = makePercent(e.e4c,e.e1a);
      e.e4a = e.e4c;
      e.e4z = e.e4c;
      $('#e4a').val(e.e4a);
      $('#e4b').text(e.e4b);
      $('#e4z').val(e.e4z);
      slave_set('total');
    }
  // all others
    e.e5 = (e.e1a / 1000) * 3.5; // Yearly homeowners insurance
    e.e6 = (e.e1a / 1000) * 1.8; // Yearly flood insurance
    //e.e7 = Purchase month
    //e.e8 = Purchase year
    e.e9 = 30; // Loan term
    e.e10 = 3.875; // Yearly interest rate
    e.e11 = 1.15; // Yearly PMI rate
    e.e12 = 0; // Monthly HOA dues
    e.e13 = 0; // Extra monthly payment
    e.e14 = 8.3; // County millage rate
    e.e15 = 23.2; // City millage rate
    e.e18 = 40; // Assessment ratio
    e.e19a = 'Marietta, GA (city)'; // City
    e.e19z = 'Marietta, GA (city)'; // City
    e.e16 = 2; // Yearly appreciation rate
    e.e17 = 1275; // Monthly rent comparison
    $.each(c,function(k,v){
      if(isJsonString(v)){
        var p = JSON.parse(v);
        console.log('\t' + k + ': ' + v);
        e[p.id] = p.val;
        $('#' + p.id).val(p.val);
      }
    });
  refresh_inputs();
  //console.log('defaults() done');
};

change_to = function(val){
  var opposite;
  var number;
  var percent;
  if(isPercentage(val)){
    number = Math.round(parsePercent(val) * e.e1a);
    percent = val;
    opposite = number;
  }
  else {
    number = parseInt(val);
    percent = makePercent(val,e.e1a);
    opposite = percent;
  }
  //console.log(number + ', ' + percent);
  return {
    'value': val,
    'opposite': opposite,
    'number': number,
    'percent': percent
  };
};

changeDown = function(id,val){
  console.log('changeDown(' + id + ', ' + val + ')');
  var i = change_to(val);
  // if user defined total paid at closing...
    if(id == 'e4a'){
      e.e4a = i.value;
      e.e4b = i.opposite; $('#e4b').text(e.e4b);
      e.e4c = i.number;
      e.e4z = i.number; $('#e4z').val(e.e4z);
      e.e2c = e.e4c - e.e3c;
      e.e2a = makePercent(e.e2c,e.e1a); $('#e2a').val(e.e2a);
      e.e2b = e.e2c; $('#e2b').text(e.e2b);
      slave_set('down');
    }
    else if(id == 'e4z'){
      e.e4a = i.value; $('#e4a').val(e.e4a);
      e.e4b = i.opposite; $('#e4b').text(e.e4b);
      e.e4c = i.number;
      e.e4z = i.number;
      e.e2c = e.e4c - e.e3c;
      e.e2a = makePercent(e.e2c,e.e1a); $('#e2a').val(e.e2a);
      e.e2b = e.e2c; $('#e2b').text(e.e2b);
      slave_set('down');
    }
  // if user defined down payment...
    else if(id == 'e2a'){
      e.e2a = i.value;
      e.e2b = i.opposite; $('#e2b').text(e.e2b);
      e.e2c = i.number;
      e.e4c = e.e2c + e.e3c;
      e.e4a = e.e4c; $('#e4a').val(e.e4a);
      e.e4b = makePercent(e.e4c,e.e1a); $('#e4b').text(e.e4b);
      e.e4z = e.e4c; $('#e4z').val(e.e4z);
      slave_set('total');
    }
};

changeClosing = function(id,val){
  // so far, only handles %, not int
  console.log('changeClosing(' + id + ', ' + val + ')');
  var i = change_to(val);
  e.e3a = i.value;
  e.e3b = i.opposite; $('#e3b').text(e.e3b);
  e.e3c = i.number;
  if(slave == 'total'){
    e.e4c = e.e2c + e.e3c;
    e.e4a = e.e4c; $('#e4a').val(e.e4a);
    e.e4b = makePercent(e.e4a,e.e1a); $('#e4b').text(e.e4b);
    e.e4z = e.e4c; $('#e4z').val(e.e4z);
  }
  else {
    e.e2c = e.e4c - e.e3c;
    e.e2a = makePercent(e.e2c,e.e1a); $('#e2a').val(e.e2a);
    e.e2b = e.e2c; $('#e2b').text(e.e2b);
  }
};

changePrice = function(id,val){ // DONE
  console.log('changePrice(' + id + ', ' + val + ')');
  e.e1a = val;
  e.e1z = val;
  if(id == 'e1a') $('#e1z').val(val);
  else $('#e1a').val(val);

  //if(cookies.down && (cookies.down.id == 'e4a' || cookies.down.id == 'e4z')){ // if total at closing is the master input
  if(slave == 'down') { // if total at closing is the master input
    console.log('\tslave == down');
    // down
    if(isPercentage(e.e4a)){ // if total at closing is defined as %
      console.log('\ttotal at closing is percentage');
      e.e4b = Math.round(parsePercent(e.e4a) * e.e1a);
      e.e4c = e.e4b;
      $('#e4b').text(e.e4b);
    }
    else { // if total at closing is defined as #
      console.log('\ttotal at closing is number');
      e.e4b = makePercent(e.e4a,e.e1a);
      e.e4c = e.e4a;
      $('#e4b').text(e.e4b);
    }
    // closing
    if(isPercentage(e.e3a)){ // if closing costs is defined as %
      console.log('\tclosing costs is percentage');
      e.e3b = Math.round(parsePercent(e.e3a) * e.e1a);
      e.e3c = e.e3b;
      $('#e3b').text(e.e3b);
    }
    else { // if closing costs is defined as #
      console.log('\tclosing costs is number');
      e.e3b = makePercent(e.e3a,e.e1a);
      e.e3c = e.e3a;
      $('#e3b').text(e.e3b);
    }
    e.e2c = e.e4c - e.e3c;
    e.e2b = e.e2c;
    e.e2a = makePercent(e.e2c,e.e1a);
    $('#e2a').val(e.e2a);
    $('#e2b').text(e.e2b);
  }

  //else if((cookies.down && cookies.down.id == 'e2a') || !cookies.down){ // if down payment is the master input
  else { // if down payment is the master input
    console.log('\tslave == total');
    // down
    if(isPercentage(e.e2a)){ // if down payment is defined as %
      console.log('\tdown payment is percentage');
      e.e2b = Math.round(parsePercent(e.e2a) * e.e1a);
      e.e2c = e.e2b;
      $('#e2b').text(e.e2b);
    }
    else { // if down payment is defined as #
      console.log('\tdown payment is number');
      e.e2b = makePercent(e.e2a,e.e1a);
      e.e2c = e.e2a;
      $('#e2b').text(e.e2b);
    }
    // closing
    if(isPercentage(e.e3a)){ // if closing costs is defined as %
      console.log('\tclosing costs is percentage');
      e.e3b = Math.round(parsePercent(e.e3a) * e.e1a);
      e.e3c = e.e3b;
      $('#e3b').text(e.e3b);
    }
    else { // if closing costs is defined as #
      console.log('\tclosing costs is number');
      e.e3b = makePercent(e.e3a,e.e1a);
      e.e3c = e.e3a;
      $('#e3b').text(e.e3b);
    }
    e.e4c = parseInt(e.e2c) + parseInt(e.e3c);
    e.e4b = makePercent(e.e4c,e.e1a);
    e.e4a = e.e4c;
    e.e4z = e.e4c;
    $('#e4a').val(e.e4a);
    $('#e4b').text(e.e4b);
    $('#e4z').val(e.e4z);
  }
};

calculate = function(id,val){
  console.log('calculate()');
  if(id && val){
    // handle multi-direcional input changes
    if(id == 'e1a' || id == 'e1z'){
      changePrice(id,val);
    }
    else if(id == 'e2a' || id == 'e4a' || id == 'e4z'){
      changeDown(id,val);
    }
    else if(id == 'e3a'){
      changeClosing(id,val);
    }
    else {
      e[id] = val;
    }
  }

  u.u0 = e.e1a - e.e2c; // Loan amount
  u.u10 = (e.e10 / 12) / 100; // Monthly interest rate
  u.u11y = u.u0 * (e.e11 / 100); // Yearly PMI
  u.u11m = e.e2c / u.u0 < .2 ? Math.round(parseFloat(u.u11y / 12)) : 0; // Monthly PMI
  u.u12 = e.e12 * 12; // Yearly HOA dues
  u.u17 = e.e17 * 12; // Yearly rent
  u.u91 = Math.round(parseFloat(PMT(u.u10,e.e9 * 12,-u.u0))); // Monthly principal & interest
  u.u92 = Math.round(u.u11m + (e.e5 / 12) + (e.e6 / 12) + ((((e.e1a * (e.e18/100)) / 1000) * e.e14) / 12) + ((((e.e1a * (e.e18/100)) / 1000) * e.e15) / 12) + e.e12); // Monthly taxes, insurance, dues
  u.u93 = Math.round(parseFloat(u.u91) + parseFloat(e.e13)); // Monthly mortgage payment
  u.u94a = Math.round(parseFloat(u.u93) + parseFloat(u.u92) + parseFloat(e.e12)); // Total monthly payments
  u.u94z = u.u94a; // Total monthly payments
  u.u95 = Math.round(NPER(u.u10,-u.u93,u.u0)); // Number of payments
  u.u96a = Number.isInteger(u.u95 / 12) ? (u.u95 / 12) : (u.u95 / 12).toFixed(2); // Years to pay off
  u.u96z = u.u96a; // Years to pay off
  u.u97 = Number.isInteger(u.u95 * u.u93) ? (u.u95 * u.u93) : Math.round(u.u95 * u.u93); // Total mortgage payments
  u.u98 = Number.isInteger(u.u97 - u.u0) ? (u.u97 - u.u0) : Math.round(u.u97 - u.u0); // Total interest
  //refresh_inputs();
  refresh_outputs();
  auto_width_inputs();
};

refresh_inputs = function(){
  $('#e1a').val(e.e1a);
  $('#e1z').val(e.e1z);
  $('#e2a').val(e.e2a);
  $('#e2b').text(e.e2b);
  $('#e3a').val(e.e3a);
  $('#e3b').text(e.e3b);
  $('#e4a').val(e.e4a);
  $('#e4b').text(e.e4b);
  $('#e4z').val(e.e4z);
  $('#e5').val(e.e5);
  $('#e6').val(e.e6);
  $('#e9').val(e.e9);
  $('#e10').val(e.e10);
  $('#e11').val(e.e11);
  $('#e12').val(e.e12);
  $('#e13').val(e.e13);
  $('#e14').val(e.e14);
  $('#e15').val(e.e15);
  $('#e16').val(e.e16);
  $('#e17').val(e.e17);
  $('#e18').val(e.e18);
  //$('#e19a').val(e.e19a);
  //$('#e19z').val(e.e19z);
};

refresh_outputs = function(){
  $('#u0').val(u.u0);
  //$('#u10').val(u.u10);
  $('#u11m').val(u.u11m);
  //$('#u11y').val(u.u11y);
  $('#u12').val(u.u12);
  $('#u17').val(u.u17);
  $('#u91').val(u.u91);
  $('#u92').val(u.u92);
  $('#u93').val(u.u93);
  $('#u94a').val(u.u94a);
  $('#u94z').val(u.u94z);
  $('#u95').val(u.u95);
  $('#u96a').val(u.u96a);
  $('#u96z').val(u.u96z);
  $('#u97').val(u.u97);
  $('#u98').val(u.u98);
};

/*pre_fill = function(){
  // pre fill cookie groups
  if($('#i_price').val()) $('#m_price').val($('#i_price').val());
  else if($('#m_price').val()) $('#i_price').val($('#m_price').val());
  else {
    $('#i_price').val(300000);
    $('#m_price').val(300000);
  }

  if($('#m_closing_costs').val()){

  }
  else {
    var price = parseFloat($('#m_price').val(),10);
    var auto = price * .05;
    $('#m_closing_costs').val(auto)
  }

  if($('#m_down_payment').val()){

  }
  else {
    var price = parseFloat($('#m_price').val(),10);
    var auto = price * .05;
    $('#m_down_payment').val(auto)
  }

  if($('#i_paid_at_closing').val()){
    $('#m_down_payment').val($('#i_paid_at_closing').val() - $('#m_closing_costs').val());
  }
  else {
    var pac = parseFloat($('#m_closing_costs').val(),10) + parseFloat($('#m_down_payment').val(),10);
    $('#i_paid_at_closing').val(pac);
  }
};*/

/*calculate = function(){
  // read all editable inputs
  var price = parseFloat($('#m_price').val(),10);
  var down_payment = parseFloat($('#m_down_payment').val(),10);
  var closing_costs = parseFloat($('#m_closing_costs').val(),10); // default = home value * .04 (2-5%)
  var paid_at_closing = closing_costs + down_payment;
  var loan_term = parseFloat($('#loan_term').val(),10);
  var interest_rate_y = parseFloat($('#interest_rate_y').val(),10);
  var pmi_rate_y = parseFloat($('#pmi_rate_y').val(),10);
  var appreciation_rate_y = parseFloat($('#appreciation_rate_y').val(),10);
  var extra_payment_m = parseFloat($('#extra_payment_m').val(),10);
  var homeowners_insurance_y = parseFloat($('#homeowners_insurance_y').val(),10); // default = (home value / 1000) * 3.5 http://homeguides.sfgate.com/average-cost-homeowners-insurance-3020.html
  var flood_insurance_y = parseFloat($('#flood_insurance_y').val(),10); // default = (home value / 1000) * 1.8 (low to moderate risk) https://www.floodsmart.gov/floodsmart/pages/residential_coverage/policy_rates.jsp
  var millage_rate_county = parseFloat($('#millage_rate_county').val(),10); // In the majority of states, property value is assessed for property tax purposes every five to seven years. http://real-estate-law.freeadvice.com/real-estate-law/buy_sell_a_home/assessment-property-taxes.htm
  var millage_rate_city = parseFloat($('#millage_rate_city').val(),10);
  var hoa_m = parseFloat($('#hoa_m').val(),10);
  var rent_m = parseFloat($('#rent_m').val(),10);
  var purchase_y = $('#m_purchase_y').val();
  var purchase_m = $('#m_purchase_m').val();
  var date_start = new Date(purchase_y,purchase_m);

  // calculate all non-editable values
  var loan = Math.round(price-down_payment);
  var interest_rate_m = (interest_rate_y/12)/100; // monthly intrest rate
  var pi_m = Math.round(parseFloat(PMT(interest_rate_m,loan_term*12,-loan))); //+(parseFloat(PMT(interest_rate_m,loan_term*12,-loan)).toFixed(2));
  var mortgage_insurance_m = down_payment/loan < .2 ? Math.round(parseFloat((loan*(pmi_rate_y/100))/12)) : 0;
  var mortgage_payment_m = Math.round(pi_m+extra_payment_m);
  var number_payments = Math.round(NPER(interest_rate_m,-mortgage_payment_m,loan));
  var years_pay_off = Number.isInteger(number_payments/12) ? (number_payments/12) : (number_payments/12).toFixed(2);
  var mortgage_payments_t = Number.isInteger(number_payments*mortgage_payment_m) ? (number_payments*mortgage_payment_m) : Math.round(number_payments*mortgage_payment_m);
  var interest_t = Number.isInteger(mortgage_payments_t-loan) ? (mortgage_payments_t-loan) : Math.round(mortgage_payments_t-loan);
  var tax_insurance_dues_m = Math.round(mortgage_insurance_m+(homeowners_insurance_y/12)+(flood_insurance_y/12)+((((price*0.4)/1000)*millage_rate_county)/12)+((((price*0.4)/1000)*millage_rate_city)/12)+(hoa_m));
  var total_payments_m = Math.round(parseFloat(mortgage_payment_m)+parseFloat(tax_insurance_dues_m));
  var rent_y = rent_m*12;
  var hoa_y = hoa_m*12;

  // write valies to all non-editable fields
  $('#loan').val(loan);
  $('#total_payments_m').val(total_payments_m);
  $('#mortgage_payment_m').val(mortgage_payment_m);
  $('#pi_m').val(pi_m);
  $('#number_payments').val(number_payments);
  $('#years_pay_off').val(years_pay_off);
  $('#mortgage_payments_t').val(mortgage_payments_t);
  $('#interest_t').val(interest_t);
  $('#mortgage_insurance_m').val(mortgage_insurance_m);
  $('#tax_insurance_dues_m').val(tax_insurance_dues_m);
  $('#rent_y').val(rent_y);

  // write to insights
  //$('#mi-1').val(paid_at_closing);
  //$('#mi-2').val(price);
  $('#i_total_payments_m').val(total_payments_m);
  $('#i_years_pay_off').val(years_pay_off);

  // build table
  $('table').remove();
  var table = $('<table></table>');
  var thead = $('<thead><tr><th>Year</th><th>Date</th><th>Home value</th><th>Loan balance</th><th>Equity</th><th>Interest paid</th><th>P&amp;I</th><th>PMI</th><th>County tax</th><th>City tax</th><th>Yearly payments</th><th>Monthly payments</th><th>Total payments</th><th>Cost after sale</th><th>Cost of rent</th><th>Cost / equity</th><th>Avg yearly cost</th><th>Avg monthly cost</th></tr></thead>');
  var tbody = $('<tbody></tbody>');
  var trs = [];
  var fls = [];
  var date = [], value = [], balance = [], equity = [], interest = [], pi = [], pmi = [], county = [], city = [], payments_y = [],
    payments_m = [], payments_t = [], cost_sale = [], cost_rent = [], ratio = [], cost_avg_y = [], cost_avg_m = [];
    var rent_equity = [];
  var zero_line = [];
  // year 0
  date[0] = date_display(date_start);
  value[0] = price;
  balance[0] = loan;
  equity[0] = price - loan;
  interest[0] = 0;
  pi[0] = 0;
  pmi[0] = 0;
  county[0] = 0;
  city[0] = 0;
  payments_y[0] = 0;
  payments_m[0] = 0;
  payments_t[0] = down_payment + closing_costs;
  cost_sale[0] = payments_t[0] - equity[0];
  cost_rent[0] = 0;
  ratio[0] = Math.round((payments_t[0] / equity[0]) * 100) / 100;
  cost_avg_y[0] = 0;
  cost_avg_m[0] = 0;
    rent_equity[0] = payments_t[0] - cost_rent[0] - equity[0];
  zero_line[0] = 0;
  var tr = table_row([0,date[0],value[0],balance[0],equity[0],interest[0],pi[0],pmi[0],county[0],city[0],payments_y[0],payments_m[0],payments_t[0],cost_sale[0],cost_rent[0],ratio[0],cost_avg_y[0],cost_avg_m[0]]);
  var fl = '<div title="' + date[0] + '">0</div>';
  trs.push(tr);
  fls.push(fl);
  // years 1+
  var years = Math.ceil(parseFloat(years_pay_off));
  for(var year = 1; year <= years; year++){
    var last = year - 1;
    date_start.setFullYear(date_start.getFullYear() + 1);
    date[year] = date_display(date_start);
    value[year] = Math.round(value[last] * (1 + (appreciation_rate_y / 100)));
    balance[year] = Math.max(0, Math.round(-FV(interest_rate_m, year * 12, -mortgage_payment_m, loan)));
    equity[year] = value[year] - balance[year];
    // need to fix interest, p&i calculations to work correctly for final partial years
    //interest[year] = Math.round(balance[last] > 0 ? (year * 12 * mortgage_payment_m) - (loan - balance[year]) : interest[last]);
    //pi[year] = years_pay_off >= year ? Math.round(mortgage_payment_m * 12) : 0;
    if(year == years && years != years_pay_off){
      // The last year if it's a partial year
      //console.log('year ' + year + ': special');
      var remainder = 1 - (years - years_pay_off);
      interest[year] = Math.round(interest_t);
      pi[year] = Math.round(remainder * 12 * mortgage_payment_m);
    }
    else {
      // All years, except the final year if it's a partial year
      //console.log('year ' + year + ': regular');
      interest[year] = Math.round(year * 12 * mortgage_payment_m) - (loan - balance[year]);
      pi[year] = Math.round(mortgage_payment_m * 12);
    }
    pmi[year] = balance[year] > price * .8 ? Math.round(balance[year] * (pmi_rate_y/100)) : 0;
    county[year] = Math.round(((value[year] * .4) / 1000) * millage_rate_county);
    city[year] = Math.round(((value[year] * .4) / 1000) * millage_rate_city);
    payments_y[year] = pi[year] + pmi[year] + county[year] + city[year] + homeowners_insurance_y + flood_insurance_y + hoa_y;
    payments_m[year] = Math.round(payments_y[year] / 12);
    payments_t[year] = payments_t[last] + payments_y[year];
    cost_sale[year] = payments_t[year] - equity[year];
    cost_rent[year] = rent_y * year;
    ratio[year] = Math.round((payments_t[year] / equity[year]) * 100) / 100;
    cost_avg_y[year] = Math.round(cost_sale[year] / year);
    cost_avg_m[year] = Math.round(cost_avg_y[year] / 12);
      rent_equity[year] = payments_t[year] - cost_rent[year] - equity[year]; // relative_rent_equity
    tr = table_row([year,date[year],value[year],balance[year],equity[year],interest[year],pi[year],pmi[year],county[year],city[year],payments_y[year],payments_m[year],payments_t[year],cost_sale[year],cost_rent[year],ratio[year],cost_avg_y[year],cost_avg_m[year]]);
    fl = '<div title="' + date[year] + '">' + year + '</div>';
    trs.push(tr);
    fls.push(fl);
    zero_line.push(0);
  }
  //$('body').append(table.append(thead,tbody.html(trs)));
  $('#sparkline_dates').html(fls);

  // build graph
  // http://omnipotent.net/jquery.sparkline/#tooltips
  // http://omnipotent.net/jquery.sparkline/#s-about
  var range = [[0,1],value,balance,equity,interest,payments_t,rent_equity];
  var max_val = range.map(function(x){
    return Math.max.apply(null,x);
  });
  var min_val = range.map(function(x){
    return Math.min.apply(null,x);
  });
  max_val = Math.max.apply(null,max_val);
  min_val = Math.min.apply(null,min_val);
  var sl_width = 100 - (100/years); // make the sparkline width match the year labels
  $("#sparkline").css({ width: sl_width + '%'});
  $("#sparkline").sparkline(value,{
    chartRangeMax: max_val,
    chartRangeMin: min_val,
    fillColor: false,
    height: '360px',
    highlightSpotColor: 'rgb(255,0,0)',
    highlightLineColor: 'rgba(255,0,0,.3)',
    lineColor: 'rgb(255,0,0)',
    minSpotColor: false,
    maxSpotColor: false,
    spotColor: false,
    spotRadius: 3,
    tooltipPrefix: 'Home value: ',
    type: 'line',
    width: '100%'
  });
  if($('#cb-balance').is(':checked')){
    $("#sparkline").sparkline(balance,{
      chartRangeMax: max_val,
      chartRangeMin: min_val,
      composite: true,
      fillColor: false,
      highlightSpotColor: 'rgb(0,255,0)',
      highlightLineColor: false,
      lineColor: 'rgb(0,255,0)',
      minSpotColor: false,
      maxSpotColor: false,
      spotColor: false,
      spotRadius: 3,
      tooltipPrefix: 'Loan balance: ',
      type: 'line'
    });
  }
  $("#sparkline").sparkline(equity,{
    chartRangeMax: max_val,
    chartRangeMin: min_val,
    composite: true,
    fillColor: false,
    highlightSpotColor: 'rgb(0,0,255)',
    highlightLineColor: false,
    lineColor: 'rgb(0,0,255)',
    minSpotColor: false,
    maxSpotColor: false,
    spotColor: false,
    spotRadius: 3,
    tooltipPrefix: 'Equity: ',
    type: 'line'
  });
  $("#sparkline").sparkline(interest,{
    chartRangeMax: max_val,
    chartRangeMin: min_val,
    composite: true,
    fillColor: false,
    highlightSpotColor: 'rgb(150,50,150)',
    highlightLineColor: false,
    lineColor: 'rgb(150,50,150)',
    minSpotColor: false,
    maxSpotColor: false,
    spotColor: false,
    spotRadius: 3,
    tooltipPrefix: 'Interest paid: ',
    type: 'line'
  });
  if($('#cb-payments_t').is(':checked')){
    $("#sparkline").sparkline(payments_t,{
      chartRangeMax: max_val,
      chartRangeMin: min_val,
      composite: true,
      fillColor: false,
      highlightSpotColor: 'rgb(150,50,150)',
      highlightLineColor: false,
      lineColor: 'rgb(150,0,0)',
      minSpotColor: false,
      maxSpotColor: false,
      spotColor: false,
      spotRadius: 3,
      tooltipPrefix: 'Total payments: ',
      type: 'line'
    });
  }
  $("#sparkline").sparkline(zero_line,{
    chartRangeMax: max_val,
    chartRangeMin: min_val,
    composite: true,
    fillColor: false,
    highlightSpotColor: '#f00',
    highlightLineColor: false,
    lineColor: 'rgba(0,0,0,.1)',
    minSpotColor: false,
    maxSpotColor: false,
    spotColor: false,
    spotRadius: false,
    tooltipFormat: $.spformat('{{value}}','tooltip-class'),
    tooltipPrefix: false,
    type: 'line'
  });
  $("#sparkline").sparkline(cost_rent,{
    chartRangeMax: max_val,
    chartRangeMin: min_val,
    composite: true,
    fillColor: false,
    highlightSpotColor: 'rgb(150,150,150)',
    highlightLineColor: false,
    lineColor: 'rgb(150,150,150)',
    minSpotColor: false,
    maxSpotColor: false,
    spotColor: false,
    spotRadius: 3,
    tooltipPrefix: 'Cost of rent: ',
    type: 'line'
  });

  $("#sparkline").sparkline(rent_equity,{
    chartRangeMax: max_val,
    chartRangeMin: min_val,
    composite: true,
    fillColor: false,
    highlightSpotColor: 'rgb(150,150,150)',
    highlightLineColor: false,
    lineColor: 'rgb(150,150,150)',
    minSpotColor: false,
    maxSpotColor: false,
    spotColor: false,
    spotRadius: 3,
    tooltipPrefix: 'Equivalent rent equity: ',
    type: 'line'
  });
};*/
