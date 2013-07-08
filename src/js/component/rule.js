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
        match: function(requestInfo, rule){
            if (rule.patternType == "Method") {
                return this.matchMethod(requestInfo, rule);
            }else if(rule.patternType == 'Header'){
                return this.matchHeader(requestInfo, rule);
            }else{
                return this.matchUrl(requestInfo, rule);
            }
        },
        matchUrl: function(requestInfo, rule){
            var url = requestInfo.url;
            var pattern = rule.pattern;
            if (rule.patternType == 'String') {
                return url.indexOf(pattern) >= 0;
            };
            if (pattern.indexOf('/') != 0) {
                pattern = '/' + pattern + '/';
            };
            try{
                pattern.replace(/^\/(.*)\/([mig]*)$/g, function(a, b, c) {
                    pattern = new RegExp(b, c || '');
                });
                if (pattern.test(url)) {
                    return true;
                };
            }catch(e){}
            return false;
        },
        matchMethod: function(requestInfo, rule){
            var method = requestInfo.method;
            if (rule.replace == requestInfo.url) {
                return false;
            };
            return rule.pattern.toLowerCase() == method.toLowerCase();
        },
        matchHeader: function(){

        },
        /**
         * file replace
         * @param  {[type]} pattern  [description]
         * @param  {[type]} filename [description]
         * @return {[type]}          [description]
         */
        addFileReplaceRule: function(rule){
            var self = this;
            this.onBeforeRequest(function(data){
                var encoding = Fiddler_Config.getEncoding();
                if (self.match(data.data, rule)) {
                    var filename = rule.replace;
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
        addDirReplaceRule: function(rule){
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
        addUrlReplaceRule: function(rule){
            var self = this;
            this.onBeforeRequest(function(data){
                if (self.match(data.data, rule)) {
                    var url = rule.replace;
                    return {
                        redirectUrl: url
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
        addHeaderRule: function(){

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
        parseRule: function(rule){
            var types = {
                "File": "addFileReplaceRule",
                "Path": "addDirReplaceRule",
                "Cancel": "addCancelRule",
                "Delay": "addDelayRule",
                "Redirect": "addUrlReplaceRule",
                "Header": "addHeaderRule"
            }
            rule.type = types[rule.replaceType];
            return rule;
        },
        addRule: function(rule){
            var result = this.parseRule(rule);
            var type = result.type;
            if (this[type]) {
                Fiddler_Config.addRule(result);
                if (rule.enable) {
                    this[type](result);
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
                self.addRule(item);
            });
            return this;
        }
    })
    return rule;
}();