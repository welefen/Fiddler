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
        matchHeader: function(requestInfo, rule){
            var pattern = (rule.pattern || "").split('=');
            var hName = pattern.shift().toLowerCase();
            var hValue = pattern.join('=');
            var headers = requestInfo.requestHeaders || [];
            return headers.some(function(item){
                var name = item.name.toLowerCase();
                var value = item.value;
                if (name == hName) {
                    if (hValue == value) {
                        return true;
                    };
                    if (value.indexOf(hValue) == 0) {
                        return true;
                    };
                };
                return false;
            })
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
            var self = this;
            this.onBeforeRequest(function(data){
                var url = data.data.url;
                var encoding = Fiddler_Config.getEncoding();
                if (self.match(data.data, rule)) {
                    return false;
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
        addDelayRule: function(rule){
            var self = this;
            this.onBeforeRequest(function(data){
                if (self.match(data.data, rule)) {
                    var delayTime = parseInt(rule.replace, 10) || 0;
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
        addCancelRule: function(rule){
            var self = this;
            this.onBeforeRequest(function(data){
                if (self.match(data.data, rule)) {
                    return {
                        cancel: true
                    }
                };
                return false;
            })
        },
        addHeaderRule: function(rule){
            var self = this;
            this.onBeforeSendHeaders(function(data){
                if (self.match(data.data, rule)) {
                    var item = {
                        name: 'Author',
                        value: "welefen"
                    }
                    data.data.requestHeaders.push(item)
                    return data.data;  
                };
                return false;
            })
        },
        parseHeader: function(string){
            string = (string || "").split(";");
            var headers = {};
            string.forEach(function(item){
                item = item.trim();
                if (!item) {
                    return false;
                };
                item = item.split('=');
                var name = item[0].trim();
                var value = item[1].trim();
                if (!name) {
                    return false;
                };
                headers[name] = value;
            })
            return headers;
        },
        headersToObj: function(headers){
            headers = headers || [];
            var result = {};
            headers.forEach(function(item){
                result[item.name] = item.value;
            });
            return result;
        },
        headersToArr: function(obj){
            var headers = [];
            for(var name in obj){
                headers.push({
                    name: name,
                    value: obj[name]
                });
            }
            return headers;
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