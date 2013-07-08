/**
 * base library
 * @return {[type]} [description]
 */
var Fiddler = function(){
    var Fiddler = {};
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
    Fiddler.match = function(string, mix){
        if (string === mix) {
            return true;
        };
        if (string.indexOf(mix) === 0) {
            return true;
        };
        try{
            mix.replace(/^\/(.*)\/([mig]*)$/g, function(a, b, c) {
                mix = new RegExp(b, c || '');
            });
            if (mix.test(string)) {
                return string.match(mix);
            };
        }catch(e){}
        return false;
    }
    Fiddler.pathAdd = function(prefix, suffix){
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
            }
        };
    };
    Fiddler.implement = function(source, proto){
        if(typeof proto == "function"){
            proto = proto(Fiddler); 
        }
        return Fiddler.mix(source, proto, true);
    };
    return Fiddler;
}();