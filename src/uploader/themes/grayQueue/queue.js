KISSY.add(function(S, Node, QueueBase, Status) {
    var EMPTY = '',$ = Node.all;

    /**
     * @name Queue
     * @class ģ��Ķ�����
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Queue(config) {
        var self = this;
        //���ø��๹�캯��
        Queue.superclass.constructor.call(self, config);
    }

    Queue.event = QueueBase.event;
    Queue.status = QueueBase.status;
    S.extend(Queue, QueueBase, /** @lends Queue.prototype*/{
        /**
         * ����Status
         * @param {Object} file  �ļ�����
         * @return {Status} ״̬ʵ��
         */
        _renderStatus : function(file) {
            var self = this,$file = file.target,elStatus;
            if (!$file.length) return false;
            //״̬��
            elStatus = $file.children('.J_FileStatus');
            //ʵ����״̬��
            return new Status(elStatus, {queue : self,file : file});
        }
    }, {ATTRS : /** @lends Queue*/{
        /**
         * ģ��
         */
        tpl : {value :
            '<li id="queue-file-{id}" class="clearfix queue-file" data-name="{name}">' +
                '<div class="f-l file-name">{name}</div>' +
                '<div class="f-r file-status J_FileStatus">0%</div>' +
                '<div class="f-r file-size">{textSize}</div>' +
                '</li>'
        }
    }});
    return Queue;
}, {requires : ['node','../../queue/base','./status']});