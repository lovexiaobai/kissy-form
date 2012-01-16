/**
 * @fileoverview 文件上传按钮base
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('form/uploader/button/base',function(S, Node, Base) {
    var EMPTY = '',
        LOG_PREFIX = '[AjaxUploader-Button] ',
        $ = Node.all;

    /**
     * 文件上传按钮
     * @class Button
     * @constructor
     * @param {Object} config 配置对象
     */
    function Button(target, config) {
        var self = this;
        //超类初始化
        Button.superclass.constructor.call(self, config);
        self.set('target', $(target));
    }

    S.mix(Button, {
        //支持的事件
        event : {
            'beforeShow': 'beforeShow',
            'afterShow': 'afterShow',
            'beforeHide': 'beforeHide',
            'afterHide': 'afterHide',
            'beforeRender' : 'beforeRender',
            'afterRender' : 'afterRender',
            'CHANGE' : 'change'
        }
    });

    S.extend(Button, Base, /** @lends Button.prototype*/{
        /**
         * 运行
         * @return {Object} Button的实例
         */
        render : function() {
            var self = this,
                target = self.get('target'),
                render = self.fire(Button.event.beforeRender);
            if (render === false) {
                S.log(LOG_PREFIX + 'button render was prevented.')
                return false;
            } else {
                if (target == null) {
                    S.log(LOG_PREFIX + 'Cannot find target!');
                    return false;
                }
                self._createInput();
                self.fire(Button.event.afterRender);
                S.log(LOG_PREFIX + 'button was rendered just now.');
                return self;
            }
        },
        /**
         * 显示按钮
         */
        show : function() {
            var self = this,
                target = self.get('target'),
                disableCls = self.get('cls').disabled,
                input = self.get('fileInput'),
                show = self.fire(Button.event.beforeShow);
            if (show === false) {
                S.log(LOG_PREFIX + 'show button event was prevented.');
            } else {
                // $(target).show();
                $(target).removeClass(disableCls);
                $(input).show();
                self.fire(Button.event.afterShow);
                S.log(LOG_PREFIX + 'button showed.');
            }
        },
        /**
         * 隐藏按钮
         */
        hide : function() {
            var self = this,
                target = self.get('target'),
                disableCls = self.get('cls').disabled,
                input = self.get('fileInput'),
                hide = self.fire(Button.event.beforeHide);
            if (hide === false) {
                S.log(LOG_PREFIX + 'hide button event was prevented.');
            } else {
                // $(target).hide();
                $(target).addClass(disableCls);
                $(input).hide();
                self.fire(Button.event.afterHide);
                S.log(LOG_PREFIX + 'button showed.');
            }
        },
        /**
         * 重置按钮
         * @return {Object} Button的实例
         */
        _reset : function() {
            var self = this,
                inputContainer = self.get('inputContainer');
            //移除表单上传域容器
            $(inputContainer).remove();
            self.set('inputContainer', EMPTY);
            self.set('fileInput', EMPTY);
            //重新创建表单上传域
            self._createInput();
            return self;
        },
        /**
         * 创建隐藏的表单上传域
         * @return {HTMLElement} 文件上传域容器
         */
        _createInput : function() {
            var self = this,
                target = self.get('target'),
                name = self.get('name'),
                tpl = self.get('tpl'),
                multiple = self.get('multiple'),
                html,
                inputContainer,
                fileInput;
            if (!S.isString(name) || !S.isString(tpl)) {
                S.log(LOG_PREFIX + 'No name or tpl specified.');
                return false;
            }
            html = S.substitute(tpl, {
                'name' : name
            });
            // TODO: inputContainer = DOM.create(html);
            inputContainer = $(html);
            //向body添加表单文件上传域
            $(inputContainer).appendTo(target);
            fileInput = $(inputContainer).children('input');
            // TODO: 开启多选上传
            // multiple && DOM.attr('multiple', 'multiple');
            //上传框的值改变后触发
            $(fileInput).on('change', self._changeHandler, self);
            //DOM.hide(fileInput);
            self.set('fileInput', fileInput);
            self.set('inputContainer', inputContainer);
            // self.resetContainerCss();
            return inputContainer;
        },
        /**
         * 文件上传域的值改变时触发
         * @param {Object} ev 事件对象
         */
        _changeHandler : function(ev) {
            var self = this,
                fileInput = self.get('fileInput'),
                value = $(fileInput).val();
            if (value == EMPTY) {
                S.log(LOG_PREFIX + 'No file selected.');
                return false;
            }
            self.fire(Button.event.CHANGE, {
                files: ev.target.files,
                input: $(fileInput).clone().getDOMNode()
            });
            S.log(LOG_PREFIX + 'button change event was fired just now.');
            // change完之后reset按钮，防止选择同一个文件无法触发change事件
            self._reset();
        }
    }, {
        ATTRS : /** @lends Button */{
            /**
             * target
             */
            target: {
                value: null
            },
            /**
             * 对应的表单上传域
             * @type HTMLElement
             */
            fileInput: {
                value: EMPTY
            },
            inputContainer: {
                value: EMPTY
            },
            /**
             * 隐藏的表单上传域的模板
             * @type String
             */
            tpl : {
                value : '<div class="ks-ajax-uploader-input-container"><input type="file" name="{name}" hidefoucs="true" class="ks-ajax-uploader-input" /></div>'
            },
            /**
             * 隐藏的表单上传域的name值
             * @type String
             */
            name : {
                value : 'fileInput',
                setter : function(v) {
                    if (this.get('fileInput')) {
                        $(this.get('fileInput')).attr('name', v);
                    }
                    return v;
                }
            },
            /**
             * 是否可用,false为可用
             * @type Boolean
             */
            disabled : {
                value : false,
                setter : function(v) {
                    var self = this;
                    if (v) {
                        self.hide();
                    } else {
                        self.show();
                    }
                    return v;
                }
            },
            /**
             * 样式
             * @type Object
             */
            cls : {
                value : {
                    disabled : 'uploader-button-disabled'
                }
            }
        }
    });

    return Button;

}, {
    requires:[
        'node',
        'base'
    ]
});
