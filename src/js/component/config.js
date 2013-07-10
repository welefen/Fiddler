var Fiddler_Config = function(){
    "use strict";
    var config = {
        encoding: "utf-8",
        enable_auto_response: true,
        disable_cache: false,
        rules: []
    };
    var _key = "Fiddler";
    return {
        init: function(){
            this.loadConfig();
        },
        clearRules: function(){
            config.rules = [];
        },
        getEncoding: function(){
            return config.encoding;
        },
        setEncoding: function(encoding){
            config.encoding = encoding;
            return this;
        },
        getConfig: function(name){
            return config[name] || "";
        },
        setConfig: function(name, value){
            config[name] = value;
            this.saveConfig();
        },
        addRule: function(data){
           config.rules.push(data);
           this.saveConfig();
        },
        getRules: function(){
            return config.rules || [];
        },
        loadConfig: function(){
            var data = localStorage.getItem(_key) || "{}";
            data = JSON.parse(data);
            Fiddler.mix(config, data, true);
        },
        saveConfig: function(){
            var data = JSON.stringify(config);
            localStorage.setItem(_key, data);
        }
    }
}();