/**
 * @fileoverview 文件上传按钮base
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add(function(S, Node, Base) {
    var EMPTY = '',
        LOG_PREFIX = '[AjaxUploader-Button] ',
        $ = Node.all;

    /**
     * 文件上传按钮
     * @class Button
     * @constructor
     * @param {Object} config 配置对象
     */
    function Button(config) {
        var self = this;
        /**
         * 目标容器
         * @type HTMLElement
         */
        self.target = $(config.target);
        /**
         * 文件路径隐藏域
         * @type HTMLElement
         */
        self.urlsInput = EMPTY;
        //超类初始化
        Button.superclass.constructor.call(self, config);
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
    	 * 显示按钮
    	 */
    	show: function(){
    		
    	},
    	/**
    	 * 隐藏按钮
    	 */
    	hide: function(){
    		
    	}
    },{
    	ATTRS : /** @lends Button */{
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
	         * 隐藏的文件路径隐藏域模板
	         * @type String
	         */
	        urlsInputTpl : {
	            value : '<input type="hidden" value="" name="{name}" class="J_UploaderUrlsInput">'
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