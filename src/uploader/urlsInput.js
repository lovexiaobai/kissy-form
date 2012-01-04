/**
 * @fileoverview �洢�ļ�·����Ϣ��������
 * @author: ��ƽ�����ӣ�<minghe36@126.com>,��Ӣ<daxingplay@gmail.com>
 **/
KISSY.add(function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-urlsInput]:';
    /**
     * @name UrlsInput
     * @class �洢�ļ�·����Ϣ��������
     * @constructor
     * @extends Base
     * @requires Node
     * @param {Stirng} wrapper ����
     */
    function UrlsInput(wrapper, config) {
        var self = this;
        //���ø��๹�캯��
        UrlsInput.superclass.constructor.call(self, config);
        self.set('wrapper', $(wrapper));
    }

    S.mix(UrlsInput, /**@lends UrlsInput*/ {
        TPL : '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
    });
    //�̳���Base������getter��setterί����Base����
    S.extend(UrlsInput, Base, /** @lends UrlsInput.prototype*/{
        /**
         * ����
         */
        render : function() {
            var self = this,$wrapper = self.get('wrapper'),
                name = self.get('name'),
                elInput = document.getElementsByName(name)[0];
            if (!S.isObject($wrapper)) {
                S.log(LOG_PREFIX + 'container�������Ϸ���');
                return false;
            }
            //����Ѿ�������������ô���Զ�����
            if(elInput){
                self.set('input',$(elInput));
            }else{
                self._create();
            }
        },
        /**
         * ��·�����������·��
         * @param {index} index ��������
         * @param {String} url ·��
         */
        add : function(index,url){
            if(!S.isString(url) || !S.isNumber(index)) return false;
            var self = this,urls = self.get('urls'),
                //�ж�·���Ƿ��Ѿ�����
                isExist = self.isExist(url);
            if(isExist) return self;
            urls[index] = url;
            self.set('urls',urls);
            self._val();
            return self;
        },
        /**
         * ɾ���������ڵ�ָ��·��
         * @param {Number} index ����ֵ
         */
        remove : function(index){
            if(!S.isNumber(index)) return false;
            var self = this,urls = self.get('urls');
            if(urls[index]) delete urls[index];
            self.set('urls',urls);
            self._val();
            return urls;
        },
        /**
         * �����������ֵ
         * @return {String} 
         */
        _val : function(){
            var self = this,urls = self.get('urls'),
                $input = self.get('input'),realUrls = [],
                //���·����ķָ���
                split = self.get('split'),
                sUrl;
            S.each(urls,function(url){
                if(url) realUrls.push(url);
            });
            sUrl = realUrls.join(split);
            $input.val(sUrl);
            return sUrl;
        },
        /**
         * �Ƿ��Ѿ�����ָ��·��
         * @param {String} url ·��
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
         * ����������
         */
        _create : function() {
            var self = this,container = self.get('wrapper'),
                tpl = self.get('tpl'),
                name = self.get('name'), urls = self.get('urls'),
                input;
            if (!S.isString(tpl) || !S.isString('name')) return false;
            input = $(S.substitute(tpl, {name : name,value : urls}));
            container.append(input);
            self.set('input', input);
            return input;
        }

    }, {ATTRS : /** @lends UrlsInput*/{
        name : {value : EMPTY},
        /**
         * �ļ�·��
         */
        urls : { value : [] },
        /**
         * inputģ��
         */
        tpl : {value : UrlsInput.TPL},
        /**
         * ���·����ķָ���
         */
        split : {value : ','},
        /**
         * �ļ�·������input
         */
        input : {value : EMPTY},
        /**
         * ����������
         */
        wrapper : {value : EMPTY}
    }});

    return UrlsInput;
}, {requires:['node','base']});