/**
 * @fileoverview �ļ��ϴ���֤
 * @author ��ƽ�����ӣ�<minghe36@126.com>
 **/
KISSY.add(function(S, Node, Base, Validation,Rule) {
    var EMPTY = '',$ = Node.all;

    /**
     * @name Auth
     * @class �ļ��ϴ���֤
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Auth(config) {
        var self = this;
        //���ø��๹�캯��
        Auth.superclass.constructor.call(self, config);
    }
    S.mix(Auth,{
        //����ǰ׺
       RULE_PREFIX : 'uploader-'
    });
    //�̳���Base������getter��setterί����Base����
    S.extend(Auth, Base, /** @lends Auth.prototype*/{
        /**
         * ����
         */
        render : function() {
            var self = this,uploader = self.get('uploader'),
                fileField = self.get('fileField'),
                urlsField = self.get('urlsField'),
                event = uploader.constructor.event;
            if (!S.isObject(fileField)) return false;
            self._addRules();
            uploader.on(event.SELECT,function(){
                //�����ļ�·��������У��
                urlsField.isValid();
            });
            uploader.on(event.START, function() {
                //�����ļ���У��
                fileField.isValid();
            });
            //�ļ��ϴ��ɹ���
            uploader.on(event.SUCCESS,function(){
                //�����ļ�·��������У��
                urlsField.isValid();
            });
        },
        /**
         * ���ֶ������֤����
         * @return {Object} �������
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
                //���ֶ�������֤����
                fileField.addRule(prefix + key,val);
            });
            newRules = fileField.rule.getAll();
            self.set('rules',newRules);
            return newRules;
        }
    }, {ATTRS : /** @lends Auth*/{
        /**
         * Uploader��ʵ��
         */
        uploader : {value : EMPTY},
        /**
         * Field��ʵ�����ļ���
         */
        fileField : {value : EMPTY},
        /**
         * Field��ʵ�����ļ�·��������
         */
        urlsField : {value : EMPTY},
        /**
         * ��֤����
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