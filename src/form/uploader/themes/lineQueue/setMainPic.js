/**
 * @fileoverview 设置为主图功能，本来想作为插件去写，但是发现这么简单的功能不适合做插件，反而做麻烦了。
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-03-07
 * @requires KISSY 1.2+
 */
KISSY.add('form/uploader/themes/lineQueue/setMainPic', function(S, Node, Base){
	
	var LOG_PRE = '[Plugin: setMainPic] ';
	
	function SetMainPic(container, config){
		var self = this;
		
	}
	
	S.extend(SetMainPic, Base, {
		
		/**
		 * 将所选id的图片设置为主图
		 */
		setMainPic: function(){
			
		},
		
		/**
		 * 获取当前主图
		 */
		getMainPic: function(){
			
		}
		
	}, {
		ATTRS: {
			
			'mainPicInput': {
				value: 'main-pic'
			}
			
		}
	});
	
	return SetMainPic;
	
}, {
	requires: [
		'node',
		'base'
	]
});