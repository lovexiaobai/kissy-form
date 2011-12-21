/**
 * @fileoverview 文件上传按钮
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add(function(S, DOM, Base, Event) {
    var EMPTY = '',FILE = 'file',ID = 'id',
        //控制台
        console = console || S,LOG_PREFIX = '[ajaxUploader-button]:';

    /**
     * 文件上传按钮
     * @class Button
     * @constructor
     * @param {String} target 目标元素
     * @param {Object} config 配置对象
     */
    function Button(target, config) {
        var self = this;
        self.set('target', $(target));
        //超类初始化
        Button.superclass.constructor.call(self, config);
    }

    //继承于KISSY.Base
    S.extend(Button, Base);
    S.mix(Button, {
            //模板
            tpl : {
                DEFAULT:'<div class="ks-ajax-uploader-input-container"><input type="file" id="{name}" name="{name}" hidefoucs="true" class="ks-ajax-uploader-input" /></div>',
                URLS_INPUT : '<input type="hidden" value="" name="{name}" class="J_UploaderUrlsInput">'
            },
            //支持的事件
            event : { RENDER : 'render', CHANGE : 'change',MOUSEOVER : 'mouseover',MOUSEOUT : 'MOUSEOUT',FOCUS : 'focus',BLUR : 'blur' },
            /**
             * 获取文件名称（从表单域的值中提取）
             * @param {String} path 文件路径
             * @return {String}
             */
            getFileName : function(path) {
                return path.replace(/.*(\/|\\)/, "");
            },
            /**
             * 获取文件扩展名
             * @param fileName
             * @return {String}
             */
            getExt : function(fileName) {
                return -1 !== fileName.indexOf('.') && fileName.replace(/.*[.]/, '') || '';
            }
        });
    /**
     * 参数
     */
    Button.ATTRS = {
        /**
         * 隐藏的表单上传域的模板
         * @type String
         */
        tpl : {
            value : Button.tpl.DEFAULT
        },
        /**
         * 隐藏的文件路径隐藏域模板
         * @type String
         */
        urlsInputTpl : {
            value : Button.tpl.URLS_INPUT
        },
        /**
         * 隐藏的表单上传域的name值
         * @type String
         */
        name : {
            value : 'fileInput',
            setter : function(v) {
                if (this.fileInput) {
                    DOM.attr(this.fileInput, 'name', v);
                }
                return v;
            }
        },
        /**
         * 多个文件时使用的分隔符
         * @type String
         */
        urlDivision : {
            value : ','
        },
        /**
         * 是否开启多选支持
         * @type Boolean
         */
        multiple : {
            value : false
        },
        /**
         * 是否可用,false为可用
         * @type Boolean
         */
        disabled : {
            value : false,
            setter : function(v) {
                var self = this,target = self.target,cls = self.get('cls').disabled,fileInput = self.fileInput;
                if (v) {
                    DOM.addClass(target, cls);
                    DOM.hide(fileInput);
                } else {
                    DOM.removeClass(target, cls);
                    DOM.show(fileInput);
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
                hover : 'uploader-button-hover',
                focus : 'uploader-button-focus',
                disabled : 'uploader-button-disabled'
            }
        }
    };
        
    S.extend(Button, Base, /** @lends Button.prototype*/{
    	/**
         * 运行
         * @return {Object} Button的实例
         */
        render : function() {
            var self = this,
            	target = self.get('target'),
            	render = self.fire(Button.event.beforeRender);
            if(render === false){
            	S.log(LOG_PREFIX + 'button render was prevented.')
            	return false;
            }else{
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
        show : function(){
            var self = this,
            	target = self.target,
            	input = self.get('fileInput'),
            	show = self.fire(Button.event.beforeShow);
            if(show === false){
            	S.log(LOG_PREFIX + 'show button event was prevented.');
            }else{
            	$(target).show();
                $(input).show();
                self.fire(Button.event.afterShow);
                S.log(LOG_PREFIX + 'button showed.');
            }
        },
        /**
         * 隐藏按钮
         */
        hide : function(){
            var self = this,
            	target = self.target,
            	input = self.get('fileInput'),
            	hide = self.fire(Button.event.beforeHide);
            if(hide === false){
            	S.log(LOG_PREFIX + 'hide button event was prevented.');
            }else{
            	$(target).hide();
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
            if (!S.isString(name) || !S.isString(tpl)){
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
            fileInput = $(inputContainer, 'input').children()[0];
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
            	value = $(fileInput).val(),
            	fileName;
            if (value == EMPTY){
            	S.log(LOG_PREFIX + 'No file selected.');
            	return false;
            }
            self.fire(self.event.CHANGE, {
            	'eventTarget': ev
            });
            // change完之后reset按钮，防止选择同一个文件无法触发change事件
            self._reset();
        }
    },{
    	ATTRS : /** @lends Button */{
    		/**
    		 * target
    		 */
    		target: {
    			value: null
    		},
	        /**
	         * 是否开启多选支持
	         * @type Boolean
	         */
	        multiple : {
	            value : false
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
	                var self = this,
	                	target = self.target,
	                	cls = self.get('cls').disabled,
	                	fileInput = self.fileInput;
	                if (v) {
	                    $(target).addClass(cls);
	                    $(fileInput).hide();
	                } else {
	                    $(target).removeClass(cls);
	                    $(fileInput).show();
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
