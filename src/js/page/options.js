$(function(){
    "use strict";
    /**
     * get item html
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function getItemHtml(data){
        var urlDetail = Fiddler.getUrlDetail(data.url);
        if (["http:", "https:"].indexOf(urlDetail.protocol) == -1) {
            return false;
        };
        var responseHeaders = data.responseHeaders || [];
        var size = 0;
        responseHeaders.some(function(item){
            if (item.name == 'Content-Length') {
                size = item.value;
                return true;
            };
        })
        var html = [
            '<tr data-type="'+data.type+'" data-id="'+data.requestId+'" data-pid="'+data.parentRequestId+'">',
                '<td>&nbsp;&nbsp;<img src="'+getTypeFile(data.type)+'">'+'</td>',
                '<td>'+data.statusCode+'</td>',
                '<td>'+Fiddler.truncate(urlDetail.path, 50)+'</td>',
                '<td>'+urlDetail.host+'</td>',  
                '<td>'+data.ip+'</td>',
                '<td>'+data.method+'</td>',
                '<td>'+(Fiddler.getHumanSize(size) || '-')+'</td>',
            '</tr>'
        ].join('');
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
     * hide prefix frames
     * @return {[type]} [description]
     */
    function hideFrames(){
        $('#requestList table tr[data-pid="0"]').each(function(){
            var self = $(this).addClass('info');
            var requestId = self.attr('data-id');
            $('#requestList table tr[data-pid="'+requestId+'"]').hide();
        })
    }
    /**
     * a request complete event
     * @return {[type]} [description]
     */
    function bindCompleteEvent(){
        var table = $('#requestList table tbody');
        Fiddler_Resource.on("onCompleted", function(detail){
            var data = detail.data;
            if (data.type == 'main_frame') {
                //hideFrames();
            };
            var html = getItemHtml(data);
            if (html) {
                $(html).appendTo(table);
                $('#requestList')[0].scrollTop = 1000000;
            };
        })
    }
    function getItemRuleHtml(pattern, replace, checked){
        var html = [
            '<tr>',
                '<td><input type="checkbox" name="ruleCheck" '+(checked ? "checked" : "")+' class="rule-check" /></td>',
                '<td><p class="pattern">'+pattern+'</p></td>',
                '<td><p class="replace">'+replace+'</p></td>',
                '<td><i class="icon icon-edit"></i> <i class="icon icon-remove"></i></td>',
            '</tr>'
        ].join('');
        return html;
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
            '.dropdown-menu li a': function(e){
                e.preventDefault();
                var value = $(this).html().trim();
                var edit = $(this).parents('.rule-edit-item');
                edit.find('input.rule-input').val(value);
                edit.find(".dropdown-menu").slideUp();
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
                var patternInput = $('#patternInput').val().trim();
                if (!patternInput) {
                    return $('#patternInput').focus();
                };
                var replaceInput = $('#replaceInput').val().trim();
                if (!replaceInput) {
                    return $('#replaceInput').focus();
                };
                var tr = $('#autoResponseList .rule-list tbody tr.info');
                if (tr.length) {
                    tr.find('p.pattern').html(patternInput);
                    tr.find('p.replace').html(replaceInput);
                }else{
                    var html = getItemRuleHtml(patternInput, replaceInput, true);
                    $(html).appendTo($('#autoResponseList .rule-list tbody'));
                }
                $('#patternInput').val('');
                $('#replaceInput').val('');
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
                var pattern = tr.find('p.pattern').html();
                var replace = tr.find('p.replace').html();
                $('#patternInput').val(pattern);
                $('#replaceInput').val(replace);
            },
            '.icon-remove': function(e){
                var tr = $(this).parents('tr');
                tr.remove();
                saveRules();
            }
        })
        $('#autoResponseBtn').click(function(){
            $('#autoResponseList').toggle();  
        });
        $('#enableAutoResponse').click(function(){
            var checked = !!this.checked;
            Fiddler_Config.setConfig("enable_auto_response", checked);
            setRuleEditEnable(checked);
            setRuleListEnable(checked);
            $('#autoResponseList button.btn-add')[checked ? "removeClass" : "addClass"]("disabled");
        });

    }
    function setRuleEditEnable(enable){
        var ruleEdit = $('#autoResponseList .rule-edit');
        var input = ruleEdit.find('.rule-input');
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
            var $this = $(this);
            var pattern = $this.find('p.pattern').html();
            var replace = $this.find('p.replace').html();
            var enable = $this.find('.rule-check')[0].checked;
            rules.push([pattern, replace, enable]);
        });
        var enable = $('#enableAutoResponse')[0].checked;
        Fiddler_Rule.saveRules(rules, enable);
    }
    function initData(){
        Fiddler_Config.init();
        var rules = Fiddler_Config.getRules();
        var parent = $('#autoResponseList .rule-list tbody');
        rules.forEach(function(item){
            var html = getItemRuleHtml(item.pattern, item.replace, item.enable);
            $(html).appendTo(parent);
        });
        var enable = Fiddler_Config.getConfig("enable_auto_response");
        if (!enable) {
            $('#enableAutoResponse')[0].checked = false;
            setRuleEditEnable(false);
            setRuleListEnable(false);
        }else{
            saveRules();
        }
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
        bindAutoResponseEvent();
        initData();
        initFilter();
    }
    init();
})