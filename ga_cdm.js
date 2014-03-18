/**
 * GOOGLE ANALYTICS METADATA TRACKING FOR CONTENTDM 6
 * Josh Wilson, State Library of North Carolina, josh.wilson@ncdcr.gov
 * 
 * This script allows you do define CONTENTdm 6 metadata fields you want tracked in
 * Google Analytics. For example, you might have a field that contains the Agency
 * responsible for the document, and you'd like to get usage data by Agency. 
 * 
 * Fields are tracked as Events:
 *  - Name of the field will appear as a Category
 *  - Value of the field appears as an Action 
 *    --(you can drill down from Category on the GA Top Events report)
 *    
 * Configuration instructions below.
 * 
 * 
 * TODOs
 * Analytics.js support
 * Variables that exceed 128 characters (name+value) don't record; these should be truncated
 * Remove custom variables -
 *  - they aren't really being used and aren't available in analytics.js
 *  - this also removes the limitation on number of custom fields
 * Better way to locate metadata fields?
 */

////////////////////////////////////////////////////////////////////////////////////
// ADD FIELDS YOU WANT TO TRACK TO THIS ARRAY
// - 5 max (limited by GA custom variable slots)
// - Each line corresponds to a custom variable slot
// -- be sure to retain their postion if you add new ones
// - Leave blank ('') if you aren't using that slot
// - if length of field name + value exceeds 128 characters, value will be truncated
////////////////////////////////////////////////////////////////////////////////////
var trackTheseFields = [
  'Agency',
  'Digital Collection',
  '',
  '',
  ''
];
////////////////////////////////////////////////////////////////////////////////////
// SET YOUR GOOGLE ANALYTICS ACCOUNT AND DOMAIN(S) HERE
// gaAccount corresponds to your GA account and property number. 
//    Looks like 'UA-X-Y' (where X is specific to your account and Y is a property number)
// digitalCollectionsDomain is wherever your digital collections are set up
// Hosted instances may have an additional alias URL like cdm######.contentdm.oclc.org
//    Updated the value for hostedAliasDomain with the correct URL if this 
//    applies to your institution. Ignore this line otherwise.
////////////////////////////////////////////////////////////////////////////////////
var gaAccount = 'UA-1-1';
var digitalCollectionsDomain = 'my.site.com';
var hostedAliasDomain = 'change.if.applicable.otherwise.ignore';
////////////////////////////////////////////////////////////////////////////////////

var customVarArray = new Array(trackTheseFields.length);
var trackedFieldIndex;

//Standard GA initial calls
var _gaq = _gaq || [];
_gaq.push(['_setAccount', gaAccount]);

if (hostedAliasDomain !== 'change.if.applicable.otherwise.ignore') {
  _gaq.push(['_setDomainName', digitalCollectionsDomain]);
}
else {
  //Depending on referrer, visitors might have either of these two domain names
  //Need to allow for either or GA will ignore tracking if domain name doesn't match code
  if (location.host===digitalCollectionsDomain) {
    _gaq.push(['_setDomainName', digitalCollectionsDomain]);
  } else if (location.host===hostedAliasDomain) {
    _gaq.push(['_setDomainName', hostedAliasDomain]);
  }  //Implied that  if location is something unexpected, don't call _setDomainName
  _gaq.push(['_setAllowLinker', true]);
}
//Standard GA ga.js loading
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/**
 * Use jQuery .ready() method to set the remainder to run after DOM is loaded
 * (jQuery is used by CONTENTdm, so it's available). Timing is important, CONTENTdm
 * pages can load slowly.
 * 
 * Basic idea is to grab all "description_col1"-class elements, look through them
 * for desired metadata fields. Once you find it, the actual value of the field 
 * is located nearby. This is somewhat volatile and will need an update when 
 * anything changes in CONTENTdm's page structure. Could be a more clever way 
 * to do this. 
 */
$(document).ready(function(){
  var rows = document.getElementsByClassName("description_col1");
  var done = 0;
  for(var i=0;i<rows.length;i++){    
    //Try to reduce the amount of time spent looping through metadata elements
    //by flagging when the desired fields have been found. If we've matched all
    //fields we were after, we can break.
    if (done === trackTheseFields.length) {
      break;
    }
    else {
      //check this element for a match in the trackTheseFields array
      for (trackedFieldIndex=0; trackedFieldIndex<trackTheseFields.length; trackedFieldIndex++) {
        if (trackTheseFields[trackedFieldIndex] !== '') {
          //Need to wrap element checks in try/catch structure to prevent the code from
          //failing badly when child elements don't exist

          //Most browsers
          try {
            if (rows[i].textContent &&
               (rows[i].textContent.indexOf(trackTheseFields[trackedFieldIndex]) >= 0)) {
                 customVarArray[trackedFieldIndex] = rows[i].nextElementSibling.textContent.trim();
                 _gaq.push(['_trackEvent', trackTheseFields[trackedFieldIndex], customVarArray[trackedFieldIndex]]);
                 done++;
            }
          } catch(e) {}  

          //IE8
          //- page structure renders slightly differently
          //- supports innerText instead of textContent
          //- doesn't work correctly with JS trim(), uses jQuery's version instead
          try {
            if (rows[i].innerText &&
               (rows[i].innerText.indexOf(trackTheseFields[trackedFieldIndex]) >= 0)) {
                 customVarArray[trackedFieldIndex] = $.trim(rows[i].nextElementSibling.innerText);
                 _gaq.push(['_trackEvent', trackTheseFields[trackedFieldIndex], customVarArray[trackedFieldIndex]]);
                 done++;
            }
          } catch(e) {}          
        }
      }
    }
  };
  //Record variables - need to do this after events to avoid duplicated reporting
  //Loop through customVar array, report any values found in corresponding slot
  for(trackedFieldIndex=0; trackedFieldIndex<customVarArray.length; trackedFieldIndex++){ 
    if (customVarArray[trackedFieldIndex]) {
      _gaq.push(['_setCustomVar', trackedFieldIndex+1, trackTheseFields[trackedFieldIndex], customVarArray[trackedFieldIndex]]);
    }    
  }
  
  //Finally, add trackPageview to the gaq command queue
  //Needs to be in the .ready() block to ensure proper timing
  _gaq.push(['_trackPageview']); 
});