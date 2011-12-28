/**
 * @fileoverview 文件改变状态后改变状态元素的内容
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S, Node, Base,ProgressBar) {
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
            PROGRESS : 'progress',
            SUCCESS : 'success',
            CANCEL : 'cancel',
            ERROR : 'error'
        },
        tpl : {
            LOADING : '<img src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" />'
        },
        /**
         * 转换文件大小字节数
         * @param {Number} size 文件大小字节数
         * @return {String} 文件大小
         */
        convertByteSize : function(size){
            var byteSize = Math.round(size / 1024 * 100) * .01,
            	suffix = 'kb';
            if (byteSize > 1000) {
                byteSize = Math.round(byteSize *.001 * 100) * .01;
                suffix = 'mb';
            }
            sizeParts = byteSize.toString().split('.');
            if (sizeParts.length > 1) {
                byteSize = sizeParts[0] + '.' + sizeParts[1].substr(0,2);
            } else {
                byteSize = sizeParts[0];
            }
            return byteSize+ suffix;
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Status, Base, /** @lends Status.prototype*/{
        /**
         * 改变状态，调用对应的状态函数
         * @param {String} status 状态名
         * @param {Object} args 传递给状态函数的参数
         */
        change : function(status,args){
            if (!S.isString(status)) return false;
            var self = this,method;
            if (!self.isSupport(status)) {
                S.log(LOG_PREFIX + 'status参数为' + status + '，不支持的状态类型');
                return false;
            }
            if(!args) args = {};
            method = self['_' + status];
            //改变状态层内容
            method && method.call(self,args);
            self.set('curType',status);
            return self;
        },
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
         * 改变状态层的DOM内容
         * @return {NodeList} 内容层
         */
        _changeDom : function(content) {
            var self = this,$target = self.get('target'),$content;
            $target.html(EMPTY);
            $content = $(content).appendTo($target);
            return $content;
        },
        /**
         * 等待上传时状态层内容
         */
        _waiting : function() {
            var self = this, tpl = self.get('tpl'),waitingTpl = tpl.waiting,
                uploader = self.get('uploader'),
                //文件id
                file = self.get('file'),id = file.id,
                $content = self._changeDom(waitingTpl),
                $upload = $content.children('.J_Upload');
            $upload.on('click',function(ev){
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                uploader.upload(id);
            });
        },
        /**
         * 开始上传后改成状态层内容
         */
        _start : function(data) {
            var self = this, tpl = self.get('tpl'),startTpl = tpl.start,
                target = self.get('target'),
                uploader = self.get('uploader'),
                uploadType = uploader.get('type'),
                $content,$cancel;
            if (!S.isString(startTpl)) return false;
            $content = self._changeDom(startTpl);
            //取消链接
            $cancel = $content.children('.J_UploadCancel');
            $cancel.on('click', function(ev) {
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                uploader.cancel();
            });
            //如果是ajax异步上传，加入进度条
            if(uploadType == 'ajax'){
                var $progressBar = $content.children('.J_ProgressBar');
                var progressBar = new ProgressBar($progressBar);
                progressBar.render();
                self.set('progressBar',progressBar);
            }
            var $parent = target.parent();
            $parent.addClass('current-upload-file');
        },
        /**
         * 正在上传时候刷新状态层的内容
         * @param data
         */
        _progress : function(data){
            var self = this,loaded = data.loaded,total = data.total,
                val = Math.ceil(loaded/total) * 100,
                progressBar = self.get('progressBar');
            if(!progressBar) return false;
            progressBar.set('value',val);
        },
        /**
         * 成功上传后改成状态层内容
         */
        _success : function() {
            var self = this, tpl = self.get('tpl'),successTpl = tpl.success,
                target = self.get('target'),
                queue = self.get('queue'),
                file = self.get('file'),id = file.id,
                progressBar = self.get('progressBar'),
                $target = self.get('target'),
                $del;
            if (!S.isString(successTpl)) return false;
            if(S.isObject(progressBar)){
                var $wrapper =$target.children(),
                    $cancel = $wrapper.children('.J_UploadCancel');
                $cancel.remove();
                $del = $(successTpl).appendTo($wrapper);
            }else{
                $del =  self._changeDom(successTpl);
            }
            //点击删除
            $del.on('click', function(ev) {
                ev.preventDefault();
                //删除队列中的文件
                queue.remove(id);
            });
            var $parent = target.parent();
            $parent.removeClass('current-upload-file');
        },
        /**
         * 取消上传后改成状态层内容
         */
        _cancel : function() {
            var self = this, tpl = self.get('tpl'),cancelTpl = tpl.cancel,
                uploader = self.get('uploader'),
                $content = self._changeDom(cancelTpl),
                $reUpload = $content.children('.J_ReUpload'),
                //文件id
                file = self.get('file'),id = file.id;
            //点击重新上传链接
            $reUpload.on('click', function(ev) {
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                uploader.upload(id);
            });
        },
        /**
         * 上传失败后改成状态层内容
         */
        _error : function(data) {
            if(!S.isObject(data)){
                data = {msg : '文件上传失败！'};
            }
            var self = this, tpl = self.get('tpl'),errorTpl = tpl.error,
                html = S.substitute(errorTpl,data),
                $content = self._changeDom(html),
                $del = $content.children('.J_FileDel'),
                queue = self.get('queue'),
                //文件id
                file = self.get('file'),id = file.id;
            //点击重新上传链接
            $del.on('click', function(ev) {
                ev.preventDefault();
                //删除队列中的文件
                queue.remove(id);
            });
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
            waiting : '<div>等待上传，<a href="#Upload" class="J_Upload">点此上传</a> </div>',
            start : '<div><div class="f-l  J_ProgressBar uploader-progress"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                ' <a class="f-l J_UploadCancel upload-cancel" href="#uploadCancel">取消</a></div> ',
            success : ' <a href="#fileDel" class="J_FileDel">删除</a>  ',
            cancel : '<div>已经取消上传，<a href="#reUpload" class="J_ReUpload">点此重新上传</a> </div>',
            error : '<div class="upload-error">{msg}<a href="#fileDel" class="J_FileDel">点此删除</a></div>'
        } },
        /**
         * 队列实例
         */
        queue : {value : EMPTY},
        /**
         * 上传组件的实例
         */
        uploader : {value : EMPTY},
        /**
         * 文件对象
         */
        file : {value : {}},
        /**
         * 当前状态类型
         */
        curType : { value : EMPTY },
        //进度条ProgressBar的实例，iframe上传时并不存在
        progressBar : {value : EMPTY}
    }});
    return Status;
}, {requires : ['node','base','./progressBar']});