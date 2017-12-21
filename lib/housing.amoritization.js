amoritization = function(values){
  debug.log('\tamoritization()');

  var _a = values.amoritization;
  var _i = values.inputs;
  var _o = values.outputs;

// build table

// build graph
  var value = [];
  var balance = [];
  var equity = [];
  var interest = [];
  var payments_t = [];
  var years = [];
  var date = [];
  var rent_equity = [];
  var cost_rent = [];
  $.each(_a,function(x){
    value.push(_a[x].value);
    balance.push(_a[x].balance);
    equity.push(_a[x].equity);
    interest.push(_a[x].interest.total);
    payments_t.push(_a[x].payments.total);
    years.push(_a[x].year);
    date.push(_a[x].date);
    rent_equity.push(_a[x].rent_equity);
    cost_rent.push(_a[x].cost_rent);
  });
  // var range = [[0,1],value,balance,equity,interest,payments_t,rent_equity];
  $('#chart-value').chart({
    'lines': [
      {
        'name': 'Home value',
        'values': value,
        'color': '#F00563'
      },
      {
        'name': 'Loan balance',
        'values': balance,
        'color': 'rgb(66,133,244)'
      },
      {
        'name': 'Equity',
        'values': equity,
        'color': 'rgb(244,180,0)'
      },
      {
        'name': 'Interest',
        'values': interest,
        'color': 'rgb(15,157,88)'
      },
      {
        'name': 'Total cost',
        'values': payments_t,
        'color': 'rgb(171,71,188)'
      }
    ],
    'weight': 1.5,
    'tracker': {
      'color': 'rgba(255,0,0,.3)',
      'radius': 3,
      'plots': [
        {
          'color': 'transparent',
          'prefix': 'Year: ',
          'values': years
        },
        {
          'color': 'transparent',
          'values': date
        }
      ]
    },
    'type': 'run-chart'
  });
};
