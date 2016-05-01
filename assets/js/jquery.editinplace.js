/*
 * jQuery.editInPlace - jQuery in place editor
 *
 * Copyright 2014, uxMine
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * Date: 2/11/2014
 * @author Tarafder Ashek E Elahi
 * @version 1.0
 * Depends:
 *   jquery.js
 *
 */

;
(function ($) {
    var defaults = {
        minimize: undefined,
        beforeRestore: undefined,
        restore: undefined,
        beforePopout: undefined,
        popout: undefined
    };

    function closePopup($dd){
        $dd.removeClass("open");
        $dd.empty();
    }
    function submitToServer(target, attributes, method, $dd){
        method = method || 'get';

        $.ajax({
            url: target,
            data: attributes,
            type: method,
            success: function(data) {
                // show some notification if you want
                //console.log(data);
            }
        });
        if($dd && $dd.length){
            closePopup($dd);
        }
    }
    (function($){
        $.fn.setCursorToTextEnd = function() {
            $initialVal = this.val();
            this.val('');
            this.val($initialVal);
        };
    })(jQuery);

    var methods = {
        init: function (options) {

            return this.each(function () {

                var $this = $(this);

                var data = $this.data('editInPlace');
                $this.options = $.extend({}, defaults, options);

                // If the plugin hasn't been initialized yet
                if (!data) {
                    $this.data('editInPlace', $this);
                }
                $('body').delegate('.editable', 'click', function(e){
                    var isLoadedFromHtml = false;
                    var $editable = $(this);
                    var type = $editable.data('editable-type');
                    var target = $editable.data('target');
                    var method= $editable.data('method') || "get";
                    var entries = $editable.data('editable-entries');
                    if(typeof entries=="string"){
                        // maybe its a jquery selector
                        entries = $(entries).clone().children();
                        isLoadedFromHtml = true;
                    }

                    var attributes = $editable.data('editable-attribute');
                    var defaults = $editable.data('editable-default');
                    var $dd = $('body').find('#editable_dropdown');

                    var $focusable; // will be set later

                    if($dd.length <1){
                        $dd = $('<div class="dropdown-menu-holder" id="editable_dropdown"></div>').appendTo('body');
                    }
                    $dd.empty();
                    switch(type)
                    {
                        case 'text':
                            var $ddm = $('<ul class="editable-dropdown-menu"></ul>').appendTo($dd);
                            var $txt = $('<input type="text" class="item text-input" value="" />').val(defaults);
                            $('<li class="pad tac"></li>').append($txt).appendTo($ddm);
                            $('<li class="pad action tac"></li>').append('<button class="btn btn-mini editable-save">Save</button> or <a href="javascript:;" class="editable-cancel">Cancel</a>').appendTo($ddm);
                            $ddm.click(function(e){
                                e.stopPropagation();
                            });
                            $txt.keyup(function(ev) {
                                if (ev.which === 13) {
                                    var txt = $txt.val();
                                    if($.trim(txt)==""){
                                        $editable.html('<span class="undefined">Not set</span>');
                                    } else{
                                        $editable.html(txt);
                                    }
                                    $editable.data('editable-default', txt);
                                    var attrs = $.extend({}, attributes);
                                    attrs["input"]=txt;
                                    submitToServer(target, attrs, method, $dd);
                                }
                            });
                            $ddm.find('.editable-save').bind("click", function(){
                                var txt = $txt.val();
                                if($.trim(txt)==""){
                                    $editable.html('<span class="undefined">Not set</span>');
                                } else{
                                    $editable.html(txt);
                                }
                                $editable.data('editable-default', txt);
                                var attrs = $.extend({}, attributes);
                                attrs["input"]=txt;
                                submitToServer(target, attrs, method, $dd);
                            });
                            $ddm.find('.editable-cancel').bind("click", function(){
                                closeDropdown($dd);
                                return false;
                            });
                            $focusable= $txt;

                            break;
                        case 'bigtext':
                            var $ddm = $('<ul class="editable-dropdown-menu"></ul>').appendTo($dd);
                            var $txt = $('<textarea class="item text-input" />').val(defaults);
                            $('<li class="pad tac"></li>').append($txt).appendTo($ddm);
                            $('<li class="pad action tac"></li>').append('<button class="btn btn-mini editable-save">Save</button> or <a href="javascript:;" class="editable-cancel">Cancel</a>').appendTo($ddm);
                            $ddm.click(function(e){
                                e.stopPropagation();
                            });
                            $ddm.find('.editable-save').bind("click", function(){
                                var txt = $txt.val();
                                if($.trim(txt)==""){
                                    $editable.html('<span class="undefined">Not set</span>');
                                } else{
                                    $editable.html(txt);
                                }
                                $editable.data('editable-default', txt);
                                var attrs = $.extend({}, attributes);
                                attrs["input"]=txt;
                                submitToServer(target, attrs, method, $dd);
                            });
                            $ddm.find('.editable-cancel').bind("click", function(){
                                closeDropdown($dd);
                                return false;
                            });
                            $focusable= $txt;

                            break;
                        case 'selection':
                            var $ddm = $('<ul class="editable-dropdown-menu"></ul>').appendTo($dd);
                            $.each(entries, function(i, val){
                                if(isLoadedFromHtml){
                                    val = $("<div/>").append($(val).clone()).html();
                                }
                                var $a = $('<a href="javascript:;" class="item"></a>').data({"id": i, "val": val}).html(val);
                                $('<li></li>').append($a).appendTo($ddm);
                            });
                            $ddm.one("click", ".item", function(){
                                $editable.html($(this).data("val"));
                                $editable.data('editable-default', $(this).data("id"));
                                var attrs = $.extend({}, attributes);
                                attrs[$(this).data("id")]=$(this).data("val");
                                submitToServer(target, attrs, method);
                            });

                            break;
                        case 'multiple':
                            var $ddm = $('<ul class="editable-dropdown-menu"></ul>').addClass(type).appendTo($dd);
                            $.each(entries, function(i, val){
                                var $chk = $('<input type="checkbox" class="item" />').val(i).data({"id": i, "val": val});

                                if($.inArray(i, defaults) >-1){
                                    $chk.attr("checked", "checked");
                                }
                                var $lbl = $("<label></label>").append($chk).append(" " + val);
                                $('<li class="pad"></li>').append($lbl).appendTo($ddm);
                            });
                            $('<li class="pad action tac"></li>').append('<button class="btn btn-mini editable-save">Save</button> or <a href="javascript:;" class="editable-cancel">Cancel</a>').appendTo($ddm);
                            $ddm.click(function(e){
                                e.stopPropagation();
                            });
                            $ddm.find('.editable-save').bind("click", function(){
                                var $chks = $ddm.find("input:checked");
                                var txt = "";
                                var arr = []
                                $chks.each(function(){
                                    arr[arr.length] = $(this).val();
                                });
                                txt = arr.join(", ");

                                if($.trim(txt)==""){
                                    $editable.html('<span class="undefined">Not set</span>');
                                } else{
                                    $editable.html(txt);
                                }
                                var attrs = $.extend({}, attributes);
                                attrs['selected']= JSON.stringify(arr);
                                $editable.data('editable-default', arr);
                                submitToServer(target, attrs, method, $dd);
                            });
                            $ddm.find('.editable-cancel').bind("click", function(){
                                closeDropdown($dd)
                                return false;
                            });

                            break;
                        case 'date':
                            //execute code block 2
                            var $ddm = $('<div class="editable-dropdown-menu no-padding"></div>').addClass(type).appendTo($dd);
                            $ddm.datepicker({
                                defaultDate: defaults,
                                onSelect: function(dateText, inst) {
                                    if($.trim(dateText)==""){
                                        $editable.html('<span class="undefined">Not set</span>');
                                    } else{
                                        $editable.html(dateText);
                                    }
                                    $editable.data('editable-default', dateText);
                                    var attrs = $.extend({}, attributes);
                                    attrs["input"]=dateText;
                                    submitToServer(target, attrs, method, $dd);
                                }
                            });
                            $ddm.click(function(e){
                                e.stopPropagation();
                            });
                            break;
                        default:
                            return false;
                    }
                    $dd.addClass("open");
                    var left = $(this).offset().left;
                    var top = $(this).offset().top + $(this).height();
                    var dw = $ddm.outerWidth(true);
                    if(left+dw + 20 > $(window).width()){
                        left = left - dw + $(this).width();
                    }
                    $ddm.css({"left": left + "px", "top": top + "px"});
                    if($focusable && $focusable.length){
                        $focusable.focus();
                        $focusable.setCursorToTextEnd();
                    }
                    $("body").one("click", function(){
                        closeDropdown($dd);
                    });
                    return false;
                });


            });
        },
        destroy: function () {
            return this.each(function () {

                var $this = $(this).data('editInPlace');
                if (!$this)
                    return;

                try {


                }
                catch (err) {
                    alert(err.message);
                }
                // other destroy routines

            })
        }

    };

    $.fn.editInPlace = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.editInPlace');
        }
    };
})(jQuery);
