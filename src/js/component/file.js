/**
 * 文件读取相关
 */
var Fiddler_File = function(){
    "use strict";
    return {
        /**
         * get local file content by xhr
         * @param  {[type]} file [description]
         * @return {[type]}      [description]
         */
        getLocalFile: function(file, encoding){
            var xhr = new XMLHttpRequest(); 
            xhr.open('GET', file, false);
            xhr.send(null); 
            var text = xhr.responseText || xhr.responseXML;
            if (encoding) {
                text = "data:text/paint; " + encoding + "," + text;
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