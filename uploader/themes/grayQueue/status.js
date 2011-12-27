KISSY.add(function(S, Node,ProgressBar, StatusBase) {
    var EMPTY = '',$ = Node.all;
    
    /**
     * @name Status
     * @class 状态类
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Status(target, config) {
        var self = this;
        //调用父类构造函数
        Status.superclass.constructor.call(self,target, config);
        self.set('target', $(target));
    }
    Status.type = StatusBase.type;
    S.extend(Status, StatusBase, /** @lends Status.prototype*/{
        /**
         * 等待上传时状态层内容
         */
        _waiting : function() {
            var self = this, tpl = self.get('tpl'),waitingTpl = tpl.waiting,
                uploader = self.get('uploader'),
                file = self.get('file'),
                total = uploader.get('total'),
                size = file.size;
            self._changeDom(waitingTpl);
            //不存在文件大小，直接退出
            if(!size) return false;
            if(!total){
                total = size;
                uploader.set('loaded',0);
            }else{
                total += size;
            }
            $('#J_TotalSize').text(StatusBase.convertByteSize(total));
            uploader.set('total',total);
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
            //如果是ajax异步上传，加入进度显示
            if (uploadType == 'ajax') {
                if(!uploader.get('progressBar')){
                    var progressBar = new ProgressBar($('#J_ProgressBar'));
                    progressBar.render();
                    uploader.set('progressBar',progressBar);
                }
                var $progressNum = $content.children('.J_ProgressNum');
                $progressNum.html("0%");
                self.set('elProgressNum',$progressNum);
            }
        },
        /**
         * 正在上传时候刷新状态层的内容
         * @param data
         */
        _progress : function(data){
            var self = this,loaded = data.loaded,total = data.total,
                val = parseInt(loaded/total * 100),
                uploader = self.get('uploader'),
                proccessBar = uploader.get('progressBar'),
                allFileTotal = uploader.get('total'),
                allFileLoaded = uploader.get('loaded'),
                $elProgressNum = self.get('elProgressNum');
            if(!$elProgressNum.length || proccessBar == EMPTY) return false;
            $elProgressNum.html(val + '%');
            loaded += allFileLoaded;
            val = parseInt(loaded/allFileTotal * 100);
            S.log(val);
            S.log(loaded);
            proccessBar.set('value',val);
            $('#J_TotalProgressNum').text(val + '%');
        },
        _success : function(){
            var self = this, tpl = self.get('tpl'),successTpl = tpl.success,
                target = self.get('target'),
                queue = self.get('queue'),
                file = self.get('file'),
                size = file.size,
                uploader = self.get('uploader'),
                loaded = uploader.get('loaded');
            if (!S.isString(successTpl)) return false;
            self._changeDom(successTpl);
            if(!size) return false;
            loaded += size;
            uploader.set('loaded',loaded);
        }
    }, {ATTRS : /** @lends Status*/{
        /**
         * 模板
         */
        tpl : {value : {
            waiting : '<div>0%</div>',
            start : '<div class="clearfix"><div class="J_ProgressNum"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                '</div> ',
            success : '<span>100%</span>',
            cancel : '<div>已经取消上传，<a href="#reUpload" class="J_ReUpload">点此重新上传</a> </div>',
            error : '<div class="upload-error">{msg}<a href="#fileDel" class="J_FileDel">点此删除</a></div>'
        }
        }
    }});
    return Status;
}, {requires : ['node','../../queue/progressBar','../../queue/status']});