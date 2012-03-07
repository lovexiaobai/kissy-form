/**
 * @fileoverview 横排队列上传主题
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-11
 */
KISSY.add('form/uploader/themes/lineQueue/index', function(S, Node, DefaultTheme, Queue, Preview, Message, SetMainPic){
	
	var $ = Node.all,
		LOG_PRE = '[LineQueue:index] ';
	
	function LineQueue(config){
		var self = this;
		self.set('queueTarget', config.queueTarget);
        //调用父类构造函数
        LineQueue.superclass.constructor.call(self, config);
	}
	
	S.extend(LineQueue, DefaultTheme, /** @lends GrayQueue.prototype*/{
		
		_init: function(){
			var self = this,
				queueTarget = self.get('queueTarget'),
				queue;
            queue = new Queue(queueTarget);
            self.set('queue',queue);
            // S.log(queue);
            S.log(LOG_PRE + 'inited.');
		},
		/**
		 * 父类渲染成功后模板执行的自定义方法。
		 */
		afterUploaderRender: function(uploader){
			var self = this,
				elemButtonTarget = uploader.get('buttonTarget'),
                queue = uploader.get('queue'),
                button = uploader.get('button'),
                elemTempFileInput = $('.original-file-input', elemButtonTarget),
                elemFileInput = button.get('fileInput'),
                preview,
                message;
            // test
            S.log(self, 'dir')
            S.log(uploader, 'dir');
            
            $(elemTempFileInput).remove();
            S.log(LOG_PRE + 'old input removed.');
            
            preview = new Preview();
            
            queue.on('add',function(ev){
            	var elemImg = $('.J_ItemPic', ev.target);
            		// elemWrapper = $('.J_Wrapper', ev.target);
        		preview.preview(elemFileInput, elemImg);
        		
        		// $(elemWrapper).addClass('.uploading');
        		S.log(LOG_PRE + 'preview done.');
        		
                // S.log(ev, 'dir');
            });
            
            message = new Message({
            	'msgContainer': uploader.get('msgContainer')
            });
            uploader.set('message', message);

            if(uploader.get('type') == 'ajax'){
            	S.log(LOG_PRE + 'advance queue');
            	$(self.get('queueTarget')).addClass('advance-queue');
            }
            
            S.log(message, 'dir');
            
            var setMainPic = new SetMainPic();
            S.log(setMainPic);
		}
	})
	
	return LineQueue;
	
}, {
	requires: [
		'node',
		'../default/index',
		'./queue',
		'../../plugins/preview/preview',
		'./message',
		'./setMainPic',
		'./style.css'
	]
});
