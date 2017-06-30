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
    "mill_county": 3.84,
    "mill_city": 11.7,
    "assessment_ratio": 100
  },
  "atlanta": {
    "name": "Atlanta",
    "mill_county": 10.7,
    "mill_city": 32.6,
    "assessment_ratio": 40
  },
  "chicago": {
    "name": "Chicago",
    "mill_county": 0,
    "mill_city": 71.45,
    "assessment_ratio": 33.33
  },
  "san_francisco": {
    "name": "San Francisco",
    "mill_county": 0,
    "mill_city": 11.792,
    "assessment_ratio": 100
  },
  "seattle": {
    "name": "Seattle",
    "mill_county": 0,
    "mill_city": 9.24803,
    "assessment_ratio": 100
  }
};
