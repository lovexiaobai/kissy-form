/**
 * 上传组件验证规则
 */
KISSY.add(function(S, Node, Validation) {
    var Util = Validation.Util,Rule = Validation.Rule;
    //uploader为Uploader的实例
    Rule.add('uploader-max','最多上传{0}个文件！',function(value,text,max,uploader){
        var urlsInput = uploader.get('urlsInput'),
            len = urlsInput.get('urls').length;
        if(len > max){
            //不允许文件上传
            uploader.set('isAllowUpload',false);
            text = S.substitute(text,{"0" : max});
            return text;
        }
    });
    Rule.add('uploader-ext','不支持{0}格式文件上传！',function(value,text,exts,uploader){
         //队列
        var queue = uploader.get('queue'),
            curUploadId = queue.get('files').length - 1,
            //文件数据
            file = queue.getFile(curUploadId),
            //文件名
            fileName = file.name,
            //文件扩展名
            fileExt = _getFileExt(fileName),
            isAllow = _isAllowUpload(fileName);
        if(!isAllow){
            _stopUpload();
            return text;
        }
        /**
         * 是否允许上传
         * @param {String} fileName 文件名
         * @return {Boolean}
         */
        function _isAllowUpload(fileName){
            var isAllow = false,reg;
            S.each(exts, function(ext) {
                reg = new RegExp('^.+\.' + ext + '$');
                //存在该扩展名
                if (reg.test(fileName))  return isAllow = true;
            });
            return isAllow;
        }
        /**
         * 阻止文件上传，并改变文件状态为error
         */
        function _stopUpload(){
            //不允许文件上传
            uploader.set('isAllowUpload',false);
            text = S.substitute(text,{"0" : fileExt});
            //改变文件状态为error
            queue.fileStatus(file.id,queue.constructor.status.ERROR,{msg : text});
        }
        /**
         * 获取文件扩展名
         * @param {String} file
         */
        function _getFileExt(file){
            var arr = file.split('.');
            return arr[arr.length -1];
        }
    });
    Rule.add('uploader-exist','该文件已经存在！',function(value,text,uploader){
        var queue = uploader.get('queue'),
            curUploadId = queue.get('files').length - 1,
            //文件数据
            file = queue.getFile(curUploadId),
            //文件名
            fileName = file.name;
        
    });
    Rule.add('uploader-require','必须至少上传一个文件！',function(value){

    });
    return Rule;
}, {requires : ['node','validation']});