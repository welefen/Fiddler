var _initAdd = false;
function addListener(){
    if (_initAdd) {
      return true;
    };
    _initAdd = true;
    chrome.devtools.network.onRequestFinished.addListener(function(request) {
        var url = request.request.url;
        if (!Fiddler.checkUrl(url)) {
              return true;
        };
        request.getContent(function(content){
              var data = {
                  method: "requestContent",
                  url: url,
                  content: content
              }
              chrome.runtime.sendMessage(data, function(response) {
                  
              });
        }); 
  });
};

//devtools page open after options page
chrome.runtime.sendMessage({
  method: "token",
  value: "devtools"
}, function(response) {
    if (response.result == 'ok') {
        addListener();
    };
});
