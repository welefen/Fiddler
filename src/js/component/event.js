/**
 * 事件相关
 * @return {[type]} [description]
 */
var Fiddler_Event = function(){
    "use strict";
    function checkUrl(url){
        if (url.indexOf('?fiddler=') > -1 || url.indexOf('&fiddler=') > -1 ) {
            return false;
        };
        if (url.indexOf('http://') == 0 || url.indexOf('https://') == 0) {
            return true;
        };
        return false;
    }
    function init(){
        chrome.webRequest.onBeforeRequest.addListener(function(details) {
            if (!checkUrl(details.url)) {
                return {};
            };
            var result = Fiddler_Rule.fireSome("onBeforeRequest", details);
            if (result) {
                return result;
            };
           }, {urls:["<all_urls>"]}, ["blocking", "requestBody"] 
        );
        chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
            if (!checkUrl(details.url)) {
                return {};
            };
            var result = Fiddler_Rule.fireMerge("onBeforeSendHeaders", details);
            if (result) {
                if (result.cancel) {
                    return {
                        cancel: true
                    }
                };
                return {
                    requestHeaders: result.requestHeaders
                };
            };
          }, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]
        );
        chrome.webRequest.onCompleted.addListener(function(details) {
            if (!checkUrl(details.url)) {
                return {};
            };
            Fiddler_Rule.fire("onCompleted", details);
        }, {urls: ["<all_urls>"]}, ["responseHeaders"]);
    }
    return {
        init: function(){
            init();
        }
    }
}();