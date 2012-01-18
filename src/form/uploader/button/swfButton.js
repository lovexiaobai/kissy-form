/**
 * @fileoverview flash上传按钮
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('form/uploader/button/swfButton', function (S, Node, Base, SwfUploader) {
    var EMPTY = '', $ = Node.all,
        SWF_WRAPPER_ID_PREVFIX = 'swf-uploader-wrapper-';

    /**
     * @name SwfButton
     * @class flash上传按钮
     * @constructor
     * @extends Base
     * @requires Node
     */
    function SwfButton(target, config) {
        var self = this;
        config = S.merge({target:$(target)}, config);
        //调用父类构造函数
        SwfButton.superclass.constructor.call(self, config);
    }
    S.mix(SwfButton, /** @lends SwfButton*/{
        /**
         * 支持的事件
         */
        event : {
            CHANGE : 'change'
        }
    });
    S.extend(SwfButton, Base, /** @lends SwfButton.prototype*/{
        /**
         * 运行
         */
        render:function () {
            var self = this,
                $target = self.get('target'),
                swfUploader;
            $target.css('position','relative');
            self._createSwfWrapper();
            self._setFlashSizeConfig();
            swfUploader = self._initSwfUploader();
            //监听选择文件后事件
            swfUploader.on('fileSelect',self._changeHandler,self);
        },
        /**
         * 创建flash容器
         */
        _createSwfWrapper:function () {
            var self = this,
                target = self.get('target'),
                tpl = self.get('tpl'),
                //容器id
                id = self.get('swfWrapperId') != EMPTY && self.get('swfWrapperId') || SWF_WRAPPER_ID_PREVFIX + S.guid(),
                //容器html
                html = S.substitute(tpl, {id:id});
            self.set('swfWrapperId', id);
            return $(html).appendTo(target);
        },
        /**
         * 初始化ajbridge的uploader
         * @return {SwfUploader}
         */
        _initSwfUploader:function () {
            var self = this, flash = self.get('flash'),
                id = self.get('swfWrapperId'),
                swfUploader;
            try {
                //实例化AJBridge.Uploader
                swfUploader = new SwfUploader(id, flash);
                self.set('swfUploader', swfUploader);
            } catch (err) {

            }
            return swfUploader;
        },
        /**
         * 设置flash配置参数
         */
        _setFlashSizeConfig:function () {
            var self = this, flash = self.get('flash'),
                target = self.get('target');
            S.mix(flash.attrs, {
                width:target.width(),
                height:target.height()
            });
            self.set('flash',flash);
        },
        /**
         * flash中选择完文件后触发的事件
         */
        _changeHandler : function(ev){
            var self = this,files = ev.fileList;
            self.fire(SwfButton.event.CHANGE,{files : files});
        }
    }, {ATTRS:/** @lends SwfButton*/{
        /**
         * 按钮目标元素
         */
        target:{value:EMPTY},
        /**
         * swf容器的id，如果不指定将使用随机id
         */
        swfWrapperId:{value:EMPTY},
        /**
         * flash容器模板
         */
        tpl:{
            value:'<div id="{id}" class="uploader-button-swf" style="position: absolute;top:0;left:0;"></div>'
        },
        /**
         * flash配置
         */
        flash:{
            value:{
                src:'../plugins/ajbridge/uploader.swf',
                id:'swfUploader',
                params:{
                    bgcolor:"#fff",
                    wmode:"transparent"
                },
                //属性
                attrs:{ },
                //手型
                hand:true,
                //启用按钮模式,激发鼠标事件
                btn:true
            }
        },
        /**
         *  ajbridge的uploader的实例
         */
        swfUploader:{value:EMPTY}
    }});
    return SwfButton;
}, {requires:['node', 'base', 'form/uploader/plugins/ajbridge/uploader']});