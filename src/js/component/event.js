/**
 * 事件相关
 * @return {[type]} [description]
 */
var Fiddler_Event = function(){
    "use strict";
    function init(cleanCheckHandler){
        
        chrome.webRequest.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES = 10000;

        chrome.webRequest.onBeforeRequest.addListener(function(details) {

            if (!Fiddler.checkUrl(details.url)) {
                return {};
            };
            var result = Fiddler_Rule.fireSome("onBeforeRequest", details);
            if (result) {
                return result;
            };
           }, {urls:["<all_urls>"]}, ["blocking", "requestBody"] 
        );
        chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
            if (!Fiddler.checkUrl(details.url)) {
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
            //clean memory cache
            if (details.type == 'main_frame' && cleanCheckHandler && cleanCheckHandler()) {
                //chrome.webRequest.handlerBehaviorChanged();
            };

            if (!Fiddler.checkUrl(details.url)) {
                return {};
            };
            Fiddler_Rule.fire("onCompleted", details);
        }, {urls: ["<all_urls>"]}, ["responseHeaders"]);
    }
    return {
        init: init
    }
}();