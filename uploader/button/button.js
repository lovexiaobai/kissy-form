/**
 * @fileoverview HTML版文件上传按钮
 * @author 紫英(橘子)<daxingplay@gmail.com>, 剑平(明河)<minghe36@126.com>
 */
KISSY.add('html-button', function(S, Node, ButtonBase){
	
	var $ = Node.all,
		EMPTY = '',
		LOG_PRE = '[AjaxUploader-Button-HTML] ';
		
	function HtmlBtn(config){
		var self = this;
		self.config = S.mix({
			'name': 'file_upload',
			'inputTpl': '<div class="ks-ajax-uploader-input-container"><input type="file" name="{name}" hidefoucs="true" class="ks-ajax-uploader-input" /></div>'
		}, config);
		self.target = $(self.config.target);
		// HtmlBtn.superclass.constructor.call(self, self.config);
	}
	
	S.extend(HtmlBtn, ButtonBase, {
		
		_render: function(){
			var self = this,
				target = self.target,
				fileInput,
				name,
				targetType;
			if(target == null){
				S.log(LOG_PRE + 'Target does not exists. Exit.');
				return false;
			}
			targetType = $(target).attr('type');
			fileInput = $('input', target);
			name = $(fileInput).attr('name');
			if(name){
				self.config.name = name;
			}else{
				self._createInput();
			}
			S.log(LOG_PRE + 'Rendered.');
		},
		/**
		 * 创建文件上传表单域
		 */
		_createInput: function(){
			var self = this,
				// target = self.get('target'),
				target = self.target,
				tpl = self.config.inputTpl,
				name = self.config.name,
				html,
				inputContainer,
				fileInput;
				// debugger;
			html = S.substitute(tpl, {
				'name': name
			});
			inputContainer = $(html);
			$(inputContainer).appendTo(target);
			fileInput = $('input', inputContainer);
			$(fileInput).on('change', self._changeHandler, self);
			// TODO 外界是否会用到?
			self.fileInput = fileInput;
			self.inputContainer = inputContainer;
			S.log(LOG_PRE + 'File Input was created.');
		},
		/**
		 * 文件上传域的值改变时触发
		 * @param {Object} ev 事件对象
		 */
		_changeHandler: function(ev){
			var self = this;
			self.fire(ButtonBase.event.change, {
				'eventTarget': ev
			});
			S.log(LOG_PRE + 'change handler was fired.');
			self._reset();
		},
		/**
		 * 重置上传域
		 */
		_reset: function(){
			var self = this,
				inputContainer = self.inputContainer;
			$(inputContainer).remove();
			self.inputContainer = EMPTY;
			self.fileInput = EMPTY;
			S.log(LOG_PRE + 'File Input was reset.');
			self._createInput();
		}
		
	}, {
		ATTRS: {
			disabled: {
				value: false,
				setter: function(v){
					S.log(LOG_PRE + ' The disabled is ' + v);
				}
			}
		}
	})
	
	return HtmlBtn;
	
}, {
	requires: [
		'node',
		'upload-btn'
	]
});
