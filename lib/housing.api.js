function Api(){}
Api.prototype.calculate = function(month,year,price,upfront,closing,down,term,interest,pmi,hoa,extra,hoi,flood,tax,appreciation,rent){
  // debug.log('api_calculate(month='+month+',year='+year+',price='+price+',upfront='+upfront+',closing='+closing+',down='+down+',term='+term+',interest='+interest+',pmi='+pmi+',hoa='+hoa+',extra='+extra+',hoi='+hoi+',flood='+flood+',tax='+tax+',appreciation='+appreciation+',rent='+rent+')');
  var FV = function(rate,nper,pmt,pv,type){
    type || (type = 0);
    var pow = Math.pow(1 + rate, nper), fv;
    if(rate){
      fv = (pmt*(1+rate*type)*(1-pow)/rate)-pv*pow;
    }
    else {
      fv = -1 * (pv + pmt * nper);
    }
    return fv.toFixed(2);
  }
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
      number = Math.round(parse_percent(display) * c.price.number);
      percent = display;
      opposite = number;
    }
    else {
      number = parseFloat(display);
      percent = make_percent(display, c.price.number);
      opposite = percent;
    }
    target.display = display;
    target.number = number;
    target.percent = percent;
    target.opposite = opposite;
  };
  var NPER = function(rate,payment,present,future,type){
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
  var c = {};
  c.month = { "display": month };
  c.year = { "display": year };
  c.price = {
    "display": price,
    "number": parseFloat(price)
  };
  c.closing = { "display": closing };
  make_variants(c.closing, c.closing.display);
  if(upfront != null){
    c.upfront = { "display": upfront };
    make_variants(c.upfront, c.upfront.display);
    // update_down();
    c.down = { "number": c.upfront.number - c.closing.number };
    c.down.display = make_percent(c.down.number, c.price.number);
    make_variants(c.down, c.down.number);
  }
  else if(down != null){
    c.down = { "display": down };
    make_variants(c.down, c.down.display);
    // update_upfront();
    c.upfront = { "display": String(c.down.number + c.closing.number) };
    make_variants(c.upfront, c.upfront.display);
  }
  c.term = {
    "display": term,
    "number": parseFloat(term)
  };
  c.interest = {
    "display": interest,
    "percent": parse_percent(interest)
  };
  c.pmi = {
    "display": pmi,
    "percent": parse_percent(pmi)
  };
  c.hoa = {
    "display": hoa,
    "number": parseFloat(hoa)
  };
  c.extra = {
    "display": extra,
    "number": parseFloat(extra)
  };
  if(hoi != null){
    c.hoi = {
      "display": hoi,
      "number": parseFloat(hoi)
    };
  }
  else {
    c.hoi = { "number": Math.round((c.price.display / 1000) * 3.5) };
    c.hoi.display = String(c.hoi.number);
  }
  if(flood != null){
    c.flood = {
      "display": flood,
      "number": parseFloat(flood)
    };
  }
  else {
    c.flood = { "number": Math.round((c.price.display / 1000) * 1.8) };
    c.flood.display = String(c.flood.number);
  }
  c.tax = {
    "display": tax,
    "percent": parse_percent(tax)
  };
  c.appreciation = {
    "display": appreciation,
    "percent": parse_percent(appreciation)
  };
  c.rent = {
    "display": rent,
    "number": parseFloat(rent)
  };

  c._output = {};
  c._output.loan = c.price.number - c.down.number; // Loan amount
  c._output.monthly_interest_rate = c.interest.percent / 12; // Monthly interest rate
  c._output.yearly_pmi = c._output.loan * c.pmi.percent; // Yearly PMI
  c._output.monthly_pmi = c.down.number / c._output.loan < .2 ? Math.round(parseFloat(c._output.yearly_pmi / 12)) : 0; // Monthly PMI
  c._output.yearly_hoa = c.hoa.number * 12; // Yearly HOA dues
  c._output.yearly_rent = c.rent.number * 12; // Yearly rent
  c._output.monthly_principle_interest = Math.round(parseFloat(PMT(c._output.monthly_interest_rate, c.term.number * 12, -c._output.loan))); // Monthly principal & interest
  c._output.monthly_tax = (c.price.number * c.tax.percent) / 12;
  c._output.monthly_tax_insurance_dues = Math.round(c._output.monthly_tax + c._output.monthly_pmi + (c.hoi.number / 12) + (c.flood.number / 12) + c.hoa.number); // Monthly taxes, insurance, dues
  c._output.monthly_mortgage_payment = Math.round(parseFloat(c._output.monthly_principle_interest) + parseFloat(c.extra.number)); // Monthly mortgage payment
  c._output.total_monthly_payments = Math.round(parseFloat(c._output.monthly_mortgage_payment) + parseFloat(c._output.monthly_tax_insurance_dues) + parseFloat(c.hoa.number)); // Total monthly payments
  c._output.number_of_payments = Math.round(NPER(c._output.monthly_interest_rate, -c._output.monthly_mortgage_payment, c._output.loan)); // Number of payments
  c._output.years_to_pay_off = Number.isInteger(c._output.number_of_payments / 12) ? (c._output.number_of_payments / 12) : (c._output.number_of_payments / 12).toFixed(2); // Years to pay off
  c._output.total_mortgage_payments = Number.isInteger(c._output.number_of_payments * c._output.monthly_mortgage_payment) ? (c._output.number_of_payments * c._output.monthly_mortgage_payment) : Math.round(c._output.number_of_payments * c._output.monthly_mortgage_payment); // Total mortgage payments
  c._output.total_interest = Number.isInteger(c._output.total_mortgage_payments - c._output.loan) ? (c._output.total_mortgage_payments - c._output.loan) : Math.round(c._output.total_mortgage_payments - c._output.loan); // Total interest

  return c;
}
var api = new Api();
