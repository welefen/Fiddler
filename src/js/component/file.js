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
        getRemoteFile: function(url, headers){

        }
    }
}();