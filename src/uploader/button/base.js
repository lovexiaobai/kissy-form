/**
 * @fileoverview �ļ��ϴ���ťbase
 * @author: ��Ӣ(����)<daxingplay@gmail.com>, ��ƽ�����ӣ�<minghe36@126.com>
 **/
KISSY.add(function(S, Node, Base) {
    var EMPTY = '',
        LOG_PREFIX = '[AjaxUploader-Button] ',
        $ = Node.all;

    /**
     * �ļ��ϴ���ť
     * @class Button
     * @constructor
     * @param {Object} config ���ö���
     */
    function Button(target, config) {
        var self = this;
        //�����ʼ��
        Button.superclass.constructor.call(self, config);
        self.set('target', $(target));
    }

    S.mix(Button, {
        //֧�ֵ��¼�
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
         * ����
         * @return {Object} Button��ʵ��
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
         * ��ʾ��ť
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
         * ���ذ�ť
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
         * ���ð�ť
         * @return {Object} Button��ʵ��
         */
        _reset : function() {
            var self = this,
                inputContainer = self.get('inputContainer');
            //�Ƴ����ϴ�������
            $(inputContainer).remove();
            self.set('inputContainer', EMPTY);
            self.set('fileInput', EMPTY);
            //���´������ϴ���
            self._createInput();
            return self;
        },
        /**
         * �������صı��ϴ���
         * @return {HTMLElement} �ļ��ϴ�������
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
            //��body��ӱ��ļ��ϴ���
            $(inputContainer).appendTo(target);
            fileInput = $(inputContainer).children('input');
            // TODO: ������ѡ�ϴ�
            // multiple && DOM.attr('multiple', 'multiple');
            //�ϴ����ֵ�ı�󴥷�
            $(fileInput).on('change', self._changeHandler, self);
            //DOM.hide(fileInput);
            self.set('fileInput', fileInput);
            self.set('inputContainer', inputContainer);
            // self.resetContainerCss();
            return inputContainer;
        },
        /**
         * �ļ��ϴ����ֵ�ı�ʱ����
         * @param {Object} ev �¼�����
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
            // change��֮��reset��ť����ֹѡ��ͬһ���ļ��޷�����change�¼�
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
             * ��Ӧ�ı��ϴ���
             * @type HTMLElement
             */
            fileInput: {
                value: EMPTY
            },
            inputContainer: {
                value: EMPTY
            },
            /**
             * ���صı��ϴ����ģ��
             * @type String
             */
            tpl : {
                value : '<div class="ks-ajax-uploader-input-container"><input type="file" name="{name}" hidefoucs="true" class="ks-ajax-uploader-input" /></div>'
            },
            /**
             * ���صı��ϴ����nameֵ
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
             * �Ƿ����,falseΪ����
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
             * ��ʽ
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
