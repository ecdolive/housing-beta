calculate = function(month,year,price,upfront,closing,down,term,interest,pmi,hoa,extra,hoi,flood,tax,appreciation,rent){
  var is_percent = function(x){
    return String(x).indexOf('%') > -1 ? true : false;
  };
  var make_percent = function(a,b){
    // return ((a / b) * 100).toFixed(1) + '%';
    return ((a / b) * 100).toFixed(1).replace('.0','') + '%';
  };
  var make_variants = function(target,display){
    var opposite, number, percent;
    if(is_percent(display)){
      number = Math.round(parse_percent(display) * _i.price.number);
      percent = display;
      opposite = number;
    }
    else {
      number = parseFloat(display);
      percent = make_percent(display, _i.price.number);
      opposite = percent;
    }
    target.display = display;
    target.number = number;
    target.percent = percent;
    target.opposite = opposite;
  };
  var NPER = function(rate,payment,present,future,type){
    // NPER means "number of periods" or "number of payments"
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
  var parse_percent = function(a){
    if(/%/i.test(a)){
      return (parseFloat(a)/100);
    }
  };
  var PMT = function(ir,np,pv,fv,type){
    // PMT means "payment" and calculates the periodic payment for a loan that has constant payments and a constant interest rate
    // args: interest rate (per period), number of payments, present value (principle/loan amount), future value, when payment is due (0: end of period, 1: beginning of period)
    // http://stackoverflow.com/questions/5294074/pmt-function-in-javascript
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
  var c = {};

  // INPUTS
  c.inputs = {};
  var _i = c.inputs;
  _i.month = { "display": month };
  _i.year = { "display": year };
  _i.price = {
    "display": price,
    "number": parseFloat(price)
  };
  if(upfront == null){
    _i.down = { "display": down };
    make_variants(_i.down, _i.down.display);
    _i.closing = { "display": closing };
    make_variants(_i.closing, _i.closing.display);
    _i.upfront = { "display": String(_i.down.number + _i.closing.number) };
    make_variants(_i.upfront, _i.upfront.display);
  }
  else if(down == null){
    _i.upfront = { "display": upfront };
    make_variants(_i.upfront, _i.upfront.display);
    _i.closing = { "display": closing };
    make_variants(_i.closing, _i.closing.display);
    _i.down = { "number": _i.upfront.number - _i.closing.number };
    // _i.down.display = make_percent(_i.down.number, _i.price.number);
    make_variants(_i.down, _i.down.number);
  }
  else if(closing == null){
    _i.upfront = { "display": upfront };
    make_variants(_i.upfront, _i.upfront.display);
    _i.down = { "display": down };
    make_variants(_i.down, _i.down.display);
    _i.closing = { "display": String(_i.upfront.number - _i.down.number) };
    make_variants(_i.closing, _i.closing.display);
  }
  // ...
  _i.term = {
    "display": term,
    "number": parseFloat(term)
  };
  _i.interest = {
    "display": interest,
    "percent": parse_percent(interest)
  };
  _i.pmi = {
    "display": pmi,
    "percent": parse_percent(pmi)
  };
  _i.hoa = {
    "display": hoa,
    "number": parseFloat(hoa)
  };
  _i.extra = {
    "display": extra,
    "number": parseFloat(extra)
  };
  if(hoi != null){
    _i.hoi = {
      "display": hoi,
      "number": parseFloat(hoi)
    };
  }
  else {
    _i.hoi = { "number": Math.round((_i.price.display / 1000) * 3.5) };
    _i.hoi.display = String(_i.hoi.number);
  }
  if(flood != null){
    _i.flood = {
      "display": flood,
      "number": parseFloat(flood)
    };
  }
  else {
    _i.flood = { "number": Math.round((_i.price.display / 1000) * 1.8) };
    _i.flood.display = String(_i.flood.number);
  }
  _i.tax = {
    "display": tax,
    "percent": parse_percent(tax)
  };
  _i.appreciation = {
    "display": appreciation,
    "percent": parse_percent(appreciation)
  };
  _i.rent = {
    "display": rent,
    "number": parseFloat(rent)
  };

  // OUTPUTS
  c.outputs = {};
  var _o = c.outputs;
  _o.loan = _i.price.number - _i.down.number; // Loan amount
  _o.monthly_interest_rate = _i.interest.percent / 12; // Monthly interest rate
  _o.monthly_principle_interest = parseFloat(PMT(_o.monthly_interest_rate, _i.term.number * 12, -_o.loan)); // Monthly principal & interest
  _o.monthly_principle_interest_with_extra = parseFloat(_o.monthly_principle_interest) + parseFloat(_i.extra.number); // Monthly mortgage payment
  _o.number_of_payments = NPER(_o.monthly_interest_rate, -_o.monthly_principle_interest_with_extra, _o.loan); // Number of payments
  _o.years_to_pay_off = Number.isInteger(_o.number_of_payments / 12) ? (_o.number_of_payments / 12) : parseFloat((_o.number_of_payments / 12).toFixed(2)); // Years to pay off
  _o.total_principle_interest = Number.isInteger(_o.number_of_payments * _o.monthly_principle_interest_with_extra) ? (_o.number_of_payments * _o.monthly_principle_interest_with_extra) : (_o.number_of_payments * _o.monthly_principle_interest_with_extra); // Total mortgage payments
  _o.total_interest = Number.isInteger(_o.total_principle_interest - _o.loan) ? (_o.total_principle_interest - _o.loan) : (_o.total_principle_interest - _o.loan); // Total interest

  // AMORITIZATION
  c.amoritization = {};
  var _a = c.amoritization;

  var date_start = new Date(_i.year.display,_i.month.display);

  // year 0 // TODO: cleanup this object structure
  _a[0] = {};
  _a[0].year = 0;
  _a[0].date = date_display(date_start);
  _a[0].value = _i.price.number;
  _a[0].balance = _o.loan;
  _a[0].equity = _i.price.number - _o.loan;
  _a[0].interest = {};
  _a[0].interest.total = 0;
  _a[0].interest.yearly = 0;
  _a[0].pi = {};
  _a[0].pi.total = 0;
  _a[0].pi.yearly = 0;
  _a[0].principle = {};
  _a[0].principle.total = 0;
  _a[0].principle.yearly = 0;
  _a[0].pmi = {};
  _a[0].pmi.total = 0;
  _a[0].pmi.yearly = 0;
  _a[0].hoi = {};
  _a[0].hoi.total = 0;
  _a[0].hoi.yearly = 0;
  _a[0].flood = {};
  _a[0].flood.total = 0;
  _a[0].flood.yearly = 0;
  _a[0].tax = {};
  _a[0].tax.total = 0;
  _a[0].tax.yearly = 0;
  _a[0].hoa = {};
  _a[0].hoa.total = 0;
  _a[0].hoa.yearly = 0;
  _a[0].payments = {};
  _a[0].payments.yearly = 0;
  _a[0].payments.monthly = 0;
  _a[0].payments.total = _i.upfront.number;
  _a[0].cost_sale = _a[0].payments.total - _a[0].equity;
  _a[0].cost_rent = 0;
  _a[0].ratio = Math.round((_a[0].payments.total / _a[0].equity) * 100) / 100;
  _a[0].cost_avg = {};
  _a[0].cost_avg.yearly = 0;
  _a[0].cost_avg.monthly = 0;
  _a[0].rent_equity = _a[0].payments.total - _a[0].cost_rent - _a[0].equity;

  // years 1+
  var final_year = Math.ceil(parseFloat(_o.years_to_pay_off));
  // var final_year = Math.ceil(parseFloat(_o.years_to_pay_off.toFixed(2)));
  for(var year = 1; year <= final_year; year++){
    _a[year] = {};
    _a[year].year = year;
    var last = year - 1;
    date_start.setFullYear(date_start.getFullYear() + 1);
    _a[year].date = date_display(date_start);
    _a[year].value = Math.round(_a[last].value * (1 + (_i.appreciation.percent))); // TODO: may need to adjust
    _a[year].balance = Math.max(0, Math.round(-FV(_o.monthly_interest_rate, year * 12, -_o.monthly_principle_interest_with_extra, _o.loan)));
    _a[year].equity = _a[year].value - _a[year].balance;
    // need to fix interest, p&i calculations to work correctly for final partial years
    //interest[year] = Math.round(balance[last] > 0 ? (year * 12 * _o.monthly_principle_interest_with_extra) - (_o.loan - balance[year]) : interest[last]);
    //pi[year] = _o.years_to_pay_off >= year ? Math.round(_o.monthly_principle_interest_with_extra * 12) : 0;
    _a[year].interest = {};
    _a[year].pi = {};
    if(year == final_year && final_year != _o.years_to_pay_off){
      // The last year if it's a partial year
      //console.log('year ' + year + ': special');
      var remainder = 1 - (final_year - _o.years_to_pay_off); // console.log('remainder: ' + remainder + '; remainder months: ' + (remainder * 12));
      _a[year].interest.total = Math.round(_o.total_interest);
      _a[year].pi.yearly = Math.round(remainder * 12 * _o.monthly_principle_interest_with_extra);
    }
    else {
      // All years, except the final year if it's a partial year
      //console.log('year ' + year + ': regular');
      _a[year].interest.total = Math.round(year * 12 * _o.monthly_principle_interest_with_extra) - (_o.loan - _a[year].balance);
      _a[year].pi.yearly = Math.round(_o.monthly_principle_interest_with_extra * 12);
      _a[year].pi.monthly = _a[year].pi.yearly / 12;
    }
    _a[year].pi.total = Math.round(_a[last].pi.total + _a[year].pi.yearly);
    _a[year].interest.yearly = Math.round(_a[year].interest.total - _a[last].interest.total);
    _a[year].interest.monthly = _a[year].interest.yearly / 12;
    _a[year].principle = {};
    _a[year].principle.total = Math.round((_a[year].pi.yearly * year) - _a[year].interest.total);
    _a[year].principle.yearly = Math.round(_a[year].principle.total - _a[last].principle.total);
    _a[year].principle.monthly = _a[year].principle.yearly / 12;
    // _a[year].pmi_y = _a[year].balance > price * .8 ? Math.round(_a[year].balance * _i.pmi.percent) : 0; // pmi calculated against loan balance
    _a[year].pmi = {};
    _a[year].pmi.yearly = _a[year].balance > price * .8 ? Math.round(_o.loan * _i.pmi.percent) : 0; // pmi calculated against original loan amount
    _a[year].pmi.total = _a[last].pmi.total + _a[year].pmi.yearly;
    _a[year].pmi.monthly = _a[year].pmi.yearly / 12;
    _a[year].hoi = {};
    _a[year].hoi.yearly = _i.hoi.number;
    _a[year].hoi.total = _a[last].hoi.total + _a[year].hoi.yearly;
    _a[year].hoi.monthly = _a[year].hoi.yearly / 12;
    _a[year].flood = {};
    _a[year].flood.yearly = _i.flood.number;
    _a[year].flood.total = _a[last].flood.total + _a[year].flood.yearly;
    _a[year].flood.monthly = _a[year].flood.yearly / 12;
    _a[year].tax = {};
    _a[year].tax.yearly = Math.round(_a[year].value * _i.tax.percent); // tax calculated against actual value each year (not last tax assessment)
    _a[year].tax.total = Math.round(_a[year].tax.yearly + _a[last].tax.total);
    _a[year].tax.monthly = _a[year].tax.yearly / 12;
    _a[year].hoa = {};
    _a[year].hoa.monthly = _i.hoa.number;
    _a[year].hoa.yearly = _a[year].hoa.monthly * 12;
    _a[year].hoa.total = _a[last].hoa.total + _a[year].hoa.yearly;
    _a[year].payments = {};
    _a[year].payments.yearly = _a[year].pi.yearly + _a[year].pmi.yearly + _a[year].tax.yearly + _a[year].hoi.yearly + _a[year].flood.yearly + _a[year].hoa.yearly;
    _a[year].payments.monthly = Math.round(_a[year].payments.yearly / 12);
    _a[year].payments.total = _a[last].payments.total + _a[year].payments.yearly;
    _a[year].cost_sale = _a[year].payments.total - _a[year].equity;
    _a[year].cost_rent = _i.rent.number * 12 * year;
    _a[year].ratio = Math.round((_a[year].payments.total / _a[year].equity) * 100) / 100;
    _a[year].cost_avg = {};
    _a[year].cost_avg.yearly = Math.round(_a[year].cost_sale / year);
    _a[year].cost_avg.monthly = Math.round(_a[year].cost_avg.yearly / 12);
    _a[year].rent_equity = _a[year].payments.total - _a[year].cost_rent - _a[year].equity; // relative_rent_equity
  }
  c.first = {};
  c.first = _a[1];
  c.final = {};
  c.final = _a[final_year];

  return c;
}
