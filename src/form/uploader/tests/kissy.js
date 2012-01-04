//jasmine.getFixtures().fixturesPath = 'http://localhost:9876/test/uploader';
KISSY.use('uploader/urlsInput', function(S, UrlsInput) {
describe('test kissy', function () {
    var S = KISSY,n = S.Node.all;
    S.Config.base = '../../';
    //loadFixtures('kissy.html');
    it('dom', function () {
               var urlsInput = new  UrlsInput(null,{name : 'test'});
               urlsInput.render();
                expect(urlsInput.get('name')).toEqual('1');
    })
});
});
