KISSY.use('form/uploader/urlsInput', function (S, UrlsInput) {
    var $ = S.Node.all;
    $('body').append('<div id="J_UrlsInputWrapper"></div>');
    describe('UrlsInput', function () {
        var cUrlsInput,
        testUrl = 'http://img01.taobaocdn.com/tps/i1/T18OSLXcxkXXXXXXXX-440-135.jpg',
        testUrl2 = 'http://www.36ria.com/test.png',
        html = '<input type="hidden" value="" name="fileUrls" id="J_FileUrls" />';
        $(html).appendTo('body');
        it('成功实例化UrlsInput，并创建一个input', function () {
            cUrlsInput = new UrlsInput('#J_UrlsInputWrapper', {name:"testInput"});
            cUrlsInput.render();
            expect(cUrlsInput.get('input').length).toEqual(1);
            expect($('#J_UrlsInputWrapper').children('input').length).toEqual(1);
        });
        it('成功添加url',function(){
            var $input = cUrlsInput.get('input');
            cUrlsInput.add(testUrl);
            expect($input.val()).toEqual(testUrl);
            expect(cUrlsInput.get('urls').length).toEqual(1);
        });
        it('如果存在相同路径不重复添加',function(){
            cUrlsInput.add(testUrl);
            expect(cUrlsInput.get('urls').length).toEqual(1);
        });
        it('改变路径分割符',function(){
            var $input = cUrlsInput.get('input'),
                split = ':';
            cUrlsInput.set('split',split);
            cUrlsInput.add(testUrl2);
            expect(cUrlsInput.get('urls').length).toEqual(2);
            expect($input.val()).toEqual(testUrl + ':' + testUrl2);
        });
        it('成功删除路径',function(){
            var $input = cUrlsInput.get('input');
            cUrlsInput.remove(testUrl);
            expect(cUrlsInput.get('urls').length).toEqual(1);
            expect($input.val()).toEqual(testUrl2);
        });
        it('已经存在input，实例化组件',function(){
            var urlsInput = new UrlsInput(null,{name : 'fileUrls'});
            urlsInput.render();
            expect(urlsInput.get('input').length).toEqual(1);
        })
    });
});
