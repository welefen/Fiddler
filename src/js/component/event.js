/**
 * 事件相关
 * @return {[type]} [description]
 */
var Fiddler_Event = function(){
    "use strict";
    function init(){
        chrome.webRequest.onBeforeRequest.addListener(function(details) {
            var result = Fiddler_Rule.fireSome("onBeforeRequest", details);
            if (result) {
                return result;
            };
            return {};
           }, {urls:["http://*/*"]}, ["blocking", "requestBody"] 
        );
        chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
            var result = Fiddler_Rule.fireMerge("onBeforeSendHeaders", details);
            if (result) {
                return {
                    requestHeaders: result.requestHeaders
                };
            };
          }, {urls: ["http://*/*"]}, ["blocking", "requestHeaders"]
        );
        chrome.webRequest.onCompleted.addListener(function(details) {
            Fiddler_Rule.fire("onCompleted", details);
        }, {urls: ["http://*/*"]}, ["responseHeaders"]);
    }
    return {
        init: function(){
            init();
        }
    }
}();