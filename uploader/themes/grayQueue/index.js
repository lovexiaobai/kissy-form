KISSY.add(function(S, Node, Base,Queue) {
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
        self._init();
    }

    //继承于Base，属性getter和setter委托于Base处理
    S.extend(GrayQueue, Base, /** @lends GrayQueue.prototype*/{
        /**
         * 初始化
         */
        _init : function() {
            var self = this,queueTarget = self.get('queueTarget'),queue;
            queue = new Queue(queueTarget);
            self.set('queue',queue);
        }
    }, {ATTRS : /** @lends GrayQueue*/{
        queueTarget : {value : EMPTY},
        queue : {value : EMPTY}
    }});
    return GrayQueue;
}, {requires : ['node','base','./queue','./style.css']});