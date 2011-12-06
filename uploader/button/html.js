/**
 * @fileoverview 文件上传按钮 for html
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/

KISSY.add(function(S, Node, Button) {
    var EMPTY = '',
    	$ = Node.all,
    	LOG_PREFIX = '[AjaxUploader-Button] ';
    /**
     * 文件上传按钮
     * @class Button
     * @constructor
     * @param {Object} config 配置对象
     */
    function HtmlButton(config){
        var self = this;
        /**
         * 对应的表单上传域
         * @type HTMLElement
         */
        self.fileInput = EMPTY;
        /**
         * 表单上传域的容器
         * @type HTMLElement
         */
        self.inputContainer = EMPTY;
        //调用父类构造函数
        HtmlButton.superclass.constructor.call(self, config);
    }
    
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(HtmlButton, Button, /** @lends Button.prototype*/{
        	/**
             * 运行
             * @return {Object} Button的实例
             */
            render : function() {
                var self = this,
                	target = self.target,
                	render = self.fire(self.event.beforeRender);
                if(render === false){
                	S.log(LOG_PREFIX + 'button render was prevented.')
                	return false;
                }else{
                	if (target == null) {
	                    S.log(LOG_PREFIX + 'Cannot find target!');
	                    return false;
	                }
	                self._createInput();
	                self._createUrlsInput();
	                $(target).css('position', 'relative');
	                self.fire(HtmlButton.event.RENDER);
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
                	input = self.fileInput,
                	show = self.fire(self.event.beforeShow);
                if(show === false){
                	S.log(LOG_PREFIX + 'show button event was prevented.');
                }else{
                	$(target).show();
	                $(input).show();
	                self.fire(self.event.afterShow);
	                S.log(LOG_PREFIX + 'button showed.');
                }
            },
            /**
             * 隐藏按钮
             */
            hide : function(){
                var self = this,
                	target = self.target,
                	input = self.fileInput,
                	hide = self.fire(self.event.beforeHide);
                if(hide === false){
                	S.log(LOG_PREFIX + 'hide button event was prevented.');
                }else{
                	$(target).hide();
	                $(input).hide();
	                self.fire(self.event.afterHide);
	                S.log(LOG_PREFIX + 'button showed.');
                }
            },
            /**
             * 重置按钮
             * @return {Object} Button的实例
             */
            resetInput : function() {
                var self = this,
                	inputContainer = self.inputContainer;
                //移除表单上传域容器
                $(inputContainer).remove();
                self.inputContainer = EMPTY;
                self.fileInput = EMPTY;
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
                	name = self.get('name'),
                	tpl = self.get('tpl'),
                	multiple = self.get('multiple'),
                    html,
                    inputContainer,
                    fileInput;
                if (!S.isString(name) || !S.isString(tpl)){
                	return false;
                }
                html = S.substitute(tpl, {
                	'name' : name
                });
                // TODO inputContainer = DOM.create(html);
                inputContainer = $(html);
                //向body添加表单文件上传域
                $(inputContainer).appendTo(self.target);
                fileInput = $(inputContainer, 'input').children()[0];
                //TODO 开启多选上传
                // multiple && DOM.attr('multiple', 'multiple');
                //上传框的值改变后触发
                $(fileInput).on('change', self._changeHandler, self);
                //鼠标滑过/移开上传框时触发
                $(fileInput).on('mouseover mouseout', self._hoverHandler, self);
                //DOM.hide(fileInput);
                self.fileInput = fileInput;
                self.inputContainer = inputContainer;
                // self.resetContainerCss();
                return inputContainer;
            },
            /**
             * 重置下按钮对应的隐藏表单域容器的尺寸和偏移
             * @return {Object} Button的实例
             */
            // resetContainerCss : function() {
                // var self = this,container = self.inputContainer,target = self.target,
                    // css = {'width':DOM.width(target),'height':DOM.height(target)};
                // DOM.css(container, css);
                // return self;
            // },
            /**
             * 创建一个隐藏域，用于放上传文件的url路径
             * @return {HTMLElement}
             */
            // TODO 应该放在base里面
            _createUrlsInput : function() {
                var self = this,
                	target = self.target,
                	tpl = self.get('urlsInputTpl'),
                	name = self.get('urlsInputName'),
                	input;
                if (!S.isString(tpl) || !S.isString(name)){
                	return false;
                }
                // TODO Node 调用create方法
                input = DOM.create(tpl, {'name':name});
                // input = DOM.create(tpl, {'name':name});
                $(input).insertAfter(target);
                return self.urlsInput = input;
            },
            /**
             * 文件上传域的值改变时触发
             * @param {Object} ev 事件对象
             */
            _changeHandler : function(ev) {
                var self = this,
                	fileInput = self.fileInput,
                	value = $(fileInput).val(),
                	fileName;
                if (value == EMPTY){
                	return false;
                }
                self.fire(self.event.CHANGE);
            }
    },{
    	ATTRS : /** @lends Button*/{
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
	                if (this.fileInput) {
	                    DOM.attr(this.fileInput, 'name', v);
	                }
	                return v;
	            }
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
    	}
    });
    
    return HtmlButton;
},{
	requires:[
		'node',
		'./base'
	]
});