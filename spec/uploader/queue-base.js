KISSY.use('form/uploader/queue/base', function (S, Queue) {
    var $ = S.Node.all,
        queue,
        testFile = {'name' : 'test.jpg','size' : 2000,'input' : {},'file' : {'name' : 'test.jpg','type' : 'image/jpeg','size' : 2000}};
    $('body').append('<ul id="J_Queue"></ul>');
    describe('Queue', function () {
        it('成功实例化', function () {
            queue = new Queue('#J_Queue');
            queue.render();
            expect(queue.get('target').length).toEqual(1);
        });
        it('成功向队列添加一个文件',function(){
            var id = queue.add(testFile);
            expect(S.isNumber(id)).toBeTruthy();
            var file = queue.getFile(id);
            expect(S.isObject(file)).toBeTruthy();
            expect(file.id).not.toBeUndefined();
            expect(file.textSize).not.toBeUndefined();
            expect(file.target).not.toBeUndefined();
            expect(file.status).not.toBeUndefined();
            expect(file.status.get('curType')).toEqual('waiting');
            expect(queue.get('files').length).toEqual(1);
           var li = queue.get('target').children('li');
            expect(li.length).toEqual(1);
        });
        it('成功删除一个文件',function(){
            var file;
            file = queue.remove(0,function(){
                expect(file.target.length).toEqual(0);
            });
            expect(S.isObject(file)).toBeTruthy();
            expect(queue.get('files')[0]).toBeUndefined();
        });
        it('成功获取文件数据',function(){
            queue.add(testFile);
/*
            var testFile2 = S.mix(testFile,{name : 'test2.jpg'});
            queue.add(testFile);
*/
            var file = queue.getFile(1);
            expect(file.name).not.toBeUndefined();
        });
    })
});
