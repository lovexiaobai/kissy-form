/**
 * @fileoverview 文件改变状态后改变状态元素的内容
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[queue-status]:';

    /**
     * @name status
     * @class 文件改变状态后改变状态元素的内容
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Status(target, config) {
        var self = this;
        //调用父类构造函数
        Status.superclass.constructor.call(self, config);
        self.set('target', $(target));
    }

    S.mix(Status, {
        /**
         * 文件的状态类型
         */
        type : {
            WAITING : 'waiting',
            START : 'start',
            SUCCESS : 'success',
            ERROR : 'error'
        },
        tpl : {
            LOADING : '<img src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" />'
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Status, Base, /** @lends Status.prototype*/{
        /**
         * 判断是不是允许的状态类型
         * @param {String} status
         * @return {Boolean}
         */
        isSupport : function(status) {
            if (!S.isString(status)) return false;
            var type = Status.type,b = false;
            S.each(type, function(v) {
                if (status == v) {
                    return b = true;
                }
            });
            return b;
        },
        /**
         * 等待上传时状态层内容
         */
        _waiting : function() {
            var self = this,target = self.get('target');
            target.html(EMPTY);
        },
        /**
         * 开始上传后改成状态层内容
         */
        _start : function() {
            var self = this,$target = self.get('target'),
                tpl = self.get('tpl'),startTpl = tpl.start,
                $content,$cancel;
            if (!S.isString(startTpl)) return false;
            $target.html(EMPTY);
            $content = $(startTpl).appendTo($target);
            //取消链接
            $cancel = $content.children('.J_UploadCancel');
            $cancel.on('click', function(ev) {

            })
        },
        /**
         * 成功上传后改成状态层内容
         */
        _success : function() {
            var self = this,$target = self.get('target'),
                tpl = self.get('tpl'),successTpl = tpl.success,
                queue = self.get('queue'),
                file = self.get('file'),id = file.id,
                $content;
            if (!S.isString(successTpl)) return false;
            $target.html(EMPTY);
            $content = $(successTpl).appendTo($target);
            //点击删除
            $content.on('click',function(ev){
                ev.preventDefault();
                //删除队列中的文件
                queue.remove(id);
            })
        },
        /**
         * 上传失败后改成状态层内容
         */
        _error : function() {

        }
    }, {ATTRS : /** @lends Status*/{
        /**
         * 状态改变时改变的元素层
         */
        target : {value : EMPTY},
        /**
         * 模板
         */
        tpl : {value : {
            start : '<img class="f-l loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" />' +
                ' <a class="f-l" href="#uploadCancel" class="J_UploadCancel upload-cancel">取消</a> ',
            success : '<a href="#fileDel" class="J_FileDel">删除</a> ',
            error : '上传失败！'
        } },
        /**
         * 队列实例
         */
        queue : {value : EMPTY},
        /**
         * 文件对象
         */
        file : {value : {}},
        /**
         * 当前状态类型
         */
        curType : {
            value : EMPTY,
            setter : function(status) {
                if (!S.isString(status)) return false;
                var self = this,method;
                if (!self.isSupport(status)) {
                    S.log(LOG_PREFIX + 'status参数为' + status + '，不支持的状态类型');
                    return false;
                }
                method = self['_' + status];
                //改变状态层内容
                method && method.call(self);
                return status;
            }
        }
    }});
    return Status;
}, {requires : ['node','base']});