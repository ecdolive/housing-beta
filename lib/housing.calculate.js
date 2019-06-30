calculate = function(){
  debug.log('\tcalculate()');
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

  // INPUTS
  var _i = values.inputs;
  _i.price.number = parseFloat(_i.price.display);
  make_variants(_i.down, _i.down.display);
  make_variants(_i.closing, _i.closing.display);
  _i.upfront = {
    "display": String(_i.down.number + _i.closing.number),
    "number": _i.down.number + _i.closing.number,
    "percent": make_percent(parseFloat(_i.down.number + _i.closing.number), _i.price.number)
  };
  // make_variants(_i.upfront, _i.upfront.display);
  _i.term.number = parseFloat(_i.term.display);
  _i.interest.percent = parse_percent(_i.interest.display);
  _i.pmi.percent = parse_percent(_i.pmi.display);
  _i.hoa.number = parseFloat(_i.hoa.display);
  _i.extra.number = parseFloat(_i.extra.display);
  if(_i.hoi.display != null){
    _i.hoi.number = parseFloat(_i.hoi.display);
  }
  else {
    _i.hoi = { "number": Math.round((_i.price.display / 1000) * 3.5) };
    _i.hoi.display = String(_i.hoi.number);
  }
  if(_i.flood.display != null){
    _i.flood.number = parseFloat(_i.flood.display);
  }
  else {
    _i.flood = { "number": Math.round((_i.price.display / 1000) * 1.8) };
    _i.flood.display = String(_i.flood.number);
  }
  _i.tax.percent = parse_percent(_i.tax.display);
  _i.appreciation.percent = parse_percent(_i.appreciation.display);
  _i.rent.number = parseFloat(_i.rent.display);

  // OUTPUTS
  values.outputs = {};
  var _o = values.outputs;
  _o.loan = _i.price.number - _i.down.number; // Loan amount
  _o.monthly_interest_rate = _i.interest.percent / 12; // Monthly interest rate
  _o.monthly_nominal_appreciation = 12 * (Math.pow(1 + _i.appreciation.percent, 1 / 12) - 1); // Monthly nominal appreciation rate
  _o.monthly_principle_interest = parseFloat(PMT(_o.monthly_interest_rate, _i.term.number * 12, -_o.loan)); // Monthly principal & interest
  _o.monthly_principle_interest_with_extra = parseFloat(_o.monthly_principle_interest) + parseFloat(_i.extra.number); // Monthly mortgage payment
  _o.number_of_payments = NPER(_o.monthly_interest_rate, -_o.monthly_principle_interest_with_extra, _o.loan); // Number of payments
  _o.years_to_pay_off = Number.isInteger(_o.number_of_payments / 12) ? (_o.number_of_payments / 12) : parseFloat((_o.number_of_payments / 12).toFixed(2)); // Years to pay off
  _o.total_principle_interest = Number.isInteger(_o.number_of_payments * _o.monthly_principle_interest_with_extra) ? (_o.number_of_payments * _o.monthly_principle_interest_with_extra) : (_o.number_of_payments * _o.monthly_principle_interest_with_extra); // Total mortgage payments
  _o.total_interest = Number.isInteger(_o.total_principle_interest - _o.loan) ? (_o.total_principle_interest - _o.loan) : (_o.total_principle_interest - _o.loan); // Total interest

  // AMORTIZATION
  values.amortization = {};
  var _a = values.amortization;
  var date_start = new Date(_i.year.display,_i.month.display);

  // year 0
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
  _a[0].unequitable_costs = _a[0].payments.total - _a[0].equity;
  _a[0].cost_rent = 0;
  _a[0].ratio = Math.round((_a[0].payments.total / _a[0].equity) * 100) / 100;
  _a[0].cost_avg = {};
  _a[0].cost_avg.yearly = 0;
  _a[0].cost_avg.monthly = 0;
  _a[0].rent_equity = _a[0].payments.total - _a[0].cost_rent - _a[0].equity;

  // years 1+
  var final_year = Math.ceil(parseFloat(_o.years_to_pay_off));
  for(var year = 1; year <= final_year; year++){
    _a[year] = {};
    _a[year].year = year;
    var last = year - 1;
    date_start.setFullYear(date_start.getFullYear() + 1);
    _a[year].date = date_display(date_start);
    _a[year].value = Math.round(_a[last].value * (1 + (_i.appreciation.percent))); // TODO: may need to adjust
    _a[year].balance = Math.max(0, Math.round(-FV(_o.monthly_interest_rate, year * 12, -_o.monthly_principle_interest_with_extra, _o.loan)));
    _a[year].equity = _a[year].value - _a[year].balance;
    _a[year].interest = {};
    _a[year].pi = {};
    // FIXME: need to fix interest, p&i calculations to work correctly for final partial year
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
    _a[year].pmi = {};
    // _a[year].pmi.yearly = _a[year].balance > values.inputs.price.number * .8 ? Math.round(_a[year].balance * _i.pmi.percent) : 0; // pmi calculated against loan balance
    _a[year].pmi.yearly = _a[year].balance > values.inputs.price.number * .8 ? Math.round(_o.loan * _i.pmi.percent) : 0; // pmi calculated against original loan amount
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
    _a[year].unequitable_costs = _a[year].payments.total - _a[year].equity;
    _a[year].cost_rent = _i.rent.number * 12 * year;
    _a[year].ratio = Math.round((_a[year].payments.total / _a[year].equity) * 100) / 100;
    _a[year].cost_avg = {};
    _a[year].cost_avg.yearly = Math.round(_a[year].unequitable_costs / year);
    _a[year].cost_avg.monthly = Math.round(_a[year].cost_avg.yearly / 12);
    _a[year].rent_equity = _a[year].payments.total - _a[year].cost_rent - _a[year].equity; // relative_rent_equity
  }
  values.first = _a[1];
  values.final = _a[final_year];


  // MONTHLY AMORTIZATION
  values.monthly_amortization = {};
  var _ma = values.monthly_amortization;
  var date_start = new Date(_i.year.display,_i.month.display);

  // month 0
  _ma[0] = {};
  _ma[0].month = 0;
  _ma[0].date = date_display(date_start);
  _ma[0].value = _i.price.number;
  _ma[0].balance = _o.loan;
  _ma[0].equity = _i.price.number - _o.loan;
  _ma[0].interest = {};
  _ma[0].interest.total = 0;
  _ma[0].interest.monthly = 0;
  _ma[0].extra = {};
  // _ma[0].extra.monthly = $('#extra-payment-' + month).val();
  // _ma[0].extra.total = _ma[month].extra.monthly;
    _ma[0].extra.monthly = 0;
    _ma[0].extra.total = 0;
  _ma[0].pi = {};
  _ma[0].pi.total = 0;
  _ma[0].pi.monthly = 0;
  _ma[0].principle = {};
  _ma[0].principle.total = 0;
  _ma[0].principle.monthly = 0;
  _ma[0].pmi = {};
  _ma[0].pmi.total = 0;
  _ma[0].pmi.yearly = 0;
  _ma[0].hoi = {};
  _ma[0].hoi.total = 0;
  _ma[0].hoi.yearly = 0;
  _ma[0].flood = {};
  _ma[0].flood.total = 0;
  _ma[0].flood.yearly = 0;
  _ma[0].tax = {};
  _ma[0].tax.total = 0;
  _ma[0].tax.monthly = 0;
  _ma[0].hoa = {};
  _ma[0].hoa.total = 0;
  _ma[0].hoa.monthly = 0;
  _ma[0].payments = {};
  _ma[0].payments.monthly = 0;
  _ma[0].payments.total = _i.upfront.number;
  _ma[0].unequitable_costs = _ma[0].payments.total - _ma[0].equity;
  _ma[0].cost_rent = 0;
  _ma[0].ratio = Math.round((_ma[0].payments.total / _ma[0].equity) * 100) / 100;
  _ma[0].cost_avg = {};
  _ma[0].cost_avg.monthly = 0;
  _ma[0].rent_equity = _ma[0].payments.total - _ma[0].cost_rent - _ma[0].equity;

  // months 1+
  var final_month = Math.ceil(parseFloat(_o.years_to_pay_off * 12));
  for(var month = 1; month <= final_month; month++){
    _ma[month] = {};
    _ma[month].month = month;
    var last = month - 1;
    date_start.setMonth(date_start.getMonth() + 1);
    _ma[month].date = date_display(date_start);
    // TODO: long term: cookie the amortization input fields/values
    // TODO: look for cookie, then input values, then global input value for each monthly amortization option // $('#monthly-appreciation-' + month).value() || _o.monthly_nominal_appreciation
    _ma[month].value = _ma[last].value + (_ma[last].value * (_o.monthly_nominal_appreciation) / 12);
    _ma[month].extra = {};
    _ma[month].extra.monthly = parseFloat($('#extra-payment-' + month).val());
    _ma[month].extra.total = _ma[last].extra.total + _ma[month].extra.monthly;
    var monthly_principle_interest_with_extra = _o.monthly_principle_interest + _ma[month].extra.monthly;
    _ma[month].interest = {};
    _ma[month].interest.monthly = _ma[last].balance * _o.monthly_interest_rate;
    _ma[month].principle = {};
    _ma[month].principle.monthly = _o.monthly_principle_interest - _ma[month].interest.monthly;
    _ma[month].balance = _ma[last].balance - _ma[month].principle.monthly - _ma[month].extra.monthly;
    _ma[month].equity = _ma[month].value - _ma[month].balance;
    _ma[month].pi = {};
    if(month == final_month && final_month != _o.years_to_pay_off * 12){
      // The last month if it's a partial month
      // console.log('month ' + month + ': special');
      // FIXME: need to fix interest, p&i calculations to work correctly for final partial month
      var remainder = 1 - (final_month - (_o.years_to_pay_off * 12)); console.log('remainder: ' + remainder + '; remainder months: ' + (remainder * 12));// monthly remainder, i.e. days as decimal // console.log('remainder: ' + remainder + '; remainder months: ' + (remainder * 12));
      _ma[month].interest.total = _o.total_interest; // FIXME: this needs to be monthly amoritized !!!!!!!!!!
      _ma[month].pi.monthly = remainder * monthly_principle_interest_with_extra;
    }
    else {
      // All months, except the final month if it's a partial month
      //console.log('month ' + month + ': regular');
      _ma[month].interest.total = _ma[last].interest.total + _ma[month].interest.monthly;
      _ma[month].pi.monthly = monthly_principle_interest_with_extra;
    }
    _ma[month].pi.total = _ma[last].pi.total + _ma[month].pi.monthly;
    // _ma[month].interest.monthly = _ma[month].interest.total - _ma[last].interest.total;
    _ma[month].principle.total = _ma[month].pi.monthly * month - _ma[month].interest.total;
    // _ma[month].principle.monthly = _ma[month].principle.total - _ma[last].principle.total;
    _ma[month].pmi = {};
    _ma[month].pmi.yearly = _ma[month].balance > values.inputs.price.number * .8 ? Math.round(_o.loan * _i.pmi.percent) : 0; // pmi calculated against original loan amount
    _ma[month].pmi.monthly = _ma[month].pmi.yearly / 12;
    _ma[month].pmi.total = _ma[last].pmi.total + _ma[month].pmi.monthly;
    _ma[month].hoi = {};
    _ma[month].hoi.yearly = _i.hoi.number;
    _ma[month].hoi.monthly = _ma[month].hoi.yearly / 12;
    _ma[month].hoi.total = _ma[last].hoi.total + _ma[month].hoi.monthly;
    _ma[month].flood = {};
    _ma[month].flood.yearly = _i.flood.number;
    _ma[month].flood.monthly = _ma[month].flood.yearly / 12;
    _ma[month].flood.total = _ma[last].flood.total + _ma[month].flood.monthly;
    _ma[month].tax = {};
    _ma[month].tax.monthly = _ma[month].value * _i.tax.percent / 12; // tax calculated against actual value each month (not last tax assessment)
    _ma[month].tax.total = _ma[month].tax.monthly + _ma[last].tax.total;
    _ma[month].hoa = {};
    _ma[month].hoa.monthly = _i.hoa.number;
    _ma[month].hoa.total = _ma[last].hoa.total + _ma[month].hoa.monthly;
    _ma[month].payments = {};
    _ma[month].payments.monthly = _ma[month].pi.monthly + _ma[month].pmi.monthly + _ma[month].tax.monthly + _ma[month].hoi.monthly + _ma[month].flood.monthly + _ma[month].hoa.monthly;
    _ma[month].payments.total = _ma[last].payments.total + _ma[month].payments.monthly;
    _ma[month].unequitable_costs = _ma[month].payments.total - _ma[month].equity;
    _ma[month].cost_rent = _i.rent.number * month;
    _ma[month].ratio = (_ma[month].payments.total / _ma[month].equity) * 100 / 100;
    _ma[month].cost_avg = {};
    _ma[month].cost_avg.monthly = _ma[month].unequitable_costs / month;
    _ma[month].rent_equity = _ma[month].payments.total - _ma[month].cost_rent - _ma[month].equity; // relative_rent_equity
  }
}
