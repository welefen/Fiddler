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
                var queryUrl = Fiddler.queryUrl(detail.url);
                var flag = false;
                for(var name in queryUrl){
                    flag = true;
                    if (queryUrl[name] && queryUrl[name].join) {
                        queryUrl[name] = "[" + queryUrl[name].join(", ") + "]";
                    };
                };
                if (flag) {
                    detail.queryUrl = queryUrl;
                };
                var html = Fiddler.tmpl($('#headersTpl').html(), detail);
                $('#tab-headers').html(html)
            },
            "preview": function(requestId){
                var detail = Fiddler_Resource.getItem(requestId);
                var type = detail.type;
                if (type == 'image') {
                    var filename = detail.url.match(/[^\/]+$/)[0];
                    var html = Fiddler.tmpl($('#imagePreviewTpl').html(), {
                        url: detail.url,
                        filename: filename
                    });
                    $('#tab-preview').html(html)
                }else if(type == 'script'){
                    Fiddler_Resource.getContent(requestId).then(function(content){
                        //alert(content)
                    })
                }
            },
            "response": function(requestId){
                Fiddler_Resource.getContent(requestId).then(function(content){
                    content = Fiddler.encode4Html(content);
                    $('#tab-response').html(content)
                })
            },
            "beautify": function(requestId){

            }
        }
        var showTypeList = {
            "image": ["headers", "preview"],
            "script": ["headers", "preview", "response", "beautify"],
            "stylesheet": ["headers", "preview", "response", "beautify"],
            "main_frame": ["headers", "preview", "response", "beautify"],
            "sub_frame": ["headers", "preview", "response", "beautify"],
            "xmlhttprequest": ["headers", "response"]
        };
        Fiddler.bindEvent($('#requestList'), {
            'tbody tr': function(){
                currentEl && currentEl.removeClass('info');
                var $this = $(this).addClass('info');
                currentEl = $this;
                var detailEl = $('#requestDetail');
                if (!detailEl.hasClass('open')) {
                    detailEl.addClass('open');
                };
                detailEl.find('.nav-tabs li').removeClass('active').hide();
                detailEl.find('.nav-tabs li[data-type="'+detaultTab+'"]').addClass('active').show();
                ["headers", "preview", "response", "beautify"].forEach(function(item){
                    var el = $('#tab-'+item);
                    el.html('').removeClass('active');
                });
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
            }
        });
        Fiddler.bindEvent($('#requestDetail'), {
            'i.icon-remove': function(){
                currentEl && currentEl.removeClass('info');
                $('#requestDetail').removeClass('open')
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
                var tr = $(this).parents('tr');
                tr.remove();
                saveRules();
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
    function clearRequest(){
        $('#requestList tbody').html('');
        $('#requestDetail').hide();
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
    function init(){
        Fiddler_Rule.resouceListening();
        Fiddler_Event.init();
        bindCompleteEvent();
        bindRequestEvent();
        bindAutoResponseEvent();
        initData();
        initFilter();
        initTools();
    }
    init();
})