/**
 * @fileoverview 文件上传队列列表显示和处理
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S, Node, Base, Status) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-queue]:';

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
        tpl : {
            DEFAULT:'<li id="queue-file-{id}" class="clearfix" data-name="{name}">' +
                '<div class="f-l sprite file-icon"></div>' +
                '<div class="f-l">{name}</div>' +
                '<div class="f-l file-status J_FileStatus"></div>' +
                '</li>'
        },
        /**
         * 支持的事件
         */
        event : {
            //添加完一个文件后的事件
            ADD : 'add',
            //添加多个文件后的事件
            ADD_ALL : 'addAll',
            //删除文件后触发
            REMOVE : 'remove',
            // 队列满时触发
            QUEUE_FULL: 'queueFull'
        },
        /**
         * 文件的状态
         */
        status : Status.type,
        //样式
        cls : {
            QUEUE : 'ks-uploader-queue'
        },
        hook : {
            //状态
            STATUS : '.J_FileStatus'
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Queue, Base, /** @lends Queue.prototype*/{
        /**
         * 运行组件
         * @return {Queue}
         */
        render: function() {
            var self = this,$target = self.get('target');
            $target.addClass(Queue.cls.QUEUE);
            return self;
        },
        /**
         * 向上传队列添加文件
         * @param {Object} file 文件信息
         * @return {NodeList} 文件节点
         */
        add : function(file) {
            var self = this,$target = self.get('target'),event = Queue.event,hFile,elFile,
                //预置文件id
                autoId = self.get('id'),
                //文件信息显示模板
                tpl = self.get('tpl'),
                files = self.get('files'),
                uploader = self.get('uploader');
            if(!S.isObject(file)){
                S.log(LOG_PREFIX + 'add()参数file不合法！');
                return false;
            }
            //设置文件唯一id
            file.id = autoId;
            //转换文件大小单位为（kb和mb）
            if(file.size) file.textSize = Status.convertByteSize(file.size);
            hFile = S.substitute(tpl, file);
            //将文件添加到队列之中
            elFile = $(hFile).appendTo($target).data('data-file', file);
            //文件层
            file.target = elFile;
            //状态实例
            file.status = self._renderStatus(file);
            if(S.isObject(uploader)) file.status.set('uploader',uploader);
            files[autoId] = file;
            self.set('files', files);
            //设置文件状态为等待上传
            self.fileStatus(autoId, Queue.status.WAITING);
            //增加文件id编号
            self.set('id', autoId + 1);
            self.fire(event.ADD, {id : autoId,file : file,target : file.target});
            return autoId;
        },
        /**
         * 删除队列中指定id的文件
         * @param {Number} id 文件id
         */
        remove : function(id){
            var self = this,files = self.get('files'),file = files[id],$file;
            if(S.isObject(file)){
                $file = file.target;
                $file.slideUp(0.2,function(){
                    $file.remove();
                });
                delete files[id];
                self.set('files',files);
                self.fire(Queue.event.REMOVE,{id : id,file : file});
            }
        },
        /**
         * 获取或设置文件状态
         * @param {Number} id 文件id
         * @param {String} status 文件状态
         * @return {Object}
         */
        fileStatus : function(id, status,args) {
            if (!S.isNumber(id)) return false;
            var self = this,files = self.get('files'),file = self.getFile(id),
                st = Queue.status,oStatus;
            if (!S.isPlainObject(file)) return false;
            //状态实例
            oStatus = file['status'];
            if(status) oStatus.change(status,args);
            return  oStatus;
        },
        /**
         * 获取指定索引值的队列中的文件
         * @param  {Number} id 文件id
         * @return {Object}
         */
        getFile : function(id) {
            if (!S.isNumber(id)) return false;
            var self = this,files = self.get('files'),
                file = files[id];
            if (!S.isPlainObject(file)) file = false;
            return file;
        },
        /**
         * 获取等待状态的文件id数组
         */
        getWaitFileIds : function(){
            var self = this,files = self.get('files'),
                status,waitFileIds = [];
            if(!files.length) return waitFileIds;
            S.each(files,function(file,index){
                if(S.isObject(file)){
                    status = file.status;
                    //文件状态
                    if(status.get('curType') == status.constructor.type.WAITING){
                        waitFileIds.push(index);
                    }
                }
            });
            return waitFileIds;
        },
        /**
         * 运行Status
         * @param {Object} file  文件数据
         * @return {Status} 状态实例
         */
        _renderStatus : function(file) {
            var self = this,$file = file.target,hook = Queue.hook.STATUS,elStatus;
            if (!$file.length) return false;
            //状态层
            elStatus = $file.children(hook);
            //实例化状态类
            return new Status(elStatus,{queue : self,file : file});
        }
    }, {ATTRS : /** @lends Queue*/{
        /**
         * 模板
         * @type String
         */
        tpl : { value : Queue.tpl.DEFAULT },
        target : {value : EMPTY},
        id : {value : 0},
        files : {value : []},
        //上传组件实例
        uploader : {value : EMPTY}
    }});

    return Queue;
}, {requires:['node','base','./status']});
