/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('form/uploader/base',function(S, Base, Node, UrlsInput, IframeType, AjaxType) {
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
        type : {AUTO : 'auto',IFRAME : 'iframe',AJAX : 'ajax'},
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
                UploadType = self.getUploadType(),uploadType,
                uploaderTypeEvent = UploadType.event;
            if (!UploadType) return false;
            //路径input实例
            self.set('urlsInput',self._renderUrlsInput());
            self._renderQueue();
            self._renderButton();
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
         * @param {Number} fileId 文件索引值
         */
        upload : function(fileId) {
            if (!S.isNumber(fileId)) return false;
            var self = this,uploadType = self.get('uploadType'),
                queue = self.get('queue'),
                file = queue.get('files')[fileId],
                fileInput;
            if (!S.isPlainObject(file)) {
                S.log(LOG_PREFIX + '队列中不存在id为' + fileId + '的文件');
                return false;
            }
            //如果有文件正在上传，予以阻止上传
            if(self.get('curUploadId') != EMPTY){
                alert('有文件正在上传，请上传完后再操作！');
                return false;
            }
            //文件上传域
            fileInput = file.input;
            //触发文件上传前事件
            self.fire(Uploader.event.START, {id : fileId,file : file});
            //阻止文件上传
            if(!self.get('isAllowUpload')) return false;
            //设置当前上传的文件id
            self.set('curUploadId', fileId);
            //改变文件上传状态为start
            queue.fileStatus(fileId, queue.constructor.status.START);
            //开始上传
            uploadType.upload(fileInput);
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
                waitFileIds = queue.getIndexs('waiting');
            //没有等待上传的文件
            if(!waitFileIds.length){
                self.set('isUploadWaitFiles',false);
                self.fire(Uploader.event.UPLOAD_ALL);
                return false;
            }
            //开始上传等待中的文件
            self.upload(0);
        },
        /**
         * 是否支持ajax方案上传
         * @return {Boolean}
         */
        isSupportAjax : function() {
            return S.isObject(FormData);
        },
        /**
         * 获取上传方式类（iframe方案或ajax方案）
         * @return {IframeType|AjaxType}
         */
        getUploadType : function() {
            var self = this,type = self.get('type'),types = Uploader.type,
                isSupportAjax = self.isSupportAjax(),UploadType;
            switch (type) {
                case types.AUTO :
                    UploadType = isSupportAjax && AjaxType || IframeType;
                    if(isSupportAjax){
                        UploadType = AjaxType;
                        self.set('type',Uploader.type.AJAX);
                    }else{
                        UploadType = IframeType;
                        self.set('type',Uploader.type.IFRAME);
                    }
                    break;
                case types.IFRAME :
                    UploadType = IframeType;
                    break;
                case types.AJAX :
                    UploadType = AjaxType;
                    //如果不支持ajax，降级成iframe方案
                    if(!isSupportAjax){
                        UploadType = IframeType;
                        self.set('type',Uploader.type.IFRAME);
                        S.log(LOG_PREFIX + '由于你的浏览器不支持ajax上传，强制降级为iframe！');
                    }
                    break;
                default :
                    S.log(LOG_PREFIX + 'type参数不合法，只允许配置值为' + types.AUTO + ',' + types.IFRAME + ',' + types.AJAX);
                    return false;
            }
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
         */
        _select : function(ev) {
            var self = this,autoUpload = self.get('autoUpload'),
                queue = self.get('queue'),
                curId = self.get('curUploadId'),
                //ev.files为文件域值改变触发返回的文件对象数组，默认是数组，由于不支持多选，这里只需要获取第一个文件即可
                file = ev.files[0],
                //chrome文件名属性名为fileName，而firefox为name
                fileName = file.fileName || file.name,
                //文件大小，IE浏览器下不存在
                fileSize = file.size || 0,
                //文件对象
                oFile = {name : fileName,input : ev.input,file : file,size : fileSize},
                fileId;
            self.set('curFileData',oFile);
            self.fire(Uploader.event.SELECT,oFile);
            //阻止文件上传
            if(!self.get('isAllowUpload')) return false;
            //向队列添加文件
            fileId = queue.add(oFile);
            //如果不存在正在上传的文件，且允许自动上传，上传该文件
            if(curId === EMPTY){
                autoUpload && self.upload(fileId);
            }
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
                queue = self.get('queue'),id = self.get('curUploadId');
            if (!S.isObject(result)) return false;
            //文件上传状态
            status = result.status;
            if (status) {
                //修改队列中文件的状态为success（上传完成）
                queue.fileStatus(id, queue.constructor.status.SUCCESS);
                self._success(result.data);
                self.fire(event.SUCCESS);
            } else {
                //修改队列中文件的状态为error（上传失败）
                queue.fileStatus(id, queue.constructor.status.ERROR);
                self.fire(event.ERROR, {status : status});
            }
            //置空当前上传id
            self.set('curUploadId', EMPTY);
            self.fire(event.COMPLETE);
            //是否上传等待中的文件
            if(self.get('isUploadWaitFiles')) self.uploadWaitFile();
        },
        /**
         * 取消上传后调用的方法
         */
        _uploadStopHanlder : function(){
            var self = this,queue = self.get('queue'),
                id = self.get('curUploadId');
            //更改取消上传后的状态
            queue.fileStatus(id, queue.constructor.status.CANCEL);
            //重置当前上传文件id
            self.set('curUploadId',EMPTY);
        },
        /**
         * 上传进度监听器
         */
        _uploadProgressHandler : function(ev){
            var self = this,queue = self.get('queue'),
                            id = self.get('curUploadId');
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

        },
        /**
         * 向文件数据对象，追加服务器端返回的文件url
         * @param {Number} id 文件id
         * @param {String} sUrl 服务器端返回的文件
         */
        _addFileServerUrl : function(id,sUrl){
            if(!S.isNumber(id) || !S.isString(sUrl)) return false;
            var self = this,queue = self.get('queue'),
                file = queue.getFile(id);
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
        //当前上传的id
        curUploadId : {value : EMPTY},
        //当前文件数据，格式类似{name : 'test.jpg',input : HTMLElement,file : []}
        curFileData : {value : {}},
        uploadType : {value : {}},
        urlsInput : {value : EMPTY},
        //是否正在上传等待中的文件
        isUploadWaitFiles : {value : false}
    }});
    return Uploader;
}, {requires:['base','node','./urlsInput','./type/iframe','./type/ajax']});/**
 * @fileoverview 文件上传按钮base
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('form/uploader/button/base',function(S, Node, Base) {
    var EMPTY = '',
        LOG_PREFIX = '[AjaxUploader-Button] ',
        $ = Node.all;

    /**
     * 文件上传按钮
     * @class Button
     * @constructor
     * @param {Object} config 配置对象
     */
    function Button(target, config) {
        var self = this;
        //超类初始化
        Button.superclass.constructor.call(self, config);
        self.set('target', $(target));
    }

    S.mix(Button, {
        //支持的事件
        event : {
            'beforeShow': 'beforeShow',
            'afterShow': 'afterShow',
            'beforeHide': 'beforeHide',
            'afterHide': 'afterHide',
            'beforeRender' : 'beforeRender',
            'afterRender' : 'afterRender',
            'CHANGE' : 'change'
        }
    });

    S.extend(Button, Base, /** @lends Button.prototype*/{
        /**
         * 运行
         * @return {Object} Button的实例
         */
        render : function() {
            var self = this,
                target = self.get('target'),
                render = self.fire(Button.event.beforeRender);
            if (render === false) {
                S.log(LOG_PREFIX + 'button render was prevented.')
                return false;
            } else {
                if (target == null) {
                    S.log(LOG_PREFIX + 'Cannot find target!');
                    return false;
                }
                self._createInput();
                self.fire(Button.event.afterRender);
                S.log(LOG_PREFIX + 'button was rendered just now.');
                return self;
            }
        },
        /**
         * 显示按钮
         */
        show : function() {
            var self = this,
                target = self.get('target'),
                disableCls = self.get('cls').disabled,
                input = self.get('fileInput'),
                show = self.fire(Button.event.beforeShow);
            if (show === false) {
                S.log(LOG_PREFIX + 'show button event was prevented.');
            } else {
                // $(target).show();
                $(target).removeClass(disableCls);
                $(input).show();
                self.fire(Button.event.afterShow);
                S.log(LOG_PREFIX + 'button showed.');
            }
        },
        /**
         * 隐藏按钮
         */
        hide : function() {
            var self = this,
                target = self.get('target'),
                disableCls = self.get('cls').disabled,
                input = self.get('fileInput'),
                hide = self.fire(Button.event.beforeHide);
            if (hide === false) {
                S.log(LOG_PREFIX + 'hide button event was prevented.');
            } else {
                // $(target).hide();
                $(target).addClass(disableCls);
                $(input).hide();
                self.fire(Button.event.afterHide);
                S.log(LOG_PREFIX + 'button showed.');
            }
        },
        /**
         * 重置按钮
         * @return {Object} Button的实例
         */
        _reset : function() {
            var self = this,
                inputContainer = self.get('inputContainer');
            //移除表单上传域容器
            $(inputContainer).remove();
            self.set('inputContainer', EMPTY);
            self.set('fileInput', EMPTY);
            //重新创建表单上传域
            self._createInput();
            return self;
        },
        /**
         * 创建隐藏的表单上传域
         * @return {HTMLElement} 文件上传域容器
         */
        _createInput : function() {
            var self = this,
                target = self.get('target'),
                name = self.get('name'),
                tpl = self.get('tpl'),
                multiple = self.get('multiple'),
                html,
                inputContainer,
                fileInput;
            if (!S.isString(name) || !S.isString(tpl)) {
                S.log(LOG_PREFIX + 'No name or tpl specified.');
                return false;
            }
            html = S.substitute(tpl, {
                'name' : name
            });
            // TODO: inputContainer = DOM.create(html);
            inputContainer = $(html);
            //向body添加表单文件上传域
            $(inputContainer).appendTo(target);
            fileInput = $(inputContainer).children('input');
            // TODO: 开启多选上传
            // multiple && DOM.attr('multiple', 'multiple');
            //上传框的值改变后触发
            $(fileInput).on('change', self._changeHandler, self);
            //DOM.hide(fileInput);
            self.set('fileInput', fileInput);
            self.set('inputContainer', inputContainer);
            // self.resetContainerCss();
            return inputContainer;
        },
        /**
         * 文件上传域的值改变时触发
         * @param {Object} ev 事件对象
         */
        _changeHandler : function(ev) {
            var self = this,
                fileInput = self.get('fileInput'),
                value = $(fileInput).val();
            if (value == EMPTY) {
                S.log(LOG_PREFIX + 'No file selected.');
                return false;
            }
            self.fire(Button.event.CHANGE, {
                files: ev.target.files,
                input: $(fileInput).clone().getDOMNode()
            });
            S.log(LOG_PREFIX + 'button change event was fired just now.');
            // change完之后reset按钮，防止选择同一个文件无法触发change事件
            self._reset();
        }
    }, {
        ATTRS : /** @lends Button */{
            /**
             * target
             */
            target: {
                value: null
            },
            /**
             * 对应的表单上传域
             * @type HTMLElement
             */
            fileInput: {
                value: EMPTY
            },
            inputContainer: {
                value: EMPTY
            },
            /**
             * 隐藏的表单上传域的模板
             * @type String
             */
            tpl : {
                value : '<div class="ks-ajax-uploader-input-container"><input type="file" name="{name}" hidefoucs="true" class="ks-ajax-uploader-input" /></div>'
            },
            /**
             * 隐藏的表单上传域的name值
             * @type String
             */
            name : {
                value : 'fileInput',
                setter : function(v) {
                    if (this.get('fileInput')) {
                        $(this.get('fileInput')).attr('name', v);
                    }
                    return v;
                }
            },
            /**
             * 是否可用,false为可用
             * @type Boolean
             */
            disabled : {
                value : false,
                setter : function(v) {
                    var self = this;
                    if (v) {
                        self.hide();
                    } else {
                        self.show();
                    }
                    return v;
                }
            },
            /**
             * 样式
             * @type Object
             */
            cls : {
                value : {
                    disabled : 'uploader-button-disabled'
                }
            }
        }
    });

    return Button;

}, {
    requires:[
        'node',
        'base'
    ]
});
/**
 * @fileoverview 文件上传队列列表显示和处理
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('form/uploader/queue/base', function (S, Node, Base, Status) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader-queue]:';

    /**
     * @name Queue
     * @class 文件上传队列
     * @constructor
     * @extends Base
     * @requires Node,Status
     */
    function Queue(target, config) {
        var self = this;
        //调用父类构造函数
        Queue.superclass.constructor.call(self, config);
        //队列目标
        self.set('target', $(target));
    }

    S.mix(Queue, /**@lends Queue*/ {
        /**
         * 模板
         */
        tpl:{
            DEFAULT:'<li id="queue-file-{id}" class="clearfix" data-name="{name}">' +
                '<div class="f-l sprite file-icon"></div>' +
                '<div class="f-l">{name}</div>' +
                '<div class="f-l file-status J_FileStatus"></div>' +
                '</li>'
        },
        /**
         * 支持的事件
         */
        event:{
            //添加完一个文件后的事件
            ADD:'add',
            //删除文件后触发
            REMOVE:'remove',
            //清理队列所有的文件后触发
            CLEAR : 'clear'
        },
        /**
         * 文件的状态
         */
        status:Status.type,
        //样式
        cls:{
            QUEUE:'ks-uploader-queue'
        },
        hook:{
            //状态
            STATUS:'.J_FileStatus'
        },
        FILE_ID_PREFIX : 'file-'
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Queue, Base, /** @lends Queue.prototype*/{
        /**
         * 运行组件
         * @return {Queue}
         */
        render:function () {
            var self = this, $target = self.get('target');
            $target.addClass(Queue.cls.QUEUE);
            return self;
        },
        /**
         * 向上传队列添加文件
         * @param {Object} file 文件信息，格式类似{'name' : 'test.jpg','size' : 2000,'input' : {},'file' : {'name' : 'test.jpg','type' : 'image/jpeg','size' : 2000}}
         * @return {NodeList} 文件节点
         */
        add:function (file, callback) {
            var self = this, event = Queue.event,
                duration = self.get('duration'),
                index,fileData = {};
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + 'add()参数file不合法！');
                return false;
            }
            //设置文件对象
            fileData = self._setAddFileData(file);
            index = self.getFileIndex(fileData.id);
            //更换文件状态为等待
            self.fileStatus(index, Queue.status.WAITING);
            //显示文件信息li元素
            fileData.target.fadeIn(duration, function () {
                callback && callback.call(self, index, fileData);
                self.fire(event.ADD, {index:index, file:fileData, target:fileData.target});
            });
            return file;
        },
        /**
         * 删除队列中指定id的文件
         * @param {Number} indexOrFileId 文件数组索引或文件id
         * @param {Function} callback 删除元素后执行的回调函数
         */
        remove:function (indexOrFileId, callback) {
            var self = this, files = self.get('files'), file, $file,
                duration = self.get('duration');
            //参数是字符串，说明是文件id，先获取对应文件数组的索引
            if(S.isString(indexOrFileId)){
                indexOrFileId = self.getFileIndex(indexOrFileId);

            }
            //文件数据对象
            file = files[indexOrFileId];
            if(!S.isObject(file)){
                S.log(LOG_PREFIX + 'remove()不存在index为'+indexOrFileId + '的文件数据');
                return false;
            }
            $file = file.target;
            $file.fadeOut(duration, function () {
                $file.remove();
                callback && callback.call(self, file);
                self.fire(Queue.event.REMOVE, {id:indexOrFileId, file:file});
            });
            //将该id的文件过滤掉
            files = S.filter(files,function(file,i){
                return i !== indexOrFileId;
            });
            self.set('files', files);
            return file;
        },
        /**
         * 清理队列
         */
        clear : function(){
            var self = this,files;
            _remove();
            //移除元素
            function _remove(){
                files = self.get('files');
                if(!files.length){
                    self.fire(Queue.event.CLEAR);
                    return false;
                }
                self.remove(0,function(){
                    _remove();
                });
            }
        },
        /**
         * 获取或设置文件状态
         * @param {Number} index 文件数组的索引值
         * @param {String} status 文件状态
         * @return {Object}
         */
        fileStatus:function (index, status, args) {
            if (!S.isNumber(index)) return false;
            var self = this, file = self.getFile(index),oStatus;
            if (!S.isPlainObject(file)) return false;
            //状态实例
            oStatus = file['status'];
            if (status) oStatus.change(status, args);
            return  oStatus;
        },
        /**
         * 获取指定索引值的队列中的文件
         * @param  {Number} id 文件id
         * @return {Object}
         */
        getFile:function (id) {
            if (!S.isNumber(id)) return false;
            var self = this, files = self.get('files'),
                file = files[id];
            if (!S.isPlainObject(file)) file = false;
            return file;
        },
        /**
         * 根据文件id来查找文件在队列中的索引
         * @param {String} fileId 文件id
         * @return {Number} index
         */
        getFileIndex : function(fileId){
            var self = this, files = self.get('files'),index = -1;
            S.each(files,function(file,i){
                if(file.id == fileId){
                    index = i;
                    return true;
                }
            });
            return index;
        },
        /**
         * 更新文件数据对象，你可以追加数据
         * @param {Number} index 文件数组内的索引值
         * @param {Object} data 数据
         * @return {Object}
         */
        updateFile:function (index, data) {
            if (!S.isNumber(index)) return false;
            if (!S.isObject(data)) {
                S.log(LOG_PREFIX + 'updateFile()的data参数有误！');
                return false;
            }
            var self = this, files = self.get('files'),
                file = self.getFile(index);
            if (!file) return false;
            S.mix(file, data);
            files[index] = file;
            self.set('files', files);
            return file;
        },
        /**
         * 获取等指定状态的文件对应的文件数组index的数组
         * param {String} type 状态类型
         * @return {Array}
         */
        getIndexs:function (type) {
            var self = this, files = self.get('files'),
                status, indexs = [];
            if (!files.length) return indexs;
            S.each(files, function (file, index) {
                if (S.isObject(file)) {
                    status = file.status;
                    //文件状态
                    if (status.get('curType') == type) {
                        indexs.push(index);
                    }
                }
            });
            return indexs;
        },
        /**
         * 获取指定状态下的文件
         * @param {String} status 状态类型
         * @return {Array}
         */
        getFiles : function(status){
            var self = this,files = self.get('files'),oStatus,statusFiles = [];
            if(!files.length) return false;
            S.each(files,function(file){
                if(file){
                    oStatus = file.status;
                    oStatus.get('curType') == status && statusFiles.push(file);
                }
            });
            return statusFiles;
        },
        /**
         * 添加文件时先向文件数据对象追加id、target、size等数据
         * @param {Object} file 文件数据对象
         * @return {Object} 新的文件数据对象
         */
        _setAddFileData:function (file) {
            var self = this,
                files = self.get('files'),
                uploader = self.get('uploader');
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_updateFileData()参数file不合法！');
                return false;
            }
            //设置文件唯一id
            file.id = S.guid(Queue.FILE_ID_PREFIX);
            //转换文件大小单位为（kb和mb）
            if (file.size) file.textSize = Status.convertByteSize(file.size);
            //文件信息元素
            file.target = self._appendFileHtml(file);
            //状态实例
            file.status = self._renderStatus(file);
            //传递Uploader实例给Status
            if (S.isObject(uploader)) file.status.set('uploader', uploader);
            files.push(file);
            return file;
        },
        /**
         * 向列表添加li元素（文件信息）
         * @param {Object} data 文件对象数据
         * @return {NodeList}
         */
        _appendFileHtml:function (data) {
            var self = this, $target = self.get('target'),
                //文件信息显示模板
                tpl = self.get('tpl'),
                hFile = S.substitute(tpl, data);
            return $(hFile).hide().appendTo($target).data('data-file', data);

        },
        /**
         * 运行Status
         * @param {Object} file  文件数据
         * @return {Status} 状态实例
         */
        _renderStatus:function (file) {
            var self = this, $file = file.target, hook = Queue.hook.STATUS, elStatus;
            if (!$file.length) return false;
            //状态层
            elStatus = $file.children(hook);
            //实例化状态类
            return new Status(elStatus, {queue:self, file:file});
        }
    }, {ATTRS:/** @lends Queue*/{
        /**
         * 模板
         * @type String
         */
        tpl:{ value:Queue.tpl.DEFAULT },
        /**
         * 动画速度
         */
        duration:{value:0.3},
        /**
         * 队列元素
         */
        target:{value:EMPTY},
        /**
         * 文件信息数据
         */
        files:{value:[]},
        //上传组件实例
        uploader:{value:EMPTY}
    }});

    return Queue;
}, {requires:['node', 'base', './status']});
/**
 * @fileoverview 进度条
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('form/uploader/queue/progressBar',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,
        PROGRESS_BAR = 'progressbar',ROLE = 'role',
        ARIA_VALUEMIN = 'aria-valuemin',ARIA_VALUEMAX = 'aria-valuemax',ARIA_VALUENOW = 'aria-valuenow',
        DATA_VALUE = 'data-value';
    /**
     * @name ProgressBar
     * @class 进度条
     * @constructor
     * @extends Base
     * @requires Node
     */
    function ProgressBar(wrapper, config) {
        var self = this;
        //调用父类构造函数
        ProgressBar.superclass.constructor.call(self, config);
        self.set('wrapper',$(wrapper));
    }
    S.mix(ProgressBar, /** @lends ProgressBar.prototype*/{
        /**
         * 模板
         */
        tpl : {
            DEFAULT:'<div class="ks-progress-bar-value" data-value="{value}"></div>'
        },
        /**
         * 组件用到的样式
         */
        cls : {
            PROGRESS_BAR : 'ks-progress-bar',
            VALUE : 'ks-progress-bar-value'
        },
        /**
         * 组件支持的事件
         */
        event : {
            RENDER : 'render',
            CHANGE : 'change',
            SHOW : 'show',
            HIDE : 'hide'
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(ProgressBar, Base, /** @lends ProgressBar.prototype*/{
        /**
         * 运行
         */
        render : function() {
            var self = this,$wrapper = self.get('wrapper'),
                width = self.get('width');
            if(!$wrapper.length) return false;
            //给容器添加ks-progress-bar样式名
            $wrapper.addClass(ProgressBar.cls.PROGRESS_BAR)
                    .width(width);
            self._addAttr();
            !self.get('visible') && self.hide();
            self.set('bar',self._create());
            self.fire(ProgressBar.event.RENDER);
        },
        /**
         * 显示进度条
         */
        show : function(){
            var self = this,$wrapper = self.get('wrapper');
            $wrapper.fadeIn(self.get('duration'),function(){
                self.set('visible',true);
                self.fire(ProgressBar.event.SHOW,{visible : true});
            });
        },
        /**
         * 隐藏进度条
         */
        hide : function(){
            var self = this,$wrapper = self.get('wrapper');
            $wrapper.fadeOut(self.get('duration'),function(){
                self.set('visible',false);
                self.fire(ProgressBar.event.HIDE,{visible : false});
            });
        },
        /**
         * 创建进度条
         * @return {NodeList}
         */
        _create : function(){
            var self = this,
                $wrapper = self.get('wrapper'),
                value = self.get('value'),tpl = self.get('tpl'),
                html = S.substitute(tpl, {value : value}) ;
            $wrapper.html('');
            return $(html).appendTo($wrapper);

        },
        /**
         * 给进度条容器添加一些属性
         * @return {Object} ProgressBar的实例
         */
        _addAttr : function() {
            var self = this,$wrapper = self.get('wrapper'),value = self.get('value');
            $wrapper.attr(ROLE, PROGRESS_BAR);
            $wrapper.attr(ARIA_VALUEMIN, 0);
            $wrapper.attr(ARIA_VALUEMAX, 100);
            $wrapper.attr(ARIA_VALUENOW, value);
            return self;
        }
    }, {ATTRS : /** @lends ProgressBar*/{
        /**
         * 容器
         */
        wrapper : {value : EMPTY},
        /**
         * 进度条元素
         */
        bar : {value : EMPTY},
        /**
         * 进度条宽度
         */
        width : { value:100 },
        /**
         * 当前进度
         */
        value : {
            value : 0,
            setter : function(v) {
                var self = this,$wrapper = self.get('wrapper'),$bar = self.get('bar'),
                    speed = self.get('speed'),
                    width;
                if (v > 100) v = 100;
                if (v < 0) v = 0;
                //将百分比宽度换算成像素值
                width = $wrapper.width() * (v / 100);
                $bar.animate({'width':width + 'px'},speed,'none',function(){
                    $wrapper.attr(ARIA_VALUENOW,v);
                    $bar.attr(DATA_VALUE,v);
                    self.fire(ProgressBar.event.CHANGE,{value : v,width : width});
                });
                return v;
            }
        },
        /**
         * 控制进度条的可见性
         */
        visible : { value:true },
        /**
         * 显隐动画的速度
         */
        duration : {
          value : 0.3
        },
        /**
         * 模板
         */
        tpl : {
            value : ProgressBar.tpl.DEFAULT
        },
        speed : {value : 0.2}
    }});
    return ProgressBar;
}, {requires : ['node','base']});/**
 * @fileoverview 文件改变状态后改变状态元素的内容
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('form/uploader/queue/status',function(S, Node, Base,ProgressBar) {
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
         * @param {Number} bytes 文件大小字节数
         * @return {String} 文件大小
         */
        convertByteSize : function(bytes){
            var i = -1;
            do {
                bytes = bytes / 1024;
                i++;
            } while (bytes > 99);
            return Math.max(bytes, 0.1).toFixed(1) + ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];
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
            waiting : '<div class="waiting-status">等待上传，<a href="#Upload" class="J_Upload">点此上传</a> </div>',
            start : '<div class="start-status clearfix"><div class="f-l  J_ProgressBar uploader-progress"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                ' <a class="f-l J_UploadCancel upload-cancel" href="#uploadCancel">取消</a></div> ',
            success : ' <a href="#fileDel" class="J_FileDel">删除</a>  ',
            cancel : '<div class="cancel-status">已经取消上传，<a href="#reUpload" class="J_ReUpload">点此重新上传</a> </div>',
            error : '<div class="error-status upload-error">{msg}<a href="#fileDel" class="J_FileDel">点此删除</a></div>'
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
}, {requires : ['node','base','./progressBar']});/**
 * @fileoverview 运行文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('form/uploader/render',function (S, Base, Node, Uploader, Button) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploaderRender]:',
        dataName = {CONFIG:'data-config'};

    /**
     * 解析组件在页面中data-config成为组件的配置
     * @param {String} hook 组件钩子
     * @param {String} dataConfigName 配置名
     * @return {Object}
     */
    function parseConfig(hook, dataConfigName) {
        var config = {}, sConfig, DATA_CONFIG = dataConfigName || dataName.CONFIG;
        sConfig = $(hook).attr(DATA_CONFIG);
        if (!S.isString(sConfig)) return {};
        try {
            config = JSON.parse(sConfig);
        } catch (err) {
            S.log(LOG_PREFIX + '请检查' + hook + '上' + DATA_CONFIG + '属性内的json格式是否符合规范！');
        }
        return config;
    }

    /**
     * @name RenderUploader
     * @class 运行文件上传组件
     * @constructor
     * @param {String | HTMLElement} buttonTarget 上传按钮目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素
     * @param {Object} config 配置
     */
    function RenderUploader(buttonTarget, queueTarget, config) {
        var self = this;
        //合并配置
        config = S.mix(parseConfig(buttonTarget), config);
        //超类初始化
        RenderUploader.superclass.constructor.call(self, config);
        self.set('buttonTarget', buttonTarget);
        self.set('queueTarget', queueTarget);
        self.set('uploaderConfig', config);
        self._init();
    }

    S.extend(RenderUploader, Base, {
        /**
         * 初始化组件
         */
        _init:function () {
            var self = this, uploaderConfig = self.get('uploaderConfig'),
                button = self._initButton(),
                queue;
            self.set('button', button);
            self._initThemes(function (theme) {
                queue = theme.get('queue');
                //配置增加按钮实例和队列实例
                S.mix(uploaderConfig, {button:button, queue:queue});
                var uploader = new Uploader(uploaderConfig);
                uploader.render();
                self.set('uploader', uploader);
                if(theme.afterUploaderRender) theme.afterUploaderRender(uploader);
                self.fire('init', {uploader:uploader});
            });
        },
        /**
         * 初始化模拟的上传按钮
         * @return {Button}
         */
        _initButton:function () {
            var self = this, target = self.get('buttonTarget'), name = self.get('name');
            //实例化上传按钮
            return new Button(target, {name:name});
        },
        _initThemes:function (callback) {
            var self = this, theme = self.get('theme');
            S.use(theme + '/index', function (S, Theme) {
                var queueTarget = self.get('queueTarget'),
                    theme = new Theme({queueTarget:queueTarget});
                callback && callback.call(self, theme);
            })
        },
        /**
         * 初始化上传文件队列
         * @return {Queue}
         */
        _initQueue:function () {
            var self = this, target = self.get('queueTarget');
            return new Queue(target);
        },
        /**
         * 文件上传验证
         */
        _auth:function () {
            /*var self = this,buttonTarget = self.get('buttonTarget'),
             $btn = $(buttonTarget),
             //Button的实例
             button = self.get('button'),
             //TODO:需要修改
             fileInput = button.fileInput,
             DATA_NAME = dataName.VALID, valid;
             if(!$btn.length) return false;
             valid = $btn.attr(DATA_NAME);
             //不存在验证配置，直接退出
             if(!valid) return false;
             $(fileInput).attr(DATA_NAME,valid);*/
        }
    }, {
        ATTRS:{
            theme:{value:'form/uploader/themes/default' },
            /**
             * 按钮目标元素
             */
            buttonTarget:{value:EMPTY},
            /**
             * 队列目标元素
             */
            queueTarget:{value:EMPTY},
            /**
             * 上传组件配置
             */
            uploaderConfig:{},
            /**
             * Button（上传按钮）的实例
             */
            button:{value:EMPTY},
            /**
             * Queue（上传队列）的实例
             */
            queue:{value:EMPTY},
            uploader:{value:EMPTY}
        }
    });
    return RenderUploader;
}, {requires:['base', 'node', './base', './button/base']});KISSY.add('form/uploader/themes/default/index',function(S, Node, Base,Queue) {
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
}, {requires : ['node','base','../../queue/base','./style.css']});KISSY.add('form/uploader/themes/grayQueue/index',function(S, Node, DefaultTheme,Queue) {
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
                queue = uploader.get('queue'),
                //开始上传按钮
                $startUpload = $(self.get('elStartUpload')),
                //总进度数容器
                $totalProgressNum = $(self.get('elTotalProgressNum')),
                //上传按钮不可用时的样式名
                startUploadDisabledCls = self.get('startUploadDisabledCls');
            //监听队列的添加文件后事件
            queue.on('add',function(ev){
                $startUpload.removeClass( startUploadDisabledCls);
            });
            //全部上传完成后触发
            uploader.on('uploadAll',function(){
                //进度条
                var progressBar = uploader.get('progressBar');
                //强制进度到100%，防止部分上传只能到99%的问题
                progressBar.set('value',100);
                progressBar.hide();
                $totalProgressNum.text('100%');
            });
            //点击开始上传的按钮
            $startUpload.on('click',function(ev){
                ev.preventDefault();
                //如果不是禁用状态，上传所有等待中的文件
                if(!$startUpload.hasClass( startUploadDisabledCls)){
                    var progressBar = uploader.get('progressBar');
                    if(progressBar) progressBar.show();
                    uploader.uploadAll();
                }
            })
        }
    }, {ATTRS : /** @lends GrayQueue*/{
        elStartUpload : {value : '#J_StartUpload'},
        startUploadDisabledCls : {value : 'start-upload-disabled'},
        elTotalProgressNum : {value : '#J_TotalProgressNum'}
    }});
    return GrayQueue;
}, {requires : ['node','../default/index','./queue','./style.css']});KISSY.add('form/uploader/themes/grayQueue/queue',function(S, Node, QueueBase, Status) {
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
         * @param {Object} file  �ļ����
         * @return {Status} ״̬ʵ��
         */
        _renderStatus : function(file) {
            var self = this,$file = file.target,elStatus;
            if (!$file.length) return false;
            //״̬��
            elStatus = $file.children('.J_FileStatus');
            //ʵ��״̬��
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
}, {requires : ['node','../../queue/base','./status']});KISSY.add('form/uploader/themes/grayQueue/status',function(S, Node,ProgressBar, StatusBase) {
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
                queue = self.get('queue'),
                file = self.get('file'),
                id = file.id,
                //所有文件大小
                total = uploader.get('total'),
                //等待上传的文件大小
                size = file.size,
                //刷新状态层内容
                $content = self._changeDom(waitingTpl),
                //删除图标元素
                $del = $content.children('.J_DelFile');
            //点击删除图标
            if($del.length){
                $del.on('click',function(ev){
                    //删除队列中的文件
                    queue.remove(id);
                    //文件总字节数需要减去该文件大小
                    total  -= size;
                    $('#J_TotalSize').text(StatusBase.convertByteSize(total));
                    uploader.set('total',total);
                })
            }
            //不存在文件大小，直接退出
            if(!size) return false;
            //如果不存在已经加载字节数，那么设置为0
            if(!total){
                total = size;
                uploader.set('loaded',0);
            }else{
                //总字节数加上当前文件字节数
                total += size;
            }
            //改变总字节数，StatusBase.convertByteSize方法，会将345345改成kb或mb单位显示
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
                $content;
            if (!S.isString(startTpl)) return false;
            //改变状态层内容
            $content = self._changeDom(startTpl);
            //如果是ajax异步上传，加入进度显示
            if (uploadType == 'ajax') {
                var progressBar;
                //如果不存在进度条，先初始化进度条组件
                if(!uploader.get('progressBar')){
                    progressBar = new ProgressBar($('#J_ProgressBar'));
                    progressBar.render();
                    uploader.set('progressBar',progressBar);
                }
                //清零进度条
                uploader.get('progressBar').set('value',0);
                //将进度百分比设置为0%
                var $progressNum = $content.children('.J_ProgressNum');
                $progressNum.html("0%");
                self.set('elProgressNum',$progressNum);
            }
            //给li增加current-upload-file样式
            var $parent = target.parent();
            $parent.addClass('current-upload-file');
        },
        /**
         * 正在上传时候刷新状态层的内容
         * @param data
         */
        _progress : function(data){
            var self = this,
                //已经加载的字节数
                loaded = data.loaded,
                //当前文件字节总数
                total = data.total,
                //百分比
                val = Math.ceil(loaded/total * 100),
                uploader = self.get('uploader'),
                //进度条
                proccessBar = uploader.get('progressBar'),
                //所有文件的字节总数
                allFileTotal = uploader.get('total'),
                //所有文件已经加载的字节数
                allFileLoaded = uploader.get('loaded'),
                $elProgressNum = self.get('elProgressNum');
            if(!$elProgressNum.length || proccessBar == EMPTY) return false;
            $elProgressNum.html(val + '%');
            //改变总进度显示
            loaded += allFileLoaded;
            val = Math.ceil(loaded/allFileTotal * 100);
            proccessBar.set('value',val);
            $('#J_TotalProgressNum').text(val + '%');
        },
        /**
         * 文件上传成功后
         */
        _success : function(){
            var self = this, tpl = self.get('tpl'),successTpl = tpl.success,
                //状态层容器
                target = self.get('target'),
                queue = self.get('queue'),
                file = self.get('file'),
                size = file.size,
                uploader = self.get('uploader'),
                loaded = uploader.get('loaded');
            if (!S.isString(successTpl)) return false;
            self._changeDom(successTpl);
            //删除li的current-upload-file样式
            var $parent = target.parent();
            $parent.removeClass('current-upload-file');
            if(!size) return false;
            //设置所有文件已经加载的字节数
            loaded += size;
            uploader.set('loaded',loaded);
        }
    }, {ATTRS : /** @lends Status*/{
        /**
         * 模板
         */
        tpl : {value : {
            waiting : '<div class="clearfix"><div class="f-l">0%</div><div class="f-l uploader-icon del-icon J_DelFile"></div></div>',
            start : '<div class="clearfix"><div class="J_ProgressNum"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                '</div> ',
            success : '<div class="uploader-icon success-icon">100%</div>',
            cancel : '<div>已经取消上传，<a href="#reUpload" class="J_ReUpload">点此重新上传</a> </div>',
            error : '<div class="upload-error">{msg}<a href="#fileDel" class="J_FileDel">点此删除</a></div>'
        }
        }
    }});
    return Status;
}, {requires : ['node','../../queue/progressBar','../../queue/status']});/**
 * @fileoverview ajax方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('form/uploader/type/ajax',function(S, Node, UploadType) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-AjaxType]:';

    /**
     * @name AjaxType
     * @class ajax方案上传
     * @constructor
     * @extends UploadType
     * @requires Node
     */
    function AjaxType(config) {
        var self = this;
        //调用父类构造函数
        AjaxType.superclass.constructor.call(self, config);
        //处理传递给服务器端的参数
        self._processData();
    }

    S.mix(AjaxType, /** @lends AjaxType.prototype*/{
        /**
         * 事件列表
         */
        event : S.merge(UploadType.event,{
            PROGRESS : 'progress'
        })
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(AjaxType, UploadType, /** @lends AjaxType.prototype*/{
        /**
         * 上传文件
         * @param {HTMLElement} fileInput 文件input
         * @return {AjaxType}
         */
        upload : function(fileInput) {
            //不存在文件信息集合直接退出
            if (!fileInput) {
                S.log(LOG_PREFIX + 'upload()，fileInput参数有误！');
                return false;
            }
            var self = this, files = fileInput.files, file;
            //不存在文件信息集合直接退出
            if (!files.length) {
                S.log(LOG_PREFIX + 'upload()，不存在要上传的文件！');
                return false;
            }
            file = files[0];
            self._addFileData(fileInput, file);
            self.send();
            return self;
        },
        /**
         * 停止上传
         * @return {AjaxType}
         */
        stop : function() {
            var self = this,xhr = self.get('xhr');
            if (!S.isObject(xhr)) {
                S.log(LOG_PREFIX + 'stop()，io值错误！');
                return false;
            }
            //中止ajax请求，会触发error事件
            xhr.abort();
            self.fire(AjaxType.event.STOP);
            return self;
        },
        /**
         * 发送ajax请求
         * @return {AjaxType}
         */
        send : function() {
            var self = this,ajaxConfig = self.get('ajaxConfig'),
                //服务器端处理文件上传的路径
                action = self.get('action'),
                data = self.get('formData');
            var xhr = new XMLHttpRequest();
            //TODO:如果使用onProgress存在第二次上传不触发progress事件的问题
            xhr.upload.addEventListener('progress',function(ev){
                self.fire(AjaxType.event.PROGRESS, { 'loaded': ev.loaded, 'total': ev.total });
            });
            xhr.onload = function(ev){
                var result = {};
                try{
                    result = S.JSON.parse(xhr.responseText);
                }catch(e){
                    S.log(LOG_PREFIX + 'ajax返回结果集responseText格式不合法！');
                }
                self.fire(AjaxType.event.SUCCESS, {result : result});
            };
            xhr.open("POST", action, true);
            xhr.send(data);
            self.set('xhr',xhr);
            return self;
        },
        /**
         * 处理传递给服务器端的参数
         */
        _processData : function() {
            var self = this,data = self.get('data'),
                formData = self.get('formData');
            //将参数添加到FormData的实例内
            S.each(data, function(val, key) {
                formData.append(key, val);
            });
            self.set('formData', formData);
        },
        /**
         * 将文件信息添加到FormData内
         * @param {HTMLElement} fileInput 文件上传域
         * @param {Object} file 文件信息
         */
        _addFileData : function(fileInput, file) {
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_addFileData()，file参数有误！');
                return false;
            }
            var self = this,
                formData = self.get('formData'),
                fileDataName = self.get('fileDataName');
            if (fileDataName == EMPTY) {
                fileDataName = $(fileInput).attr('name');
                self.set('fileDataName', fileDataName);
            }
            formData.append(fileDataName, file);
            self.set('formData', formData);
        }
    }, {ATTRS : /** @lends AjaxType*/{
        /**
         * 表单数据对象
         */
        formData : {value : new FormData()},
        /**
         * ajax配置
         */
        ajaxConfig : {value : {
            type : 'post',
            processData : false,
            cache : false,
            dataType : 'json',
            contentType: false
        }
        },
        xhr : {value : EMPTY},
        fileDataName : {value : EMPTY},
        form : {value : {}},
        fileInput : {value : EMPTY}
    }
    });
    return AjaxType;
}, {requires:['node','./base']});/**
 * @fileoverview 上传方式类的基类
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('form/uploader/type/base',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all;

    /**
     * @name UploadType
     * @class 上传方式类的基类
     * @constructor
     * @extends Base
     * @requires Node
     */
    function UploadType(config) {
        var self = this;
        //调用父类构造函数
        UploadType.superclass.constructor.call(self, config);
    }

    S.mix(UploadType, {
        /**
         * 事件列表
         */
        event : {
            //开始上传后触发
            START : 'start',
            //停止上传后触发
            STOP : 'stop',
            //成功请求
            SUCCESS : 'success',
            //上传失败后触发
            ERROR : 'error'
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UploadType, Base, /** @lends UploadType.prototype*/{
        /**
         * 上传文件
         */
        upload : function() {

        },
        /**
         * 停止上传
         */
        stop : function(){
            
        }
    }, {ATTRS : /** @lends UploadType*/{
        /**
         * 服务器端路径
         */
        action : {value : EMPTY},
        /**
         * 传送给服务器端的参数集合（会被转成hidden元素post到服务器端）
         */
        data : {value : {}}
    }});

    return UploadType;
}, {requires:['node','base']});/**
 * @fileoverview iframe方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('form/uploader/type/iframe',function(S, Node, UploadType) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-iframeType]:',ID_PREFIX = 'ks-uploader-iframe-';

    /**
     * @name IframeType
     * @class iframe方案上传
     * @constructor
     * @extends UploadType
     * @requires Node
     */
    function IframeType(config) {
        var self = this;
        //调用父类构造函数
        IframeType.superclass.constructor.call(self, config);
    }

    S.mix(IframeType, /**@lends IframeType*/ {
        /**
         * 会用到的html模板
         */
        tpl : {
            IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" border="no" width="1" height="1" style="display: none;" />',
            FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}">{hiddenInputs}</form>',
            HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
        },
        /**
         * 事件列表
         */
        event : S.mix(UploadType.event,{
              //创建iframe和form后触发
            CREATE : 'create',
            //删除form后触发
            REMOVE : 'remove'
        })
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(IframeType, UploadType, /** @lends IframeType.prototype*/{
        /**
         * 上传文件
         * @param {HTMLElement} fileInput 文件input
         */
        upload : function(fileInput) {
            var self = this,$input = $(fileInput),form;
            if (!$input.length) return false;
            self.fire(IframeType.event.START, {input : $input});
            self.set('fileInput', $input);
            //创建iframe和form
            self._create();
            form = self.get('form');
            //提交表单到iframe内
            form.getDOMNode().submit();
        },
        /**
         * 停止上传
         * @return {IframeType}
         */
        stop : function() {
            var self = this,iframe = self.get('iframe');
            iframe.attr('src', 'javascript:"<html></html>";');
            self.fire(IframeType.event.STOP);
            self.fire(IframeType.event.ERROR, {status : 'abort',msg : '上传失败，原因：abort'});
            return self;
        },
        /**
         * 将参数数据转换成hidden元素
         * @param {Object} data 对象数据
         * @return {String} hiddenInputHtml hidden元素html片段
         */
        dataToHidden : function(data) {
            if (!S.isObject(data) || S.isEmptyObject(data)) {
                S.log(LOG_PREFIX + 'data参数不是对象或者为空！');
                return false;
            }
            var self = this,hiddenInputHtml = EMPTY,
                //hidden元素模板
                tpl = self.get('tpl'),hiddenTpl = tpl.HIDDEN_INPUT;
            if (!S.isString(hiddenTpl)) return false;
            for (var k in data) {
                hiddenInputHtml += S.substitute(hiddenTpl, {'name' : k,'value' : data[k]});
            }
            return hiddenInputHtml;
        },
        /**
         * 创建一个空的iframe，用于文件上传表单提交后返回服务器端数据
         * @return {NodeList}
         */
        _createIframe : function() {
            var self = this,
                //iframe的id
                id = self.get('id'),
                //iframe模板
                tpl = self.get('tpl'),iframeTpl = tpl.IFRAME,
                existIframe = self.get('iframe'),
                iframe,$iframe;
            //先判断是否已经存在iframe，存在直接返回iframe
            if (!S.isEmptyObject(existIframe)) return existIframe;
            if (!S.isString(iframeTpl)) {
                S.log(LOG_PREFIX + 'iframe的模板不合法！');
                return false;
            }
            if (!S.isString(id)) {
                S.log(LOG_PREFIX + 'id必须存在且为字符串类型！');
                return false;
            }
            //创建处理上传的iframe
            iframe = S.substitute(tpl.IFRAME, { 'id' : id });
            $iframe = $(iframe);
            //监听iframe的load事件
            $iframe.on('load', self._iframeLoadHandler, self);
            $('body').append($iframe);
            self.set('iframe', $iframe);
            return $iframe;
        },
        /**
         * iframe加载完成后触发（文件上传结束后）
         */
        _iframeLoadHandler : function(ev) {
            var self = this,iframe = ev.target,
                errorEvent = IframeType.event.ERROR,
                doc = iframe.contentDocument || window.frames[iframe.id].document,
                result;
            if (!doc || !doc.body) {
                self.fire(errorEvent, {msg : '服务器端返回数据有问题！'});
                return false;
            }
            result = doc.body.innerHTML;
            //如果不存在json结果集，直接退出
            if (result == EMPTY) return false;
            try {
                result = JSON.parse(result);
            } catch(err) {
                S.log(LOG_PREFIX + 'json数据格式不合法！');
                self.fire(errorEvent, {msg : '数据：' + result + '不是合法的json数据'});
            }
            self.fire(IframeType.event.SUCCESS, {result : result});
            self._remove();
        },
        /**
         * 创建文件上传表单
         * @return {NodeList}
         */
        _createForm : function() {
            var self = this,
                //iframe的id
                id = self.get('id'),
                //form模板
                tpl = self.get('tpl'),formTpl = tpl.FORM,
                //想要传送给服务器端的数据
                data = self.get('data'),
                //服务器端处理文件上传的路径
                action = self.get('action'),
                fileInput = self.get('fileInput'),
                hiddens,form = EMPTY,$form;
            if (!S.isString(formTpl)) {
                S.log(LOG_PREFIX + 'form模板不合法！');
                return false;
            }
            if (!S.isObject(data)) {
                S.log(LOG_PREFIX + 'data参数不合法！');
                return false;
            }
            if (!S.isString(action)) {
                S.log(LOG_PREFIX + 'action参数不合法！');
                return false;
            }
            hiddens = self.dataToHidden(data);
            if (hiddens == EMPTY) return false;
            form = S.substitute(formTpl, {'action' : action,'target' : id,'hiddenInputs' : hiddens});
            //克隆文件域，并添加到form中
            $form = $(form).append(fileInput.clone());
            $('body').append($form);
            self.set('form', $form);
            return $form;
        },
        /**
         * 创建iframe和form
         */
        _create : function() {
            var self = this,
                iframe = self._createIframe(),
                form = self._createForm();
            self.fire(IframeType.event.CREATE, {iframe : iframe,form : form});
        },
        /**
         * 移除表单
         */
        _remove : function() {
            var self = this,form = self.get('form'),iframe = self.get('iframe');
            //移除表单
            form.remove();
            //重置form属性
            self.reset('form');
            self.fire(IframeType.event.REMOVE, {form : form});
        }
    }, {ATTRS : /** @lends IframeType*/{
        /**
         * iframe方案会用到的html模板，一般不需要修改
         */
        tpl : {value : IframeType.tpl},
        /**
         * 创建的iframeid
         */
        id : {value : ID_PREFIX + S.guid()},
        iframe : {value : {}},
        form : {value : {}},
        fileInput : {value : EMPTY}
    }});

    return IframeType;
}, {requires:['node','./base']});/**
 * @fileoverview 存储文件路径信息的隐藏域
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('form/uploader/urlsInput',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-urlsInput]:';
    /**
     * @name UrlsInput
     * @class 存储文件路径信息的隐藏域
     * @constructor
     * @extends Base
     * @requires Node
     * @param {String} wrapper 容器
     */
    function UrlsInput(wrapper, config) {
        var self = this;
        //调用父类构造函数
        UrlsInput.superclass.constructor.call(self, config);
        self.set('wrapper', $(wrapper));
    }

    S.mix(UrlsInput, /**@lends UrlsInput*/ {
        TPL : '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UrlsInput, Base, /** @lends UrlsInput.prototype*/{
        /**
         * 运行
         */
        render : function() {
            var self = this,$wrapper = self.get('wrapper'),
                name = self.get('name'),
                elInput = document.getElementsByName(name)[0];
            if (!S.isObject($wrapper)) {
                S.log(LOG_PREFIX + 'container参数不合法！');
                return false;
            }
            //如果已经存在隐藏域，那么不自动创建
            if(elInput){
                self.set('input',$(elInput));
            }else{
                self._create();
            }
        },
        /**
         * 向路径隐藏域添加路径
         * @param {String} url 路径
         */
        add : function(url){
            if(!S.isString(url)){
                S.log(LOG_PREFIX + 'add()的url参数不合法！');
                return false;
            }
            var self = this,urls = self.get('urls'),
                //判断路径是否已经存在
                isExist = self.isExist(url);
            if(isExist){
                S.log(LOG_PREFIX + 'add()，文件路径已经存在！');
                return self;
            }
            urls.push(url);
            self.set('urls',urls);
            self._val();
            return self;
        },
        /**
         * 删除隐藏域内的指定路径
         * @param {String} url 路径
         */
        remove : function(url){
            var self = this,urls = self.get('urls'),
                isExist = self.isExist(url) ;
            if(!isExist){
                S.log(LOG_PREFIX + 'remove()，不存在该文件路径！');
                return false;
            }
            urls = S.filter(urls,function(sUrl){
                return sUrl != url;
            });
            self.set('urls',urls);
            self._val();
            return urls;
        },
        /**
         * 设置隐藏域的值
         * @return {String} 
         */
        _val : function(){
            var self = this,urls = self.get('urls'),
                $input = self.get('input'),
                //多个路径间的分隔符
                split = self.get('split'),
                sUrl = urls.join(split);
            $input.val(sUrl);
            return sUrl;
        },
        /**
         * 是否已经存在指定路径
         * @param {String} url 路径
         * @return {Boolean}
         */
        isExist : function(url){
            var self = this,b = false,urls = self.get('urls');
            if(!urls.length) return false;
            S.each(urls,function(val){
                if(val == url){
                    return b = true;
                }
            });
            return b;
        },
        /**
         * 创建隐藏域
         */
        _create : function() {
            var self = this,container = self.get('wrapper'),
                tpl = self.get('tpl'),
                name = self.get('name'), urls = self.get('urls'),
                input;
            if (!S.isString(tpl) || !S.isString('name')){
                S.log(LOG_PREFIX + '_create()，tpl和name属性不合法！');
                return false;
            }
            input = $(S.substitute(tpl, {name : name,value : urls}));
            container.append(input);
            self.set('input', input);
            return input;
        }

    }, {ATTRS : /** @lends UrlsInput*/{
        name : {value : EMPTY},
        /**
         * 文件路径
         */
        urls : { value : [] },
        /**
         * input模板
         */
        tpl : {value : UrlsInput.TPL},
        /**
         * 多个路径间的分隔符
         */
        split : {value : ',',
            setter : function(v){
                var self = this;
                self._val();
                return v;
            }
        },
        /**
         * 文件路径隐藏input
         */
        input : {value : EMPTY},
        /**
         * 隐藏域容器
         */
        wrapper : {value : EMPTY}
    }});

    return UrlsInput;
}, {requires:['node','base']});
