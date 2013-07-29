/**
 * get request content
 * @param  {[type]} request [description]
 * @return {[type]}         [description]
 */
chrome.devtools.network.onRequestFinished.addListener(function(request) {
      var url = request.request.url;
      if (!Fiddler.checkUrl(url)) {
            return true;
      };
      request.getContent(function(content){
            var data = {
                method: "requestContent",
                url: url,
                content: content,
                har: JSON.stringify(request)
            }
            chrome.runtime.sendMessage(data, function(response) {
                //console.log(response.farewell);
            });
      }); 
});