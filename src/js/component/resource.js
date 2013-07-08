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
                this.fire("onCompleted", _request[requestId]);
            };
        },
        getItem: function(requestId){
            return _request[requestId] || {};
        },
        getResoure: function(){
            return _request;
        }
    })
    return resource;
}()