KISSY.add('form/uploader/themes/default/index',function(S, Node, Base,Queue) {
    var EMPTY = '',$ = Node.all;
    /**
     * @name DefaultTheme
     * @class 上传组件默认模板
     * @constructor
     * @extends Base
     * @requires Node
     */
    function DefaultTheme(config) {
        var self = this;
        //调用父类构造函数
        DefaultTheme.superclass.constructor.call(self, config);
        self._init();
    }

    S.extend(DefaultTheme, Base, /** @lends DefaultTheme.prototype*/{
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

        }
    }, {ATTRS : /** @lends DefaultTheme*/{
        queueTarget : {value : EMPTY},
        queue : {value : EMPTY}
    }});
    return DefaultTheme;
}, {requires : ['node','base','../../queue/base','./style.css']});