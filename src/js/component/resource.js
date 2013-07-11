/**
 * request resource
 * @return {[type]} [description]
 */
var Fiddler_Resource = function(){
    "use strict";
    var _request = {};
    var resource = Fiddler.implement({}, Fiddler.CustEvent);

    var parentRequestId = 0;
    Fiddler.mix(resource, {
        clearResource: function(){
            _request = {};
        },
        add: function(data, type){
            var requestId = data.requestId;
            data[type + "Time"] = data.timeStamp;
            if (!(requestId in _request)) {
                _request[requestId] = data;
            }else{
                for(var name in data){
                    _request[requestId][name] = data[name];
                }
            };
            if (type == 'onCompleted') {
                var resourceType = _request[requestId].type;
                var method = _request[requestId].method;
                if (resourceType == "main_frame" && method == "GET" ) {
                    parentRequestId = requestId;
                    _request[requestId].parentRequestId = 0;
                }else{
                    _request[requestId].parentRequestId = parentRequestId;
                }
                //content-size
                _request[requestId].size = 0;
                var responseHeaders = _request[requestId].responseHeaders || [];
                responseHeaders.some(function(item){
                    if (item.name == 'Content-Length') {
                        _request[requestId].size = item.value;
                        return true;
                    };
                });
                var urlInfo = Fiddler.getUrlDetail(data.url);
                Fiddler.mix(_request[requestId], urlInfo, true);
                this.fire("onCompleted", _request[requestId]);
            };
        },
        getItem: function(requestId){
            return _request[requestId] || {};
        },
        getResoure: function(){
            return _request;
        },
        getContent: function(requestId){
            var deferred = when.defer();
            var detail = _request[requestId];
            if (detail.content) {
                return deferred.resolve(detail.content);
            }else{
                Fiddler_File.getRemoteFile(requestId).then(function(data){
                    _request[requestId].content = data;
                    deferred.resolve(data);
                })
            }
            return deferred.promise;
        },
        getImgRect: function(url){
            var deferred = when.defer();
            var img = new Image();
            img.onload = function(){
                deferred.resolve({
                    width: this.width,
                    height: this.height
                })
            }; 
            img.src = url;
            return deferred.promise;
        },
        getSize: function(requestId){
            var deferred = when.defer();
            var detail = _request[requestId];
            if (detail.size) {
                return deferred.resolve(detail.size);
            }else{
                if (detail.content) {
                    _request[requestId].size = detail.content.length;
                    return deferred.resolve(_request[requestId].size);
                };
                var self = this;
                this.getContent(requestId).then(function(){
                    return self.getSize(requestId);
                }).then(function(size){
                    deferred.resolve(size);
                })
            }
            return deferred.promise;
        }
    })
    return resource;
}()