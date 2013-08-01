$(function(){
    "use strict";
    /**
     * get item html
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function getItemHtml(data){
        var currentType = $('#filterMenu li.disabled a').data('type');
        data.display = (currentType == data.type || currentType == '') ? "" : 'display:none';
        data.err = data.statusCode >= 400 ? "err" : "";
        data.img = getTypeFile(data.type);
        data.lowerMethod = data.method.toLowerCase();
        data.shortPath = Fiddler.truncate(data.path, 50);
        data.humanSize = Fiddler.getHumanSize(data.size) || '-';
        var html = Fiddler.tmpl($('#requestItemTpl').html(), data).trim();
        return html;
    }
    function getItemRuleHtml(data){
        var pattern = data.patternType + ": " + data.pattern;
        var replace = data.replaceType + ": " + data.replace;
        var html = $('#ruleItemTpl').html().trim();
        html = Fiddler.tmpl(html, {
            pattern: pattern,
            replace: replace,
            checked: data.enable ? "checked" : ""
        });
        return html;
    }
    function getTypeFile(type){
        var list = {
            "image": "img.png",
            "script": "js.png",
            "stylesheet": "css.png",
            "main_frame": "html.png",
            "sub_frame": "html.png",
            "xmlhttprequest": "xhr.png"
        }
        var file = list[type] || "blank.png";
        return "../img/icon/" + file;
    }
    /**
     * a request complete event
     * @return {[type]} [description]
     */
    function bindCompleteEvent(){
        var table = $('#requestList table tbody');
        Fiddler_Resource.on("onCompleted", function(detail){
            var data = detail.data;
            var html = getItemHtml(data);
            if (html) {
                $(html).appendTo(table);
                $('#requestList')[0].scrollTop = 1000000;
            };
        })
    }
    function bindRequestEvent(){
        var currentEl = null;
        var detaultTab = 'headers';
        var cbs = {
            "headers" : function(requestId){
                var detail = Fiddler_Resource.getItem(requestId);
                //query url
                var queryInfo = Fiddler_Resource.getQueryData(detail.url)
                detail.queryUrl = queryInfo.data;
                detail.queryUrlLength = queryInfo.length;
                //form data
                var requestBody = detail.requestBody;
                if (requestBody) {
                    if (requestBody.formData) {
                        var length = 0;
                        for(var name in requestBody.formData){
                            length++;
                            if (requestBody.formData[name].length == 1) {
                                requestBody.formData[name] = requestBody.formData[name][0];
                            }else{
                                requestBody.formData[name] = "[" + requestBody.formData[name].join(",") + "]";
                            }
                        }
                        detail.formData = requestBody.formData;
                        detail.formDataLength = length;
                    }else if(requestBody.raw){
                        try{
                            var buf = requestBody.raw[0].bytes;
                            var bufView = new Uint8Array(buf);
                            var result =  String.fromCharCode.apply(null, bufView);
                            var formData = Fiddler_Resource.getQueryData("?" + result);
                            detail.formData = formData.data;
                            detail.formDataLength = formData.length;
                        }catch(e){}
                    }
                };

                var html = Fiddler.tmpl($('#headersTpl').html(), detail);
                $('#tab-headers').html(html)
            },
            "preview": function(requestId){
                var detail = Fiddler_Resource.getItem(requestId);
                var type = detail.type;
                if (type == 'image') {
                    Fiddler_Resource.getSize(requestId).then(function(size){
                        var imgUrl = Fiddler_Resource.getImgUrl(requestId);
                        Fiddler_Resource.getImgRect(imgUrl, detail.url).then(function(rect){
                            var filename = detail.url.match(/([^\/\?\#]+)(?:[\?\#].*)?$/)[1];
                            var html = Fiddler.tmpl($('#imagePreviewTpl').html(), {
                                imgUrl: rect.old ? detail.url : imgUrl,
                                url: detail.url,
                                filename: filename,
                                width: rect.width,
                                height: rect.height,
                                filesize: Fiddler.getHumanSize(size),
                                display_url: Fiddler.truncateCenter(detail.url, 30)
                            });
                            $('#tab-preview').html(html)
                        })
                    })
                }else if(type == 'script'){
                    Fiddler_Resource.getContent(requestId).then(function(content){
                        content = content || "";
                        var html = '<div class="content"> <pre class="brush: js;gutter: false">'+Fiddler.encode4Html(content)+'</pre> </div>';
                        $('#tab-preview').html(html);
                        SyntaxHighlighter.highlight();
                    })
                }else if(type == 'stylesheet'){
                    Fiddler_Resource.getContent(requestId).then(function(content){
                        content = content || "";
                        var html = '<div class="content"> <pre class="brush: css;gutter: false">'+Fiddler.encode4Html(content)+'</pre> </div>';
                        $('#tab-preview').html(html);
                        SyntaxHighlighter.highlight();
                    })
                }
            },
            "response": function(requestId){
                var detail = Fiddler_Resource.getItem(requestId);
                var method = detail.method;
                if (method == 'POST') {
                    $('#tab-response').html("can't show POST request response");
                    return true;
                }; 
                Fiddler_Resource.getContent(requestId).then(function(content){
                    content = content || "";
                    content = Fiddler.encode4Html(content);
                    $('#tab-response').html(content)
                })
            },
            "beautify": function(requestId){
                var detail = Fiddler_Resource.getItem(requestId);
                var type = detail.type;
                if (type == 'script') {
                    Fiddler_Resource.getContent(requestId).then(function(content){
                        content = content || "";
                        content = Fiddler.encode4Html(js_beautify(content));
                        var html = '<div class="content" style="padding-left:0"> <pre class="brush: js">'+ (content) +'</pre> </div>';
                        $('#tab-beautify').html(html);
                        SyntaxHighlighter.highlight();
                    })
                }else if(type == 'stylesheet'){
                    Fiddler_Resource.getContent(requestId).then(function(content){
                        content = content || "";
                        content = Fiddler.encode4Html(css_beautify(content));
                        var html = '<div class="content" style="padding-left:0"> <pre class="brush: css">'+ (content) +'</pre> </div>';
                        $('#tab-beautify').html(html);
                        SyntaxHighlighter.highlight();
                    })
                }
            }
        }
        var showTypeList = {
            "image": ["headers", "preview"],
            "script": ["headers", "preview", "response", "beautify"],
            "stylesheet": ["headers", "preview", "response", "beautify"],
            "main_frame": ["headers", "response"],
            "sub_frame": ["headers", "response"],
            "xmlhttprequest": ["headers", "response"]
        };
        Fiddler.bindEvent($('#requestList'), {
            'tbody tr td.url': function(){
                var tr = $(this).parents('tr');
                $('#autoResponseList').removeClass('open');  
                currentEl && currentEl.removeClass('info');
                tr.addClass('info');
                currentEl = tr;
                var detailEl = $('#requestDetail');
                if (!detailEl.hasClass('open')) {
                    detailEl.addClass('open');
                };
                detailEl.find('.nav-tabs li').removeClass('active').hide();
                detailEl.find('.nav-tabs li[data-type="'+detaultTab+'"]').addClass('active').show();
                $('#tab-headers,#tab-preview,#tab-response,#tab-beautify').removeClass('active').html('');
                var requestId = currentEl.attr('data-id');
                var detail = Fiddler_Resource.getItem(requestId);
                var showTypes = showTypeList[detail.type] || [];
                showTypes.forEach(function(item){
                    detailEl.find('.nav-tabs li[data-type="'+item+'"]').show();
                })
                var el = $('#tab-' + detaultTab).addClass('active').show();
                if (!el.html()) {
                    cbs[detaultTab] && cbs[detaultTab](requestId);
                };
            },
            'tbody tr a': function(e){
                e.stopPropagation();
            },
            'tbody tr td img.type': function(){
                $('#autoResponseList').addClass('open');
                $('#autoResponseList button.btn-add').trigger('click');
                var requestId = $(this).parents('tr').attr('data-id');
                var detail = Fiddler_Resource.getItem(requestId);
                var url = detail.url;
                $('#rulePattern').val(url);
            }
        });
        Fiddler.bindEvent($('#requestDetail'), {
            'i.icon-remove': function(){
                currentEl && currentEl.removeClass('info');
                $('#tab-headers,#tab-preview,#tab-response,#tab-beautify').html("");
                $('#requestDetail').removeClass('open');
            },
            '.nav-tabs li a': function(e){
                e.preventDefault();
                var li = $(this).parents('li');
                if (li.hasClass('active')) {
                    return true;
                };
                $('#requestDetail .nav-tabs li.active').removeClass('active');
                li.addClass('active');
                $('#requestDetail .tab-content .active').removeClass('active').hide();;
                var type = li.attr('data-type');
                var el = $('#tab-' + type).addClass('active').show();
                if (!el.html()) {
                    cbs[type] && cbs[type](currentEl.attr('data-id'));
                };
            },
            '#tab-headers .content>b': function(){
                var open = !$(this).hasClass('treeRight');
                var next = $(this).next();
                if (open) {
                    $(this).addClass('treeRight');
                    next.hide();
                }else{
                    $(this).removeClass('treeRight');
                    next.show();
                }
            }
        })
    }
    var hideTypes = {
        "string": [],
        "regexp": ["path"],
        "method": ["path"],
        "header": ["file", "path", "redirect"]
    }
    /**
     * auto response event
     * @return {[type]} [description]
     */
    function bindAutoResponseEvent(){
        Fiddler.bindEvent($('#autoResponseList'), {
            '.rule-edit-item a.btn-select': function(e){
                e.preventDefault();
                if ($(this).hasClass('disabled')) {
                    return false;
                };
                var menu = $(this).parents('.rule-edit-item').find('.dropdown-menu');
                var hide = menu.css('display') == 'none';
                if (hide) {
                    menu.slideDown();
                }else{
                    menu.slideUp();
                }
            },
            '#patternMenu li a': function(e){
                e.preventDefault();
                var type = $(this).attr('data-type');
                var hides = hideTypes[type] || [];
                var replaceA = $('#replaceMenu li a')
                replaceA.show();
                hides.forEach(function(item){
                    $('#replaceMenu li a[data-type="'+item+'"]').hide();
                });
                replaceA.each(function(){
                    var $this = $(this);
                    if ($this.css('display') != 'none') {
                        $('#ruleReplaceType').val($this.html());
                    };
                })
            },
            '.dropdown-menu li a': function(e){
                e.preventDefault();
                var value = $(this).html().trim();
                var edit = $(this).parents('.rule-edit-item');
                edit.find('input.rule-input').val(value);
                edit.find(".dropdown-menu").slideUp();
                var defaultValue = $(this).data('value');
                edit.find("input.rule-value").val(defaultValue);
            },
            'button.btn-add': function(){
                if ($(this).hasClass('disabled')) {
                    return false;
                };
                $('#autoResponseList .rule-list tbody tr').removeClass('info');
                setRuleEditEnable(true);
                $('#autoResponseList .rule-pattern').val('StringToMatch[6]').select();
                $('#autoResponseList .rule-replace').val('');
                $('#rulePatternType').val('String');
                $('#ruleReplaceType').val('File');
            },
            '.btn-save': function(){
                if ($(this).hasClass('disabled')) {
                    return false;
                };
                var data = {
                    patternType: $('#rulePatternType').val().trim(),
                    pattern: $('#rulePattern').val().trim(),
                    replaceType: $('#ruleReplaceType').val().trim(),
                    replace: $('#ruleReplace').val().trim(),
                    enable: true
                }
                if (!data.pattern) {
                    return $('#rulePattern').focus();
                };
                if (!data.replace && data.replaceType != 'Cancel') {
                    return $('#ruleReplace').focus();
                };
                var tr = $('#autoResponseList .rule-list tbody tr.info');
                if (tr.length) {
                    tr.find('p.pattern').html(data.patternType + ": " + data.pattern);
                    tr.find('p.replace').html(data.replaceType + ": " + data.replace);
                    tr.attr('data-info', JSON.stringify(data));
                }else{
                    var item = $(getItemRuleHtml(data));
                    item.attr('data-info', JSON.stringify(data));
                    item.appendTo($('#autoResponseList .rule-list tbody'));
                }
                $('#rulePattern').val('');
                $('#ruleReplace').val('');
                saveRules();
            },
            '.rule-check': function(){
                saveRules();
            },
            '.icon-edit': function(e){
                e.preventDefault();
                if ($(this).hasClass('disabled')) {
                    return false;
                };
                var tr = $(this).parents('tr');
                $('#autoResponseList .rule-list tbody tr').removeClass('info');
                tr.addClass('info');
                var data = JSON.parse(tr.attr('data-info'));
                $('#rulePatternType').val(data.patternType);
                $('#rulePattern').val(data.pattern);
                $('#ruleReplaceType').val(data.replaceType);
                $('#ruleReplace').val(data.replace);
            },
            '.icon-remove': function(e){
                if ($(this).hasClass('disabled')) {
                    return false;
                };
                var tr = $(this).parents('tr');
                tr.remove();
                saveRules();
            },
            //select file or path
            '#ruleReplace': function(){
                if ($(this).hasClass('disabled')) {
                    return false;
                };
                var type = $('#ruleReplaceType').val();
                if (type != 'File' && type != 'Path') {
                    return true;
                };
                var path = openFiles(type);
                if (path && path != '/') {
                    path = "file://" + path;
                    $(this).val(path);
                };
            }
        });
        $(document.body).click(function(e){
            var target = e.target;
            $('#replaceMenu,#patternMenu').each(function(){
                var item = $(this).parents('.rule-edit-item');
                if ($.contains(item[0], target)) {
                    return true;
                }else{
                    $(this).slideUp();
                }
            });
        })
        $('#autoResponseBtn').click(function(){
            $('#autoResponseList').toggleClass('open');  
        });
        $('#enableAutoResponse').click(function(){
            var checked = !!this.checked;
            Fiddler_Config.setConfig("enable_auto_response", checked);
            setRuleEditEnable(checked);
            setRuleListEnable(checked);
            $('#autoResponseList button.btn-add')[checked ? "removeClass" : "addClass"]("disabled");
            saveRules();
        });
    }
    var userAgents = {
        "firefox-windows": "",
        "firefox-mac": "",
        "chrome-windows": "",
        "chrome-mac": "",
        "chrome-mobile": "",
        "chrome-tablet": "",
        "iphone-ios5": "",
        "ipad-ios5": "",
        "ie10": "",
        "ie9": "",
        "ie8": "",
        "ie7": "",
        "ie6": ""
    };
    
    function setRuleEditEnable(enable){
        var ruleEdit = $('#autoResponseList .rule-edit');
        var input = ruleEdit.find('.rule-input,.rule-value');
        var btn = ruleEdit.find('.btn-select');
        var btnSave = ruleEdit.find('.btn-save');
        btn[!enable ? "addClass" : "removeClass"]("disabled");
        btnSave[!enable ? "addClass" : "removeClass"]("disabled");
        input.each(function(){
            this.disabled = !enable;
        })
    }
    function setRuleListEnable(enable){
        var list = $('#autoResponseList .rule-list tbody tr');
        list[enable ? "removeClass" : "addClass"]("disabled");
        list.each(function(){
            $(this).find('input.rule-check')[0].disabled = !enable;
            $(this).find('i.icon').each(function(){
                $(this)[enable ? "removeClass" : "addClass"]("disabled");
            })
        });
    }
    function saveRules(){
        var rules = [];
        $('#autoResponseList .rule-list tbody tr').each(function(){
            var data = JSON.parse($(this).attr('data-info') || "{}");
            var checked = $(this).find('.rule-check')[0].checked;
            data.enable = checked;
            rules.push(data);
        });
        var enable = $('#enableAutoResponse')[0].checked;
        Fiddler_Rule.saveRules(rules, enable);
        var checked = $('#disabledCacheInput')[0].checked;
        if (checked) {
            Fiddler_Rule.disableCacheRule();
        };
    }
    function initData(){
        Fiddler_Config.init();
        var rules = Fiddler_Config.getRules();
        var parent = $('#autoResponseList .rule-list tbody');
        rules.forEach(function(item){
            var html = $(getItemRuleHtml(item));
            html.attr('data-info', JSON.stringify(item));
            html.appendTo(parent);
        });
        var disableCache = Fiddler_Config.getConfig("disable_cache");
        if (disableCache) {
            $('#disabledCacheInput')[0].checked = true;
        };
        var enable = Fiddler_Config.getConfig("enable_auto_response");
        if (!enable) {
            $('#enableAutoResponse')[0].checked = false;
            $('#enableAutoResponse').trigger('click');
            $('#enableAutoResponse').trigger('click');
        }else{
            saveRules();
        }
    }
    /**
     * open file by npapi
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    function openFiles(type){
        try{
            var FindFile =  document.getElementById("chromefiddler");
            var path = FindFile.OpenFileDialog("/", type.toLowerCase());
            return path;
        }catch(e){
            return '';
        }
    }
    function clearRequest(){
        $('#requestList tbody').html('');
        $('#requestDetail').removeClass('open');
        Fiddler_Resource.clearResource();
    }
    function initTools(){
        Fiddler.bindEvent($('#toolsMenu'), {
            'a.clear': function(e){
                e.preventDefault();
                clearRequest();
            },
            'input.disable-cache': function(e){
                var checked = this.checked;
                Fiddler_Config.setConfig("disable_cache", checked);
                saveRules();
            }
        })
    }
    function initFilter(){
        Fiddler.bindEvent($('#filterMenu'), {
            'li a': function(e){
                e.preventDefault();
                var type = $(this).data('type');
                var html = $(this).html();
                $('#filterMenuTitle span').html('Filter ( '+html+' )');
                $('#filterMenu li').removeClass('disabled');
                var li = $(this).parents('li');
                li.addClass('disabled');
                var list = $('#requestList tbody tr');
                if (type == '') {
                    list.show();
                }else{
                    list.each(function(){
                        var $this = $(this);
                        var trtype = $this.data('type');
                        if (type == trtype) {
                            $this.show();
                        }else{
                            $this.hide();
                        }
                    })
                }
            }
        })
    }
    /**
     * read file error
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function fileErrorCallback(data){
        var file = data.data;
        alert("Fiddler: read file `"+ file + "` data error, please check");
    }
    function getContentFromDevTools(){
        chrome.runtime.onMessage.addListener(function(request) {
            var method = request.method;
            if (method == 'requestContent') {
                Fiddler_Resource.setContent(request.url, request.content);
            };
        });
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.method == 'token' && request.value == 'devtools') {
                sendResponse({
                    result: "ok"
                })
            };
        });
    }
    function init(){
        Fiddler_Rule.resouceListening();
        Fiddler_Rule.fileErrorListening(fileErrorCallback);
        Fiddler_Event.init(function(){
            return $('#disabledCacheInput')[0].checked;
        });
        bindCompleteEvent();
        bindRequestEvent();
        bindAutoResponseEvent();
        initData();
        initFilter();
        initTools();
        getContentFromDevTools();
        /*chrome.browsingData.remove({
          "since": (new Date()).getTime() - 1000 * 60 * 60 * 24 * 7
        }, {
          "cache": true,
        }, function(){
            
        });*/
    }
    init();
})
