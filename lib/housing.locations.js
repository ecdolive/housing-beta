/*
Effective tax rate: https://taxfoundation.org/how-calculate-property-tax-liability-2/
Atlanta https://www.fultoncountytaxes.org/media/6682/millage_rates_thru_2016.pdf
Chicago http://www.cookcountyclerk.com/tsd/DocumentLibrary/2016%20Tax%20Rate%20Report.pdf
San Francisco http://www.sfassessor.org/sites/default/files/notice/FINAL_Notice%20of%20Assessed%20Value_Fact%20Sheet%20%286.10.2015%29.pdf
  http://www.socketsite.com/archives/2016/09/property-tax-rate-in-sf-slated-to-drop-and-where-the-dollars-will-go.html
Seattle http://blue.kingcounty.com/Assessor/eRealProperty/Dashboard.aspx?ParcelNbr=9195871120
*/

var locs = {
  "custom": {
    "name": "Custom",
    "tax_rate": .87
  },
  "atlanta": {
    "name": "Atlanta",
    "tax_rate": 1.732
  },
  "chicago": {
    "name": "Chicago",
    "tax_rate": 1.90664325
  },
  "san_francisco": {
    "name": "San Francisco",
    "tax_rate": 1.1792
  },
  "seattle": {
    "name": "Seattle",
    "tax_rate": .924803
  }
};
