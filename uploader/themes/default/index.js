KISSY.add(function(S, Node, Base,Queue) {
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
        }
    }, {ATTRS : /** @lends DefaultTheme*/{
        queueTarget : {value : EMPTY},
        queue : {value : EMPTY}
    }});
    return DefaultTheme;
}, {requires : ['node','base','../../queue/base','./style.css']});