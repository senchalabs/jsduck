var page = new WebPage();

if (phantom.args.length === 0) {
    console.log('Usage: renderer.js <some URL>');
    phantom.exit();
} else {
    var address = phantom.args[0];
    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address');
        }
        else {
            page.injectJs(address.replace(/print.html$/, "output-print/data.js"));
            var html = page.evaluate(function () {
                var r = new Docs.Renderer({expandAll: true});
                return r.render(window.jsonData);
            });
            console.log(html);
        }
        phantom.exit();
    });
}