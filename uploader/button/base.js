/**
 * @fileoverview 文件上传按钮
 * @author 紫英(橘子)<daxingplay@gmail.com>, 剑平(明河)<minghe36@126.com>
 */
KISSY.add('upload-btn', function(S, Node, Base){
	
	var $ = Node.all,
		EMPTY = '',
		LOG_PRE = '[AjaxUploader-Button] ';
	
	/**
	 * 文件上传按钮
	 * @class Button
	 * @constructor
	 * @param {Object} config 配置对象
	 */
	function Button(config){
		var self = this;
		
		self.config = S.mix({
			'type': 'html'
		}, config);
		
		var	module = self.config.type;
		if(S.inArray(module, ['html', 'flash'])){
			// self.set('target', self.config.target);
			// self.target = $(self.config.target);
			S.use(module + '-button', function(S, Mod){
				// inst = new Mod(config);
				// self.set('instance', new Mod(config));
				self.instance = new Mod(self.config);
				S.log(LOG_PRE + 'Button loaded. Type: ' + module);
			});
			self.render();
		}else{
			S.log(LOG_PRE + 'button type does not exists.');
		}
	}
	
	S.mix(Button, {
		'event': {
			'beforeShow': 'beforeShow',
        	'afterShow': 'afterShow',
        	'beforeHide': 'beforeHide',
        	'afterHide': 'afterHide',
        	'change' : 'change'
		}
	})
	
	S.extend(Button, Base, {
		/**
		 * 渲染按钮
		 */
		render: function(){
			var self = this,
				inst = self.instance;
			inst._render();
			// self._createUrlsInput();
		},
		/**
		 * 显示按钮
		 */
		show: function(){
			
		},
		/**
		 * 隐藏按钮
		 */
		hide: function(){
			
		}
		
	}, {
		ATTRS: {
			/**
			 * 具体类型的Button实例
			 * @type Object
			 */
			// instance: {
				// value: null
			// },
			/**
			 * 
			 */
			// target: {
				// value: null,
				// setter: function(v){
					// if(S.isString(v)){
						// return $(v);
					// }
				// }
			// }
			disabled: {
				value: false,
				setter: function(v){
					var self = this,
						inst = self.instance;
					// if(v == false){
						// self
					// }
					// self.instance.disable();
					S.log(LOG_PRE + '111');
					self.instance.set('disabled', v);
					return v;
				},
				getter: function(){
					S.log(LOG_PRE + '1123124')
				}
			}
		}
	});
	
	return Button;
}, {
	requires: [
		'node',
		'base'
	]
});
/**
 * CHANGELOG
 * 2011-12-13 部分内部属性就不要用set和get了。
 */