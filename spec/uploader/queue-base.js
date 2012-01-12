KISSY.use('form/uploader/queue/base', function (S, Queue) {
    var $ = S.Node.all,
        queue,
        testFile = {'name':'test.jpg', 'size':2000, 'input':{}, 'file':{'name':'test.jpg', 'type':'image/jpeg', 'size':2000}};
    $('body').append('<ul id="J_Queue"></ul>');
    describe('Queue', function () {
        it('成功实例化', function () {
            queue = new Queue('#J_Queue');
            queue.render();
            expect(queue.get('target').length).toEqual(1);
        });
        it('成功向队列添加一个文件', function () {
            var file = queue.add(testFile);
            expect(S.isObject(file)).toBeTruthy();
            expect(file.id).not.toBeUndefined();
            expect(file.textSize).not.toBeUndefined();
            expect(file.target).not.toBeUndefined();
            expect(file.status).not.toBeUndefined();
            expect(file.status.get('curType')).toEqual('waiting');
            expect(queue.get('files').length).toEqual(1);

            var li = queue.get('target').children('li');
            expect(li.length).toEqual(1);

            file = queue.add('error');
            expect(file).toBeFalsy();

        });
        it('传递文件数组索引值，成功删除一个文件', function () {
            var file = queue.remove(0);
            expect(S.isObject(file)).toBeTruthy();
            expect(queue.get('files').length).toEqual(0);
        });
        it('传递文件id，成功删除一个文件', function () {
            var file = queue.add(testFile),
                fileId = file.id,
                removeFile = queue.remove(fileId);
            expect(removeFile).toBe(file);
            expect(queue.get('files').length).toEqual(0);
        });
        it('clear()删除队列所有文件', function () {
            queue.add(testFile);
            queue.add(testFile);
            queue.add(testFile);
            expect(queue.get('files').length).toEqual(3);
            queue.clear();
            waitsFor(function () {
                return queue.get('files').length === 0;
            }, 'files never clear', 1000);
            runs(function () {
                expect(queue.get('files').length).toEqual(0);
            });

        });
        it('成功设置文件状态', function () {
            var file = queue.add(testFile);
            queue.fileStatus(0, 'success');
            expect(queue.get('files')[0].status.get('curType')).toEqual('success');
        });
        it('getFileIndex()获取文件对应的索引值', function () {
            var testFile2 = S.merge(testFile,{'name' : 'test2.jpg'}),
                file = queue.add(testFile2),
                fileId = file.id,
                index = queue.getFileIndex(fileId);
            expect(index).toEqual(1);
        });
        it('updateFile()更新文件数据对象', function () {
            queue.updateFile(0, {
                name:'minghe.jpg',
                size:4000
            });
            var file = queue.get('files')[0];
            expect(file.name).toEqual('minghe.jpg');
            expect(file.size).toEqual(4000);
        });
        it('getIndexs()获取等指定状态的文件对应的文件数组index的数组',function(){
            var indexs = queue.getIndexs('waiting');
            expect(queue.get('files')[0].status.get('curType')).toEqual('success');
            expect(indexs.length).toEqual(1);
        });
        it('getFiles()获取指定状态下的文件',function(){
            var files = queue.getFiles('waiting');
            expect(files.length).toEqual(1);
            expect(S.isObject(files[0])).toBeTruthy();
        })
    })
});
