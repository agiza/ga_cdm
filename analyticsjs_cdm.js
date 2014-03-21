/**
 * GOOGLE ANALYTICS METADATA TRACKING FOR CONTENTDM 6
 * Josh Wilson, State Library of North Carolina, josh.wilson@ncdcr.gov
 * 
 * This script allows you do define CONTENTdm 6 metadata fields you want tracked in
 * Google Analytics. For example, you might have a field that contains the Agency
 * responsible for the document, and you'd like to get usage data by Agency. 
 * 
 * Uses analytics.js (Universal Analytics) code. To use this script, enable 
 * Google Analytics via CONTENTdm's Website Configuration tool. (This establishes
 * your GA account information and brings in the analytics.js library.) Then set the 
 * metadata fields you wish to track by editing the trackTheseFields array below.
 * 
 * See ga_cdm.js for ga.js (classic analytics) version.
 * 
 * Fields are tracked as Events:
 *  - Event Category default is defined below, you can optionally change it
 *  - Field name will be recorded as Event's Action 
 *  - Field value will be recorded as Event's Label
 *    --(you can drill down from Category on the GA Top Events report)
 *    
 * 
 * TODOs
 * More precise field name comparison to avoid false positives on similar names
 * 
 */

////////////////////////////////////////////////////////////////////////////////////
// ADD METADATA FIELDS YOU WANT TO TRACK HERE
// 
// Add any metadata fields you wish to track to the trackTheseFields array.
// 
// You can optionally change the Category text here as well.
////////////////////////////////////////////////////////////////////////////////////
var category = 'Pageview by metadata field';
var trackTheseFields = [
  'Agency',
  'Digital Collection'
];
////////////////////////////////////////////////////////////////////////////////////
// No changes necessary below this point.
////////////////////////////////////////////////////////////////////////////////////
/**
 * Use jQuery .ready() method to set the remainder to run after DOM is loaded
 * (jQuery is used by CONTENTdm, so it's available). Timing is important, CONTENTdm
 * pages can load slowly.
 * 
 * Basic idea is to grab all "description_col1"-class elements, which represent 
 * the metadata field names, then look through them
 * for desired metadata fields. Once you find them, the actual value of the field 
 * is located nearby. This is somewhat volatile and will need an update when 
 * anything changes in CONTENTdm's page structure. Could be a more clever/robust
 * way to do this. 
 * 
 * The analytics.js library is assumed to be loaded when this is run. It will be 
 * available if you've enabled Google Analytics via CONTENTdm's Website Configuration
 * tool.
 */
var trackedFieldIndex;
var label;
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
                 label = rows[i].nextElementSibling.textContent.trim();
                 ga('send', 'event', category, trackTheseFields[trackedFieldIndex], label);
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
                 label = $.trim(rows[i].nextElementSibling.innerText);
                 ga('send', 'event', category, trackTheseFields[trackedFieldIndex], label);
                 done++;
            }
          } catch(e) {}          
        }
      }
    }
  };
});