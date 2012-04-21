/**
 * Controller for DocTest page.
 */
Ext.define('Docs.controller.DocTests', {
    extend: 'Docs.controller.Content',
    requires: ['Ext.data.Store', 'Docs.model.DocTest'],
    baseUrl: "#!/doctests",

    preRegex: /<pre[\s\S]*?>[\s\S]*?<\/pre[\s\S]*?>/gi,
    preClsRegex: /class=[\s\S]*?inline-example/i,
    codeRegex: /<code[\s\S]*?>[\s\S]+?<\/code[\s\S]*?>/gi,

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'index',
            selector: '#doctestsindex'
        },
        {
            ref: 'docTestGrid',
            selector: '#doctestgrid'
        },
        {
            ref: 'testContainer',
            selector: '#testcontainer'
        }
    ],

    init: function() {
        this.addEvents('loadIndex');

        this.control({
            '#doctestgrid': {
                afterrender: this.onGridAfterRender
            }
        });
    },

    loadIndex: function() {
        this.fireEvent('loadIndex');
        Ext.getCmp('treecontainer').hide();
        this.callParent([true]);
    },

    /**
     * True if DocTests page is available.
     * @return {Boolean}
     */
    isActive: function() {
        return !!this.getIndex().getTab();
    },

    /**
     * Locates all examples.
     *
     * @private
     * @param {Ext.data.Store}
     */
    locateExamples: function(store) {
        this.clssLeft = Docs.data.doctests.length;
        this.getTestContainer().setDisabled(true);
        store.removeAll();
        Ext.each(Docs.data.doctests, function(cls) {
            var task = new Ext.util.DelayedTask(function() {
                this.locateClsExamples(store, cls);
            }, this);
            task.delay(0);
        }, this);
    },

    /**
     * Locates all inline examples attached to a class file.
     *
     * @private
     * @param {Ext.data.Store}
     * @param {Object}
     */
    locateClsExamples: function(store, cls) {
        var baseUrl = this.getBaseUrl() + '/output/',
            url = baseUrl + cls + '.js';

        Ext.data.JsonP.request({
            url: url,
            callbackName: cls.replace(/\./g, '_'),
            success: function(json, opts) {
                var exampleCodes = this.extractExampleCode(json.html),
                    exampleCodeLength = exampleCodes.length;
                Ext.each(exampleCodes, function(exampleCode, exampleIdx) {
                    var name = json.name,
                        id = name;
                    if (exampleCodeLength > 1) {
                        name += ' example #' + (exampleIdx + 1).toString();
                        id += '-' + exampleIdx.toString();
                    }

                    store.add({
                        id: id,
                        name: name,
                        href: document.location.href.replace(/#.*/, '#!/api/' + json.name),
                        code: exampleCode,
                        status: '<span class="doc-test-ready">ready</span>'
                    });
                }, this);

                this.clssLeft--;
                if (this.clssLeft === 0) {
                    this.getTestContainer().setDisabled(false);
                }
            },
            failure: function(response, opts) {
                console.log('Class load failed', cls, url, response, opts);
            },
            scope: this
        });
    },

    /**
     * Extract example code from html.
     *
     * @private
     * @param {String}
     */
    extractExampleCode: function(html) {
        var exampleCodes = [],
            preMatches = html.match(this.preRegex);

        Ext.each(preMatches, function(preMatch) {
            if (preMatch.match(this.preClsRegex)) {
                var codeMatches = preMatch.match(this.codeRegex);
                if (codeMatches) {
                    exampleCodes.push(codeMatches[0]);
                }
            }
        }, this);
        return exampleCodes;
    },

    onGridAfterRender: function(grid) {
        var store = grid.getStore();
        this.locateExamples(store);
    }
});
