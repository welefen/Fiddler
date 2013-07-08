/**
 * rule
 * @return {[type]} [description]
 */
var Fiddler_Rule = function(){
    "use strict";
    /**
     * event types
     * @type {Array}
     */
    var eventTypes = [
        "onBeforeRequest",
        "onBeforeSendHeaders",
        "onSendHeaders",
        "onHeadersReceived",
        "onBeforeRedirect",
        "onResponseStarted",
        "onErrorOccurred",
        "onCompleted"
    ];
    var rule = Fiddler.implement({}, Fiddler.CustEvent);
    eventTypes.forEach(function(item){
        rule[item] = function(callback){
            this.on(item, callback);
        }
    });
    var _isResouceListening = false;
    Fiddler.mix(rule, {
        /**
         * file replace
         * @param  {[type]} pattern  [description]
         * @param  {[type]} filename [description]
         * @return {[type]}          [description]
         */
        addFileReplaceRule: function(pattern, filename){
            this.onBeforeRequest(function(data){
                var url = data.data.url;
                var encoding = Fiddler_Config.getEncoding();
                if (Fiddler.match(url, pattern)) {
                    var content = Fiddler_File.getLocalFile(filename, encoding);
                    return {
                        redirectUrl: content
                    }
                };
                return false;
            })
        },
        /**
         * dir replace
         * @param  {[type]} urlPrefix [description]
         * @param  {[type]} filePath  [description]
         * @return {[type]}           [description]
         */
        addDirReplaceRule: function(urlPrefix, filePath){
            this.onBeforeRequest(function(data){
                var url = data.data.url;
                var encoding = Fiddler_Config.getEncoding();
                if (Fiddler.match(url, urlPrefix)) {
                    var suffix = url.substr(urlPrefix.length);
                    var file = Fiddler.pathAdd(filePath, suffix);
                    var content = Fiddler_File.getLocalFile(file, encoding);
                    return {
                        redirectUrl: content
                    }
                };
                return false;
            })
        },
        /**
         * url replace
         * @param  {[type]} urlPrefix    [description]
         * @param  {[type]} targetPrefix [description]
         * @return {[type]}              [description]
         */
        addUrlReplaceRule: function(urlPrefix, targetPrefix){
            this.onBeforeRequest(function(data){
                var url = data.data.url;
                if (Fiddler.match(url, urlPrefix)) {
                    var suffix = url.substr(urlPrefix.length);
                    var tagetUrl = Fiddler.urlAdd(targetPrefix, suffix);
                    return {
                        redirectUrl: tagetUrl
                    }
                };
                return false;
            })
        },
        /**
         * delay time
         * @param  {[type]} pattern   [description]
         * @param  {[type]} delayTime [description]
         * @return {[type]}           [description]
         */
        addDelayRule: function(pattern, delayTime){
            this.onBeforeRequest(function(data){
                var url = data.data.url;
                if (Fiddler.match(url, pattern)) {
                    Fiddler.delay(delayTime);
                    return false;
                };
                return false;
            })
        },
        /**
         * cancel rule
         * @return {[type]} [description]
         */
        addCancelRule: function(pattern){
            this.onBeforeRequest(function(data){
                var url = data.data.url;
                if (Fiddler.match(url, pattern)) {
                    return {
                        cancel: true
                    }
                };
                return false;
            })
        },
        /**
         * resource listening
         * @return {[type]} [description]
         */
        resouceListening: function(force){
            if (_isResouceListening && !force) {
                return false;
            };
            _isResouceListening = true;
            var self = this;
            eventTypes.forEach(function(item){
                self[item](function(data){
                    var detail = data.data;
                    Fiddler_Resource.add(detail, item);
                    return false;
                })
            })
        },
        isRule: function(info){
            return info && info.pattern && info.type && info.args;
        },
        parseRule: function(pattern, replace, enable){
            pattern = pattern.trim();
            replace = replace.trim();
            var result = {
                pattern: pattern,
                replace: replace,
                type: "",
                args: [],
                enable: enable
            };
            result.args[0] = pattern;
            switch(true){
                case replace.indexOf("File:") == 0: 
                    result.type = "addFileReplaceRule";
                    var file = replace.substr(5).trim();
                    result.args[1] = file;
                break;
                case replace.indexOf("Path:") == 0:
                    result.type = "addDirReplaceRule";
                    var path = replace.substr(5).trim();
                    result.args[1] = path;
                break;
                default:
                    result.type = "addUrlReplaceRule";
                    result.args[1] = replace;
            }
            return result;
        },
        addRule: function(pattern, replace, enable){
            var result = this.parseRule(pattern, replace, enable);
            var type = result.type;
            if (this[type]) {
                Fiddler_Config.addRule(result);
                if (enable) {
                    this[type].apply(this, result.args);
                };
            };
        },
        saveRules: function(rules, enable){
            var self = this;
            this.clearAll();
            this.resouceListening(true);
            if (!enable) {
                return this;
            };
            Fiddler_Config.clearRules();
            rules = rules || [];
            rules.forEach(function(item){
                self.addRule.apply(self, item);
            });
            return this;
        }
    })
    return rule;
}();