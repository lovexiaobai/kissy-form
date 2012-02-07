/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('form/uploader/base',function(S, Base, Node, UrlsInput, IframeType, AjaxType,FlashType,Flash) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader]:';

    /**
     * @name Uploader
     * @class 异步文件上传组件，目前是使用ajax+iframe的方案，日后会加入flash方案
     * @constructor
     * @extends Base
     * @requires Node,UrlsInput,IframeType,AjaxType
     */
    function Uploader(config) {
        var self = this;
        //调用父类构造函数
        Uploader.superclass.constructor.call(self, config);
    }

    S.mix(Uploader, /** @lends Uploader*/{
        /**
         * 上传方式
         */
        type : {AUTO : 'auto',IFRAME : 'iframe',AJAX : 'ajax',FLASH : 'flash'},
        /**
         * 事件
         */
        event : {
            //运行
            RENDER : 'render',
            //选择完文件后触发
            SELECT : 'select',
            //开始上传
            START : 'start',
            //上传完成（在上传成功或上传失败后都会触发）
            COMPLETE :'complete',
            //上传成功
            SUCCESS : 'success',
            UPLOAD_ALL : 'uploadAll',
            //上传失败
            ERROR : 'error'
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Uploader, Base, /** @lends Uploader.prototype*/{
        /**
         * 运行
         * @return {Uploader}
         */
        render : function() {
            var self = this,serverConfig = self.get('serverConfig'),
                type = self.get('type'),
                UploadType = self.getUploadType(type),uploadType,
                uploaderTypeEvent = UploadType.event,
                button;
            if (!UploadType) return false;
            //路径input实例
            self.set('urlsInput',self._renderUrlsInput());
            self._renderQueue();
            button = self._renderButton();
            //如果是flash异步上传方案，增加swfUploader的实例作为参数
            if(self.get('type') == Uploader.type.FLASH){
                S.mix(serverConfig,{swfUploader:button.get('swfUploader')});
            }
            //实例化上传方式类
            uploadType = new UploadType(serverConfig);
            //监听上传器上传完成事件
            uploadType.on(uploaderTypeEvent.SUCCESS, self._uploadCompleteHanlder, self);
            //监听上传器上传进度事件
            if(uploaderTypeEvent.PROGRESS) uploadType.on(uploaderTypeEvent.PROGRESS,self._uploadProgressHandler,self);
            //监听上传器上传停止事件
            uploadType.on(uploaderTypeEvent.STOP, self._uploadStopHanlder, self);
            self.set('uploadType', uploadType);
            self.fire(Uploader.event.RENDER);
            return self;
        },
        /**
         * 上传文件
         * @param {Number} index 文件对应的在上传队列数组内的索引值
         */
        upload : function(index) {
            if (!S.isNumber(index)) return false;
            var self = this,uploadType = self.get('uploadType'),
                queue = self.get('queue'),
                file = queue.get('files')[index],
                uploadParam;
            if (!S.isPlainObject(file)) {
                S.log(LOG_PREFIX + '队列中不存在id为' + index + '的文件');
                return false;
            }
            //如果有文件正在上传，予以阻止上传
            if(self.get('curUploadIndex') != EMPTY){
                alert('第'+ self.get('curUploadIndex') +'文件正在上传，请上传完后再操作！');
                return false;
            }
            //文件上传域，如果是flash上传,input为文件数据对象
            uploadParam = file.input.id || file.input;
            //触发文件上传前事件
            self.fire(Uploader.event.START, {index : index,file : file});
            //阻止文件上传
            if(!self.get('isAllowUpload')) return false;
            //设置当前上传的文件id
            self.set('curUploadIndex', index);
            //改变文件上传状态为start
            queue.fileStatus(index, queue.constructor.status.START);

            //开始上传
            uploadType.upload(uploadParam);
        },
        /**
         * 取消上传
         */
        cancel : function(){
            var self = this,uploadType = self.get('uploadType');
            uploadType.stop();
            //取消上传后刷新状态，更改路径等操作请看_uploadStopHanlder()
            return self;
        },
        /**
         * 上传等待中的文件
         */
        uploadAll : function(){
            var self = this;
            //上传所有等待中的文件
            self.set('isUploadWaitFiles',true);
            self.uploadWaitFile();
        },
        /**
         * 上传等待中的文件
         */
        uploadWaitFile : function(){
            var self = this,queue = self.get('queue'),
                waitFileIndexs = queue.getIndexs('waiting');
            //没有等待上传的文件
            if(!waitFileIndexs.length){
                self.set('isUploadWaitFiles',false);
                self.fire(Uploader.event.UPLOAD_ALL);
                return false;
            }
            //开始上传等待中的文件
            self.upload(waitFileIndexs[0]);
        },
        /**
         * 是否支持ajax方案上传
         * @return {Boolean}
         */
        isSupportAjax : function() {
            return S.isObject(FormData);
        },
        /**
         * 是否支持flash方案上传
         * @return {Boolean}
         */
        isSupportFlash : function(){
            var fpv = S.UA.fpv();
            return S.isArray(fpv) && fpv.length > 0;
        },
        /**
         * 获取上传方式类（iframe方案或ajax方案）
         * @return {IframeType|AjaxType}
         */
        getUploadType : function(type) {
            var self = this,types = Uploader.type,
                UploadType;
            //如果type参数为auto，那么type=['ajax','flash','iframe']
            if(type == types.AUTO) type = [types.AJAX,types.IFRAME];
            //如果是数组，遍历获取浏览器支持的上传方式
            if(S.isArray(type) && type.length > 0){
                S.each(type,function(t){
                    UploadType = self._getType(t);
                    if(UploadType) return false;
                });
            }else{
                UploadType = self._getType(type);
            }
            return UploadType;
        },
        /**
         * 获取上传方式
         * @param {String} type 上传方式（根据type返回对应的上传类，比如iframe返回IframeType）
         */
        _getType : function(type){
            var self = this,types = Uploader.type,UploadType,
                isSupportAjax = self.isSupportAjax(),
                isSupportFlash = self.isSupportFlash();
            switch (type) {
                case types.IFRAME :
                    UploadType = IframeType;
                    break;
                case types.AJAX :
                    UploadType = isSupportAjax && AjaxType || false;
                    break;
                case types.FLASH :
                    UploadType = isSupportFlash && FlashType || false;
                    break;
                default :
                    S.log(LOG_PREFIX + 'type参数不合法');
                    return false;
            }
            self.set('type',type);
            return UploadType;
        },
        /**
         * 运行Button上传按钮组件
         * @return {Button}
         */
        _renderButton : function() {
            var self = this,button = self.get('button');
            if (!S.isObject(button)) {
                S.log(LOG_PREFIX + 'button参数不合法！');
                return false;
            }
            //监听按钮改变事件
            button.on('change', self._select, self);
            //运行按钮实例
            button.render();
            return button;
        },
        /**
         * 运行Queue队列组件
         * @return {Queue} 队列实例
         */
        _renderQueue : function() {
            var self = this,queue = self.get('queue'),
                urlsInput = self.get('urlsInput');
            if (!S.isObject(queue)) {
                S.log(LOG_PREFIX + 'queue参数不合法');
                return false;
            }
            //将上传组件实例传给队列，方便队列内部执行取消、重新上传的操作
            queue.set('uploader',self);
            //监听队列的删除事件
            queue.on(queue.constructor.event.REMOVE,function(ev){
                //删除该文件路径，sUrl为服务器端返回的文件路径，而url是客服端文件路径
                urlsInput.remove(ev.file.sUrl);
            });
            queue.render();
            return queue;
        },
        /**
         * 选择完文件后
         * @param {Object} ev 事件对象
         */
        _select : function(ev) {
            var self = this,autoUpload = self.get('autoUpload'),
                queue = self.get('queue'),
                curId = self.get('curUploadIndex'),
                files = ev.files;
            S.each(files,function(file){
                //文件大小，IE浏览器下不存在
                if(!file.size) file.size = 0;
                //chrome文件名属性名为fileName，而firefox为name
                if(!file.name) file.name = file.fileName || EMPTY;
                //如果是flash上传，并不存在文件上传域input
                file.input = ev.input || file;
            });
            self.fire(Uploader.event.SELECT,files);
            //阻止文件上传
            if(!self.get('isAllowUpload')) return false;
            queue.add(files,function(){
                //如果不存在正在上传的文件，且允许自动上传，上传该文件
                if(curId == EMPTY && autoUpload){
                    self.uploadAll();
                }
            });
        },
        /**
         * 向上传按钮容器内增加用于存储文件路径的input
         */
        _renderUrlsInput : function() {
            var self = this,button = self.get('button'),inputWrapper = button.target,
                name = self.get('urlsInputName'),
                urlsInput = new UrlsInput(inputWrapper, {name : name});
            urlsInput.render();
            return urlsInput;
        },
        /**
         * 当上传完毕后返回结果集的处理
         */
        _uploadCompleteHanlder : function(ev) {
            var self = this,result = ev.result,status,event = Uploader.event,
                queue = self.get('queue'),index = self.get('curUploadIndex');
            if (!S.isObject(result)) return false;
            //文件上传状态
            status = result.status;
            if (status) {
                //修改队列中文件的状态为success（上传完成）
                queue.fileStatus(index, queue.constructor.status.SUCCESS);
                self._success(result.data);
                self.fire(event.SUCCESS);
            } else {
                //修改队列中文件的状态为error（上传失败）
                queue.fileStatus(index, queue.constructor.status.ERROR);
                self.fire(event.ERROR, {status : status});
            }
            //置空当前上传的文件在队列中的索引值
            self.set('curUploadIndex', EMPTY);
            self.fire(event.COMPLETE);
            //是否上传等待中的文件
            if(self.get('isUploadWaitFiles')) self.uploadWaitFile();
        },
        /**
         * 取消上传后调用的方法
         */
        _uploadStopHanlder : function(){
            var self = this,queue = self.get('queue'),
                index = self.get('curUploadIndex');
            //更改取消上传后的状态
            queue.fileStatus(index, queue.constructor.status.CANCEL);
            //重置当前上传文件id
            self.set('curUploadIndex',EMPTY);
        },
        /**
         * 上传进度监听器
         */
        _uploadProgressHandler : function(ev){
            var self = this,queue = self.get('queue'),
                id = self.get('curUploadIndex');
            queue.fileStatus(id, queue.constructor.status.PROGRESS,ev);
        },
        /**
         * 上传成功后执行的回调函数
         * @param {Object} data 服务器端返回的数据
         */
        _success : function(data){
            if(!S.isObject(data)) return false;
            var self = this,url = data.url,
                urlsInput = self.get('urlsInput'),
                fileId = self.get('curUploadId'),
                queue = self.get('queue');
            if(!S.isString(url) || !S.isObject(urlsInput)) return false;
            //追加服务器端返回的文件url
            queue.updateFile(fileId,{'sUrl' : url});
            //向路径隐藏域添加路径
            urlsInput.add(url);
        },
        _error : function(){

        }
    }, {ATTRS : /** @lends Uploader*/{
        /**
         * Button按钮的实例
         */
        button : {value : {}},
        /**
         * Queue队列的实例
         */
        queue : {value : {}},
        /**
         * 采用的上传方案，auto：根据浏览器自动选择，iframe：采用iframe方案，ajax：采用ajax方案
         */
        type : {value : Uploader.type.AUTO},
        /**
         * 服务器端配置
         */
        serverConfig : {value : {action : EMPTY,data : {},dataType : 'json'}},
        /**
         * 是否允许上传文件
         */
        isAllowUpload : {value : true},
        /**
         * 是否自动上传
         */
        autoUpload : {value : true},
        /**
         * 存储文件路径的隐藏域的name名
         */
        urlsInputName : {value : EMPTY},
        //当前上传的文件对应的在数组内的索引值
        curUploadIndex : {value : EMPTY},
        uploadType : {value : {}},
        urlsInput : {value : EMPTY},
        //是否正在上传等待中的文件
        isUploadWaitFiles : {value : false}
    }});
    return Uploader;
}, {requires:['base','node','./urlsInput','./type/iframe','./type/ajax','./type/flash','flash']});