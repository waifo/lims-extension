
var newBoookscount=5;
 if(newBoookscount>0){
    chrome.browserAction.setBadgeBackgroundColor({
        color:[255,0,0,255]
    })
    chrome.browserAction.setBadgeText({text:''+newBoookscount})
}