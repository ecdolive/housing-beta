/*
TODO: need reset to default option for editable inputs and selects
TODO: determine what is changeable when location is selected
*/
calc_flood = function(){
  return Math.round((values.price.display / 1000) * 1.8)
};
calc_hoi = function(){
  return Math.round((values.price.display / 1000) * 3.5);
};
calculate = function(id,val){
  if(id && val){
    if(id == 'e7'){
      edit_month(val);
    }
    else if(id == 'e8'){
      edit_year(val);
    }
    // interdependent and multi-direcional input changes
    else if(id == 'e1a' || id == 'e1z'){
      edit_price(val,id);
    }
    else if(id == 'e4a' || id == 'e4z'){
      edit_upfront(val,id);
    }
    else if(id == 'e3a'){
      edit_closing(val,id);
    }
    else if(id == 'e2a'){
      edit_down(val,id);
    }
    // end interdependent and multi-direcional input changes
    else if(id == 'e9'){
      edit_term(val);
    }
    else if(id == 'e10'){
      edit_interest(val);
    }
    else if(id == 'e11'){
      edit_pmi(val);
    }
    else if(id == 'e12'){
      edit_hoa(val);
    }
    else if(id == 'e13'){
      edit_extra(val);
    }
    else if(id == 'e5'){
      edit_hoi(val);
    }
    else if(id == 'e6'){
      edit_flood(val);
    }
    else if(id == 'e14'){
      edit_tax(val);
    }
    else if(id == 'e16'){
      edit_appreciation(val);
    }
    else if(id == 'e17'){
      edit_rent(val);
    }
  }
  // console.log('calculate()');
  u.u0 = values.price.number - values.down.number; // Loan amount
  u.u10 = values.interest.percent / 12; // Monthly interest rate
  u.u11y = u.u0 * values.pmi.percent; // Yearly PMI
  u.u11m = values.down.number / u.u0 < .2 ? Math.round(parseFloat(u.u11y / 12)) : 0; // Monthly PMI
  u.u12 = values.hoa.number * 12; // Yearly HOA dues
  u.u17 = values.rent.number * 12; // Yearly rent
  u.u91 = Math.round(parseFloat(PMT(u.u10,values.term.number * 12,-u.u0))); // Monthly principal & interest
  var tax_monthly = (values.price.number * values.tax.percent) / 12;
  u.u92 = Math.round(tax_monthly + u.u11m + (values.hoi.number / 12) + (values.flood.number / 12) + values.hoa.number); // Monthly taxes, insurance, dues
  u.u93 = Math.round(parseFloat(u.u91) + parseFloat(values.extra.number)); // Monthly mortgage payment
  u.u94a = Math.round(parseFloat(u.u93) + parseFloat(u.u92) + parseFloat(values.hoa.number)); // Total monthly payments
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
edit_location = function(x){
  //$('#locations > li[data-value="' + x + '"]').addClass('selected');
  var y = $('#locations > li[data-value="' + x + '"]');
  location_select(y);
};
edit_month = function(d){
  values.month.display = d;
  $('#e7').val(d);
}
edit_year = function(d){
  values.year.display = d;
  $('#e8').val(d);
}
edit_price = function(d,x){
  values.price.display = parseFloat(d);
  values.price.number = values.price.display;
  if(x != 'e1a') $('#e1a').val(values.price.display);
  if(x != 'e1z') $('#e1z').val(values.price.number);
  if(x){
    edit_closing(values.closing.display);
    if(master == 'upfront') edit_upfront(values.upfront.display);
    else edit_down(values.down.display);
    if(!values.hoi.saved){
      values.hoi.display = calc_hoi(); // Yearly homeowners insurance
      values.hoi.number = values.hoi.display;
      $('#e5').val(values.hoi.display);
    }
    if(!values.flood.saved){
      values.flood.display = calc_flood(); // Yearly flood insurance
      values.flood.number = values.flood.display;
      $('#e6').val(values.flood.display);
    }
  }
};
edit_closing = function(d,x){
  make_variants(values.closing, d);
  if(x != 'e3a') $('#e3a').val(values.closing.display);
  $('#e3b').text(values.closing.opposite);
  if(master == 'upfront') update_down();
  else update_upfront();
};
edit_upfront = function(d,x){
  Cookies.remove('down'); // remove cookie, but leave value for calculate()
  master_set('upfront');
  make_variants(values.upfront, d);
  if(x != 'e4a') $('#e4a').val(values.upfront.display);
  $('#e4b').text(values.upfront.opposite);
  if(x != 'e4z') $('#e4z').val(values.upfront.number);
  update_down();
};
edit_down = function(d,x){
  Cookies.remove('upfront'); // remove cookie, but leave value for calculate()
  master_set('down');
  make_variants(values.down, d);
  if(x != 'e2a') $('#e2a').val(values.down.display);
  $('#e2b').text(values.down.opposite);
  update_upfront();
};
edit_term = function(d,x){
  values.term.display = d;
  values.term.number = parseFloat(d);
  if(x) $('#e9').val(d);
}
edit_interest = function(d,x){
  values.interest.display = d;
  values.interest.percent = parsePercent(d);
  if(x) $('#e10').val(d);
}
edit_pmi = function(d,x){
  values.pmi.display = d;
  values.pmi.percent = parsePercent(d);
  if(x) $('#e11').val(d);
}
edit_hoa = function(d,x){
  values.hoa.display = d;
  values.hoa.number = parseFloat(d);
  if(x) $('#e12').val(d);
}
edit_extra = function(d,x){
  values.extra.display = d;
  values.extra.number = parseFloat(d);
  if(x) $('#e13').val(d);
}
edit_hoi = function(d,x){
  values.hoi.display = d;
  values.hoi.number = parseFloat(d);
  if(x) $('#e5').val(d);
}
edit_flood = function(d,x){
  values.flood.display = d;
  values.flood.number = parseFloat(d);
  if(x) $('#e6').val(d);
}
edit_tax = function(d,x){
  values.tax.display = d;
  values.tax.percent = parsePercent(d);
  if(x) $('#e14').val(d);
}
edit_appreciation = function(d,x){
  values.appreciation.display = d;
  values.appreciation.percent = parsePercent(d);
  if(x) $('#e16').val(d);
}
edit_rent = function(d,x){
  values.rent.display = d;
  values.rent.number = parseFloat(d);
  if(x) $('#e17').val(d);
}
inputs_fill = function(){
  // console.log('inputs_fill()');
  // set all default values
  values.location = { "default": "custom" };
  values.month = { "default": null };
  values.year = { "default": null };
  values.price = { "default": 250000 };
  values.upfront = { "default": null };
  values.closing = { "default": "5%" };
  values.down = { "default": "3%" };
  values.term = { "default": 30 };
  values.interest = { "default": "3.875%" };
  values.pmi = { "default": "1.15%" };
  values.hoa = { "default": 0 };
  values.extra = { "default": 0 };
  values.hoi = { "default": null };
  values.flood = { "default": null };
  values.tax = { "default": "0.87%" };
  values.appreciation = { "default": "2%" };
  values.rent = { "default": 1275 };
  // set all saved values, from cookies
  $.each(cookies,function(i,v){
    if(!isAnalyticsCookie(i) && !isVersionCookie(i)){ // ignore analytics and version cookies
      // console.log('values.'+i+'.saved = '+v+';');
      values[i].saved = v;
    }
  });
  // set all location defined values
  var x = values.location.saved || values.location.default;
  $.each(locs[x],function(i,v){
    if(i != 'name')
      values[i].location = v;
  });
  // set all display values, which ultimately is what gets calculated
  values.location.display = values.location.saved || values.location.location || values.location.default; // Location
  values.price.display = values.price.saved || values.price.location || values.price.default; // Purchase price
  values.upfront.display = values.upfront.saved || values.upfront.location || values.upfront.default; // Total at closing
  values.down.display = values.down.saved || values.down.location || values.down.default; // Down payment
  if(values.upfront.display){
    // console.log('\tupfront: ' + values.upfront.display + "; master_set('upfront')");
    master_set('upfront');
  }
  else {
    // console.log("\tupfront: null; master_set('down')");
    master_set('down');
  }
  values.closing.display = values.closing.saved || values.closing.location || values.closing.default; // Closing costs
  values.tax.display = values.tax.saved || values.tax.location || values.tax.default; // Effective tax rate
  values.hoi.display = values.hoi.saved || values.hoi.location || calc_hoi(); // Yearly homeowners insurance
  values.flood.display = values.flood.saved || values.flood.location || calc_flood(); // Yearly flood insurance
  values.month.display = values.month.saved || values.month.location || $('#e7').val(); // Purchase month
  values.year.display = values.year.saved || values.year.location || $('#e8').val(); // Purchase year
  values.term.display = values.term.saved || values.term.location || values.term.default; // Loan term
  values.interest.display = values.interest.saved || values.interest.location || values.interest.default; // Yearly interest rate
  values.pmi.display = values.pmi.saved || values.pmi.location || values.pmi.default; // Yearly PMI rate
  values.hoa.display = values.hoa.saved || values.hoa.location || values.hoa.default; // Monthly HOA dues
  values.extra.display = values.extra.saved || values.extra.location || values.extra.default; // Extra monthly payment
  values.appreciation.display = values.appreciation.saved || values.appreciation.location || values.appreciation.default; // Yearly appreciation rate
  values.rent.display = values.rent.saved || values.rent.location || values.rent.default; // Monthly rent comparison
  edit_location(values.location.display);
  edit_month(values.month.display);
  edit_year(values.year.display);
  edit_price(values.price.display);
  if(master == 'upfront') edit_upfront(values.upfront.display);
  else edit_down(values.down.display);
  edit_closing(values.closing.display);
  edit_term(values.term.display,true);
  edit_interest(values.interest.display,true);
  edit_pmi(values.pmi.display,true);
  edit_hoa(values.hoa.display,true);
  edit_extra(values.extra.display,true);
  edit_hoi(values.hoi.display,true);
  edit_flood(values.flood.display,true);
  edit_tax(values.tax.display,true);
  edit_appreciation(values.appreciation.display,true);
  edit_rent(values.rent.display,true);
};
make_variants = function(o,v){
  var opposite, number, percent;
  if(isPercentage(v)){
    number = Math.round(parsePercent(v) * values.price.number);
    percent = v;
    opposite = number;
  }
  else {
    number = parseFloat(v);
    percent = makePercent(v,values.price.number);
    opposite = percent;
  }
  o.display = v;
  o.number = number;
  o.percent = percent;
  o.opposite = opposite;
  // console.log('\tmake_variants('+o.constructor.name+','+v+')');
  // console.log('\t\tdisplay: '+v+', number: '+number+', percent: '+percent+', opposite: '+opposite);
};
refresh_inputs = function(){
  $('#locations > li[data-value="' + values.location.display + '"]').addClass('selected');
  $('#e1a').val(values.price.display);
  $('#e1z').val(values.price.number);
  $('#e2a').val(values.down.display);
  $('#e2b').text(values.down.opposite);
  $('#e3a').val(values.closing.display);
  $('#e3b').text(values.closing.opposite);
  $('#e4a').val(values.upfront.display);
  $('#e4b').text(values.upfront.opposite);
  $('#e4z').val(values.upfront.number);
  $('#e5').val(values.hoi.display);
  $('#e6').val(values.flood.display);
  $('#e7').val(values.month.display);
  $('#e8').val(values.year.display);
  $('#e9').val(values.term.display);
  $('#e10').val(values.interest.display);
  $('#e11').val(values.pmi.display);
  $('#e12').val(values.hoa.display);
  $('#e13').val(values.extra.display);
  $('#e14').val(values.tax.display);
  $('#e16').val(values.appreciation.display);
  $('#e17').val(values.rent.display);
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
update_down = function(){
  values.down.number = values.upfront.number - values.closing.number;
  values.down.display = makePercent(values.down.number, values.price.number);
  make_variants(values.down, values.down.number);
  $('#e2a').val(values.down.display);
  $('#e2b').text(values.down.opposite);
};
update_upfront = function(){
  values.upfront.display = values.down.number + values.closing.number;
  make_variants(values.upfront, values.upfront.display);
  $('#e4a').val(values.upfront.display);
  $('#e4b').text(values.upfront.opposite);
  $('#e4z').val(values.upfront.number);
};

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
