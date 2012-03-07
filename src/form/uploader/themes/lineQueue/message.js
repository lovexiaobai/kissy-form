/**
 * @fileoverview 横排队列发送消息
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-11
 */
KISSY.add('form/uploader/themes/lineQueue/message', function(S, Node, Base){
	
	var $ = Node.All,
		LOG_PRE = '[LineQueue: Message] ';
	
	function Message(config){
		var self = this;
		Message.superclass.constructor.call(self, config);
		S.log(LOG_PRE + 'Constructed');
	}
	
	S.extend(Message, Base, {
		
		/**
		 * 向msg容器发送消息
		 */
		send: function(msg, type){
			var self = this,
				msgBox = $(self.get('msgContainer'));
			if(!msg){
				S.log(LOG_PRE + 'You did not tell me what to show.');
				return false;
			}
			var newClsName = self.get(type + 'Cls'),
				successCls = self.get('successCls'),
				hintCls = self.get('hintCls'),
				errorCls = self.get('errorCls');
			switch(type){
				case 'success':
				case 'hint':
				case 'error':
					$(msgBox).html(msg);
					$(msgBox).replaceClass([successCls, hintCls, errorCls].join(' '), newClsName);
					return true;
					break;
				default:
					S.log(LOG_PRE + 'type error');
					return false;
					break;
			}
		}
		
	}, {
		ATTRS: {
			'msgContainer': {
				value: '#J_MsgBoxUpload'
			},
			'successCls': {
				value: ''
			},
			'hintCls': {
				value: ''
			},
			'errorCls': {
				value: ''
			}
		}
	});
	
	return Message;
	
}, {
	requires: [
		'node',
		'base'
	]
});
