chrome.browserAction.onClicked.addListener(function(){
    var url = chrome.extension.getURL("html/options.html");
    window.open(url, "fiddler_option_page");
});