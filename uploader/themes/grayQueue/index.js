KISSY.add(function(S, Node, DefaultTheme,Queue) {
    var EMPTY = '',$ = Node.all;

    /**
     * @name GrayQueue
     * @class 上传组件灰色模板
     * @constructor
     * @extends Base
     * @requires Node
     */
    function GrayQueue(config) {
        var self = this;
        //调用父类构造函数
        GrayQueue.superclass.constructor.call(self, config);
    }
    S.extend(GrayQueue, DefaultTheme, /** @lends GrayQueue.prototype*/{
        /**
         * 初始化
         */
        _init : function() {
            var self = this,queueTarget = self.get('queueTarget'),queue;
            queue = new Queue(queueTarget);
            self.set('queue',queue);
        },
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        afterUploaderRender : function(uploader){
            var self = this,
                //开始上传按钮
                $startUpload = $(self.get('elStartUpload'));
            $startUpload.on('click',function(){
                uploader.uploadWaitFiles();
            })
        }
    }, {ATTRS : /** @lends GrayQueue*/{
        elStartUpload : {value : '#J_StartUpload'}
    }});
    return GrayQueue;
}, {requires : ['node','../default/index','./queue','./style.css']});