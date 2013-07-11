/**
 * 文件读取相关
 */
var Fiddler_File = function(){
    "use strict";
    /**
     * [encodeText description]
     * @param  {[type]} text [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    function encodeText(text, type){
        if (type == 'script') {
            text = text.replace(/[\u0080-\uffff]/g, function($0) {
                var tmp = $0.charCodeAt(0).toString(16);
                return "\\u" + new Array(5 - tmp.length).join('0') + tmp;
            });
        };
        text = encodeURIComponent(text);
        return text;
    }
    return {
        /**
         * get local file content by xhr
         * @param  {[type]} file [description]
         * @return {[type]}      [description]
         */
        getLocalFile: function(file, encoding, type){
            var xhr = new XMLHttpRequest(); 
            xhr.open('GET', file, false);
            xhr.send(null); 
            var text = xhr.responseText || xhr.responseXML;
            if (!text) {
                return false;
            };
            if (encoding) {
                text = "data:text/javascript; " + encoding + "," + encodeText(text, type);
            };
            return text;
        },
        checkFileExist: function(file){
            return !!this.getLocalFile(file);
        },
        /**
         * get remote file content
         * @return {[type]} [description]
         */
        getRemoteFile: function(requestId){
            var detail = Fiddler_Resource.getItem(requestId);
            var url = detail.url;
            if (url.indexOf('?') == -1) {
                url += '?fiddler=' + requestId;
            }else{
                url += '&fiddler=' + requestId;
            }
            //var headers = Fiddler_Rule.headersToObj(detail.requestHeaders);
            var method = detail.method;
            var deferred = when.defer();
            $.ajax({
                url: url,
                method: method,
                complete: function(data){
                    data = data.responseText || data.responseXML;
                    deferred.resolve(data);
                }
            })
            return deferred.promise;
        }
    }
}();