/**
 * base library
 * @return {[type]} [description]
 */
var Fiddler = function(){
    var Fiddler = {};
    Fiddler.isJson = function(string){
        try{
            JSON.parse(string);
            return true;
        }catch(e){
            return false;
        }
        return false;
    }
    Fiddler.isJsonp = function(string){
        string = string.trim();
        var pattern = /^[\w\.]+\s*\(.*\);?$/;
        return pattern.test(string);
    }
    Fiddler.queryUrl = function (url, key) {
        url = url.replace(/^[^?=]*\?/ig, '').split('#')[0]; 
        var json = {};
        url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
            try {
                key = decodeURIComponent(key);
            } catch(e) {}
            try {
                value = decodeURIComponent(value);
            } catch(e) {}
            if (!(key in json)) {
                json[key] = /\[\]$/.test(key) ? [value] : value; 
            }
            else if (json[key] instanceof Array) {
                json[key].push(value);
            }
            else {
                json[key] = [json[key], value];
            }
        });
        return key ? json[key] : json;
    }
    Fiddler.bindEvent = function(el, configs){
        el = $(el);
        for(var name in configs){
            var value = configs[name];
            if (typeof value == 'function') {
                var obj = {};
                obj.click = value;
                value = obj;
            };
            for(var type in value){
                el.delegate(name, type, value[type]);
            }
        }
    }
    Fiddler.pathAdd = function(prefix, suffix){
        if (prefix.substr(prefix.length - 1) == '/') {
            prefix = prefix.substr(0, prefix.length - 1);
        };
        if (suffix.substr(0, 1) == '/') {
            suffix = suffix.substr(1);
        };
        return prefix + "/" + suffix;
    }
    Fiddler.urlAdd = function(prefix, suffix){
        return prefix + "/" + suffix;
    }
    Fiddler.truncate = function(string, length, suffix){
        suffix = suffix || "...";
        if (string.length > length) {
            return string.substr(0, length) + suffix;
        };
        return string;
    }
    Fiddler.truncateCenter = function(string, length, suffix){
        suffix = suffix || "...";
        if (string.length > length) {
            var p = parseInt(length / 2);
            var s = length - p;
            return string.substr(0, p) + suffix + string.substr(string.length - s);
        };
        return string;
    }
    Fiddler.getHumanSize = function(size){
        size = size | 0;
       var list = [
            [1024 * 1024, "MB"],
            [1024, "KB"],
            [1, "B"]
       ];
       var hummanSize = '';
       list.some(function(item){
            if (size > item[0]) {
                hummanSize = (size / item[0]).toFixed(1) + item[1];
                return true;
            };
       });
       return hummanSize || size;
    }
    /**
     * url detail
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    Fiddler.getUrlDetail = function(url){
        var a = document.createElement('a');
        a.href = url;
        return {
            protocol: a.protocol,
            host: a.protocol + "//" + a.hostname + (a.port ? (":" + a.port) : ""),
            path: a.pathname
        }
    }
    Fiddler.delay = function(delayTime){
        var time = new Date * 1;
        while(true){
            var endTime = new Date * 1;
            var sub = endTime - time;
            if (sub >= delayTime) {
                return this;
            };
        }
        return this;
    }
    Fiddler.mix = function(des, src, mixer) {
        mixer = mixer || function(d, s){
            if(typeof d === 'undefined'){
                return s;
            }
        }
        if(mixer == true){
            mixer = function(d, s){return s};
        }       
        for (var i in src) {
            var v = mixer(des[i], src[i], i, des, src);
            if(typeof v !== 'undefined'){
                des[i] = v;
            }
        }
        return des;
    };

    Fiddler.CustEvent = function(){
        var handlers = {};
        return {
            on: function(event, handler){
                if(typeof event === 'object'){
                    for(var i in event){
                        this.on(i, event[i]);
                    }
                    return;
                }

                handlers[event] = handlers[event] || [];
                handlers[event].push(handler);
            },
            un: function(event, handler){
                if(typeof event === 'object'){
                    for(var i in event){
                        this.un(i, event[i]);
                    }
                    return;
                }

                var _handlers = handlers[event] || [];
                _handlers.some(function(o, i){
                    if(o == handler){
                        _handlers.splice(i, 1);
                        return true;
                    }
                });
            },
            clear: function(event){
                var _handlers = handlers[event] || [];
                _handlers.length = 0;
            },
            clearAll: function(){
                handlers = {};
            },
            fire: function(event, args){
                args = args || {};
                var msg = {
                    data: args,
                    type: event,
                    target: this,
                    returnValue: true,
                    preventDefault: function(){
                        args.returnValue = false;
                    }
                };
                var _handlers = handlers[event] || [];
                _handlers = _handlers.concat(handlers['*'] || []);
                _handlers.forEach(function(o){
                    o(msg);
                });
                return msg.returnValue;
            },
            fireSome: function(event, args){
                args = args || {};
                var msg = {
                    data: args,
                    type: event,
                    target: this,
                };
                var _handlers = handlers[event] || [];
                _handlers = _handlers.concat(handlers['*'] || []);
                var ret = null;
                _handlers.some(function(o){
                    var result = o(msg);
                    if (result) {
                        ret = result;
                        return true;
                    };
                });
                return ret;
            },
            fireMerge: function(event, args){
                args = args || {};
                var msg = {
                    data: args,
                    type: event,
                    target: this,
                };
                var _handlers = handlers[event] || [];
                _handlers = _handlers.concat(handlers['*'] || []);
                _handlers.forEach(function(o){
                    var result = o(msg);
                    if (result) {
                        msg.data = result;
                    };
                });
                return msg.data;
            }
        };
    };
    Fiddler.implement = function(source, proto){
        if(typeof proto == "function"){
            proto = proto(Fiddler); 
        }
        return Fiddler.mix(source, proto, true);
    };
    Fiddler.encode4Html = function(s){
        var el = document.createElement('pre');
        var text = document.createTextNode(s);
        el.appendChild(text);
        return el.innerHTML;
    }
    //template from qwrap
    Fiddler.tmpl = (function() {
        var tmplFuns={};
        var sArrName = "sArrCMX",
            sLeft = sArrName + '.push("';
        var tags = {
            '=': {
                tagG: '=',
                isBgn: 1,
                isEnd: 1,
                sBgn: '",Fiddler.encode4Html(',
                sEnd: '),"'
            },
            'js': {
                tagG: 'js',
                isBgn: 1,
                isEnd: 1,
                sBgn: '");',
                sEnd: ';' + sLeft
            },
            'js': {
                tagG: 'js',
                isBgn: 1,
                isEnd: 1,
                sBgn: '");',
                sEnd: ';' + sLeft
            },
            'if': {
                tagG: 'if',
                isBgn: 1,
                rlt: 1,
                sBgn: '");if',
                sEnd: '{' + sLeft
            },
            'elseif': {
                tagG: 'if',
                cond: 1,
                rlt: 1,
                sBgn: '");} else if',
                sEnd: '{' + sLeft
            },
            'else': {
                tagG: 'if',
                cond: 1,
                rlt: 2,
                sEnd: '");}else{' + sLeft
            },
            '/if': {
                tagG: 'if',
                isEnd: 1,
                sEnd: '");}' + sLeft
            },
            'for': {
                tagG: 'for',
                isBgn: 1,
                rlt: 1,
                sBgn: '");for',
                sEnd: '{' + sLeft
            },
            '/for': {
                tagG: 'for',
                isEnd: 1,
                sEnd: '");}' + sLeft
            },
            'while': {
                tagG: 'while',
                isBgn: 1,
                rlt: 1,
                sBgn: '");while',
                sEnd: '{' + sLeft
            },
            '/while': {
                tagG: 'while',
                isEnd: 1,
                sEnd: '");}' + sLeft
            } 
        };

        return function(sTmpl, opts) {

            var fun  = tmplFuns[sTmpl];
            if (!fun) {
                var N = -1,
                    NStat = []; 
                var ss = [
                    [/\{strip\}([\s\S]*?)\{\/strip\}/g, function(a, b) {
                        return b.replace(/[\r\n]\s*\}/g, " }").replace(/[\r\n]\s*/g, "");
                    }],
                    [/\\/g, '\\\\'],
                    [/"/g, '\\"'],
                    [/\r/g, '\\r'],
                    [/\n/g, '\\n'], 
                    [
                        /\{[\s\S]*?\S\}/g, 
                        function(a) {
                            a = a.substr(1, a.length - 2);
                            for (var i = 0; i < ss2.length; i++) {a = a.replace(ss2[i][0], ss2[i][1]); }
                            var tagName = a;
                            if (/^(=|.\w+)/.test(tagName)) {tagName = RegExp.$1; }
                            var tag = tags[tagName];
                            if (tag) {
                                if (tag.isBgn) {
                                    var stat = NStat[++N] = {
                                        tagG: tag.tagG,
                                        rlt: tag.rlt
                                    };
                                }
                                if (tag.isEnd) {
                                    if (N < 0) {throw new Error("Unexpected Tag: " + a); }
                                    stat = NStat[N--];
                                    if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
                                } else if (!tag.isBgn) {
                                    if (N < 0) {throw new Error("Unexpected Tag:" + a); }
                                    stat = NStat[N];
                                    if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
                                    if (tag.cond && !(tag.cond & stat.rlt)) {throw new Error("Unexpected Tag: " + tagName); }
                                    stat.rlt = tag.rlt;
                                }
                                return (tag.sBgn || '') + a.substr(tagName.length) + (tag.sEnd || '');
                            } else {
                                return '",(' + a + '),"';
                            }
                        }
                    ]
                ];
                var ss2 = [
                    [/\\n/g, '\n'],
                    [/\\r/g, '\r'],
                    [/\\"/g, '"'],
                    [/\\\\/g, '\\'],
                    [/\$(\w+)/g, 'opts["$1"]'],
                    [/print\(/g, sArrName + '.push(']
                ];
                for (var i = 0; i < ss.length; i++) {
                    sTmpl = sTmpl.replace(ss[i][0], ss[i][1]);
                }
                if (N >= 0) {throw new Error("Lose end Tag: " + NStat[N].tagG); }
                
                sTmpl = sTmpl.replace(/##7b/g,'{').replace(/##7d/g,'}').replace(/##23/g,'#'); 
                sTmpl = 'var ' + sArrName + '=[];' + sLeft + sTmpl + '");return ' + sArrName + '.join("");';
                
                tmplFuns[sTmpl] = fun = new Function('opts', sTmpl);
            }

            if (arguments.length > 1) {return fun(opts); }
            return fun;
        };
    }());

    return Fiddler;
}();