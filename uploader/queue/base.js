/**
 * @fileoverview �ļ��ϴ������б���ʾ�ʹ���
 * @author ��ƽ�����ӣ�<minghe36@126.com>,��Ӣ<daxingplay@gmail.com>
 **/
KISSY.add(function(S, Node, Base, Status) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-queue]:';

    /**
     * @name Queue
     * @class �ļ��ϴ�����
     * @constructor
     * @extends Base
     * @requires Node,Status
     */
    function Queue(target, config) {
        var self = this;
        //���ø��๹�캯��
        Queue.superclass.constructor.call(self, config);
        //����Ŀ��
        self.set('target', $(target));
    }

    S.mix(Queue, /**@lends Queue*/ {
        /**
         * ģ��
         */
        tpl : {
            DEFAULT:'<li id="queue-file-{id}" class="clearfix" data-name="{name}">' +
                '<div class="f-l sprite file-icon"></div>' +
                '<div class="f-l">{name}</div>' +
                '<div class="f-l file-status J_FileStatus"></div>' +
                '</li>'
        },
        /**
         * ֧�ֵ��¼�
         */
        event : {
            //�����һ���ļ�����¼�
            ADD : 'add',
            //��Ӷ���ļ�����¼�
            ADD_ALL : 'addAll',
            //ɾ���ļ��󴥷�
            REMOVE : 'remove',
            // ������ʱ����
            QUEUE_FULL: 'queueFull'
        },
        /**
         * �ļ���״̬
         */
        status : Status.type,
        //��ʽ
        cls : {
            QUEUE : 'ks-uploader-queue'
        },
        hook : {
            //״̬
            STATUS : '.J_FileStatus'
        }
    });
    //�̳���Base������getter��setterί����Base����
    S.extend(Queue, Base, /** @lends Queue.prototype*/{
        /**
         * �������
         * @return {Queue}
         */
        render: function() {
            var self = this,$target = self.get('target');
            $target.addClass(Queue.cls.QUEUE);
            return self;
        },
        /**
         * ���ϴ���������ļ�
         * @param {Object} file �ļ���Ϣ
         * @return {NodeList} �ļ��ڵ�
         */
        add : function(file) {
            var self = this,$target = self.get('target'),event = Queue.event,hFile,elFile,
                //Ԥ���ļ�id
                autoId = self.get('id'),
                //�ļ���Ϣ��ʾģ��
                tpl = self.get('tpl'),
                files = self.get('files'),
                uploader = self.get('uploader');
            if(!S.isObject(file)){
                S.log(LOG_PREFIX + 'add()����file���Ϸ���');
                return false;
            }
            //�����ļ�Ψһid
            file.id = autoId;
            //ת���ļ���С��λΪ��kb��mb��
            if(file.size) file.textSize = Status.convertByteSize(file.size);
            hFile = S.substitute(tpl, file);
            //���ļ���ӵ�����֮��
            elFile = $(hFile).appendTo($target).data('data-file', file);
            //�ļ���
            file.target = elFile;
            //״̬ʵ��
            file.status = self._renderStatus(file);
            if(S.isObject(uploader)) file.status.set('uploader',uploader);
            files[autoId] = file;
            self.set('files', files);
            //�����ļ�״̬Ϊ�ȴ��ϴ�
            self.fileStatus(autoId, Queue.status.WAITING);
            //�����ļ�id���
            self.set('id', autoId + 1);
            self.fire(event.ADD, {id : autoId,file : file,target : file.target});
            return autoId;
        },
        /**
         * ɾ��������ָ��id���ļ�
         * @param {Number} id �ļ�id
         */
        remove : function(id){
            var self = this,files = self.get('files'),file = files[id],$file;
            if(S.isObject(file)){
                $file = file.target;
                $file.fadeOut(0.3,function(){
                    $file.remove();
                });
                delete files[id];
                self.set('files',files);
                self.fire(Queue.event.REMOVE,{id : id,file : file});
            }
        },
        /**
         * ��ȡ�������ļ�״̬
         * @param {Number} id �ļ�id
         * @param {String} status �ļ�״̬
         * @return {Object}
         */
        fileStatus : function(id, status,args) {
            if (!S.isNumber(id)) return false;
            var self = this,files = self.get('files'),file = self.getFile(id),
                st = Queue.status,oStatus;
            if (!S.isPlainObject(file)) return false;
            //״̬ʵ��
            oStatus = file['status'];
            if(status) oStatus.change(status,args);
            return  oStatus;
        },
        /**
         * ��ȡָ������ֵ�Ķ����е��ļ�
         * @param  {Number} id �ļ�id
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
         * ��ȡ�ȴ�״̬���ļ�id����
         */
        getWaitFileIds : function(){
            var self = this,files = self.get('files'),
                status,waitFileIds = [];
            if(!files.length) return waitFileIds;
            S.each(files,function(file,index){
                if(S.isObject(file)){
                    status = file.status;
                    //�ļ�״̬
                    if(status.get('curType') == status.constructor.type.WAITING){
                        waitFileIds.push(index);
                    }
                }
            });
            return waitFileIds;
        },
        /**
         * ����Status
         * @param {Object} file  �ļ�����
         * @return {Status} ״̬ʵ��
         */
        _renderStatus : function(file) {
            var self = this,$file = file.target,hook = Queue.hook.STATUS,elStatus;
            if (!$file.length) return false;
            //״̬��
            elStatus = $file.children(hook);
            //ʵ����״̬��
            return new Status(elStatus,{queue : self,file : file});
        }
    }, {ATTRS : /** @lends Queue*/{
        /**
         * ģ��
         * @type String
         */
        tpl : { value : Queue.tpl.DEFAULT },
        target : {value : EMPTY},
        id : {value : 0},
        files : {value : []},
        //�ϴ����ʵ��
        uploader : {value : EMPTY}
    }});

    return Queue;
}, {requires:['node','base','./status']});
