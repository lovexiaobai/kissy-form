KISSY.use('form/uploader/queue/progressBar', function (S, ProgressBar) {
    describe('ProgressBar',function(){
        var $ = S.Node.all,
            progressBar,
            width = 80;
        $('body').append('<div id="J_ProgressBar"></div>');
        it('正确实例化ProgressBar',function(){
            progressBar = new ProgressBar('#J_ProgressBar',{width : width});
            progressBar.render();
            var $wrapper = progressBar.get('wrapper');
            expect($wrapper).toExist();
            expect($wrapper).toHasClass('ks-progress-bar');
            expect(progressBar.get('bar')).toExist();
            expect($wrapper).toHasAttr('aria-valuemin');
            expect($wrapper).toHasAttr('aria-valuemax');
            expect($wrapper).toHasAttr('aria-valuenow');
        });
        it('正确设置进度条的值',function(){
            var changeObj,
                $wrapper = progressBar.get('wrapper');
            progressBar.on('change',function(ev){
                changeObj = ev;
            });
            progressBar.set('value',60);
            waitsFor(function(){
                return S.isObject(changeObj);
            },'changeObj never a object',500);
            runs(function(){
                expect(changeObj.value).toEqual(60);
                expect(changeObj.width).toEqual($wrapper.width() * (changeObj.value / 100));
                expect(progressBar.get('bar').attr('data-value')).toEqual('60');
                expect($wrapper.attr('aria-valuenow')).toEqual('60');
            })
        });
        it('隐藏进度条',function(){
            var visible = true;
            progressBar.on('hide',function(ev){
                visible = ev.visible;
            });
            progressBar.hide();
            waitsFor(function(){
                return !visible;
            },'visible never a Boolean',500);
            runs(function(){
                expect(visible).toBeFalsy();
                expect(progressBar.get('visible')).toBeFalsy();
                expect(progressBar.get('wrapper').css('display')).toEqual('none');
            })
        });
        it('显示进度条',function(){
            var visible = false;
            progressBar.on('show',function(ev){
                visible = ev.visible;
            });
            progressBar.show();
            waitsFor(function(){
                return visible;
            },'visible never a Boolean',500);
            runs(function(){
                expect(visible).toBeTruthy();
                expect(progressBar.get('visible')).toBeTruthy();
                expect(progressBar.get('wrapper').css('display')).toEqual('block');
            })
        });
    });
});