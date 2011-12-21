/**
 * @fileoverview 文件上传验证
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add(function(S, Node, Base, Validation,Rule) {
    var EMPTY = '',$ = Node.all;

    /**
     * @name Auth
     * @class 文件上传验证
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Auth(config) {
        var self = this;
        //调用父类构造函数
        Auth.superclass.constructor.call(self, config);
    }
    S.mix(Auth,{
        //规则前缀
       RULE_PREFIX : 'uploader-'
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Auth, Base, /** @lends Auth.prototype*/{
        /**
         * 运行
         */
        render : function() {
            var self = this,uploader = self.get('uploader'),
                fileField = self.get('fileField'),
                urlsField = self.get('urlsField'),
                event = uploader.constructor.event;
            if (!S.isObject(fileField)) return false;
            self._addRules();
            uploader.on(event.SELECT,function(){
                //触发文件路径隐藏域校验
                urlsField.isValid();
            });
            uploader.on(event.START, function() {
                //触发文件域校验
                fileField.isValid();
            });
            //文件上传成功后
            uploader.on(event.SUCCESS,function(){
                //触发文件路径隐藏域校验
                urlsField.isValid();
            });
        },
        /**
         * 给字段添加验证规则
         * @return {Object} 规则对象
         */
        _addRules : function(){
            var self = this,rules = self.get('rules'),
                uploader = self.get('uploader'),
                fileField = self.get('fileField'),
                urlsField = self.get('urlsField'),
                prefix = Auth.RULE_PREFIX,
                newRules = {};
            if(S.isEmptyObject(rules) || !S.isObject(fileField)) return false;
            S.each(rules,function(val,key){
                if(S.isArray(val)){
                    val.push(uploader);
                    val.push(urlsField);
                }
                //给字段增加验证规则
                fileField.addRule(prefix + key,val);
            });
            newRules = fileField.rule.getAll();
            self.set('rules',newRules);
            return newRules;
        }
    }, {ATTRS : /** @lends Auth*/{
        /**
         * Uploader的实例
         */
        uploader : {value : EMPTY},
        /**
         * Field的实例（文件域）
         */
        fileField : {value : EMPTY},
        /**
         * Field的实例（文件路径隐藏域）
         */
        urlsField : {value : EMPTY},
        /**
         * 验证规则
         */
        rules : {value : {
            'ext' : [
                ['jpg','jpeg','png','gif','bmp','JPG','JPEG','PNG','GIF','BMP']
            ],
            'exist' : []
        }
        }
    }});
    return Auth;
}, {requires : ['node','base','validation','./rule']});