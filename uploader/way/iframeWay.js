/**
 * @fileoverview iframe�����ϴ�
 * @author: ��ƽ�����ӣ�<minghe36@126.com>,��Ӣ<daxingplay@gmail.com>
 **/
KISSY.add(function(S,Node,Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-iframeWay]:',ID_PREFIX = 'ks-uploader-iframe';
    /**
     * @name IframeWay
     * @class iframe�����ϴ�
     * @constructor
     * @extends Base
     * @requires Node
     */
    function IframeWay(config){
        var self = this;
        //���ø��๹�캯��
        IframeWay.superclass.constructor.call(self,config);
    }
    S.mix(IframeWay,/**@lends IframeWay*/ {
        /**
         * ���õ���htmlģ��
         */
        tpl : {
            IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" />',
            FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}">{hiddenInputs}</form>',
            HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
        }
    });
    //�̳���Base������getter��setterί����Base����
    S.extend(IframeWay, Base, /** @lends IframeWay.prototype*/{
            /**
             * ����
             */
            render : function(){

            },
            upload : function(){
                var self = this,
                    iframe = self._createIframe(),
                    form = self._createForm();
            },
            /**
             * ����������ת����hiddenԪ��
             * @param {Object} data ��������
             * @return {String} hiddenInputHtml hiddenԪ��htmlƬ��
             */
            dataToHidden : function(data){
                if(!S.isObject(data) || S.isEmptyObject(data)){
                    S.log(LOG_PREFIX + 'data�������Ƕ������Ϊ�գ�');
                    return false;
                }
                var self = this,hiddenInputHtml = EMPTY,
                    //hiddenԪ��ģ��
                    tpl = self.get('tpl'),hiddenTpl = tpl.HIDDEN_INPUT;
                if (!S.isString(hiddenTpl)) return false;
                for (var k in data) {
                    hiddenInputHtml += S.substitute(hiddenTpl, {'name' : k,'value' : data[k]});
                }
                return hiddenInputHtml;
            },
            /**
             * ����һ���յ�iframe�������ļ��ϴ������ύ�󷵻ط�����������
             * @return {NodeList}
             */
            _createIframe : function(){
                var self = this,
                    //iframe��id
                    id = self.get('id'),
                    //iframeģ��
                    tpl = self.get('tpl'),iframeTpl = tpl.IFRAME,
                    iframe;
                if (!S.isString(iframeTpl)){
                    S.log(LOG_PREFIX + 'iframe��ģ�岻�Ϸ���');
                    return false;
                }
                if (!S.isString(id)){
                    S.log(LOG_PREFIX + 'id���������Ϊ�ַ������ͣ�');
                    return false;
                }
                //���������ϴ���iframe
                iframe = S.substitute(tpl.IFRAME, { 'id' : id });
                return $(iframe);
            },
            /**
             * �����ļ��ϴ�����
             * @return {NodeList}
             */
            _createForm : function(){
                var self = this,
                    //iframe��id
                    id = self.get('id'),
                    //formģ��
                    tpl = self.get('tpl'),formTpl = tpl.FORM,
                    //��Ҫ���͸��������˵�����
                    data = self.get('data'),
                    //�������˴����ļ��ϴ���·��
                    action = self.get('action'),
                    hiddens,form = EMPTY;
                if (!S.isString(formTpl)){
                    S.log(LOG_PREFIX + 'formģ�岻�Ϸ���');
                    return false;
                }
                if (!S.isObject(data)){
                    S.log(LOG_PREFIX + 'data�������Ϸ���');
                    return false;
                }
                if (!S.isString(action)){
                    S.log(LOG_PREFIX + 'action�������Ϸ���');
                    return false;
                }
                hiddens = self.dataToHidden(data);
                if(hiddens == EMPTY) return false;
                form = S.substitute(formTpl, {'action' : action,'target' : id,'hiddenInput' : hiddens});
                return $(form);
            }

    },{ATTRS : /** @lends IframeWay*/{
            /**
             * iframe�������õ���htmlģ�壬һ�㲻��Ҫ�޸�
             */
            tpl : {value : IframeWay.tpl},
            /**
             * ������iframeid
             */
            id : {value : ID_PREFIX + S.guid()},
            /**
             * ���͸��������˵Ĳ������ϣ��ᱻת��hiddenԪ��post���������ˣ�
             */
            data : {value : {}}
    }});
    
    return IframeWay;
},{requires:['node','base']});