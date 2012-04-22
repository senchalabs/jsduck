/**
 * Controller for DocTest page.
 */
Ext.define('Docs.controller.DocTests', {
    extend: 'Docs.controller.Content',

    /**
     * @cfg
     * Regex used to locate all <pre> nodes.
     * @private
     */
    preRegex: /<pre[\s\S]*?>[\s\S]*?<\/pre[\s\S]*?>/gi,
    

    /**
     * @cfg
     * Regex used to determine if a node is an inline example.
     * @private
     */
    preClsRegex: /class=[\s\S]*?inline-example/i,

    /**
     * @cfg
     * Regex used to locate <code> node.
     * @private
     */
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
            ref: 'testContainer',
            selector: '#testcontainer'
        }
    ],

    init: function() {
        this.addEvents('loadIndex');

        this.control({
            '#doctestsgrid': {
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
     * @param {Ext.data.Store} store The data store used to populate the grid.
     * @private
     */
    locateExamples: function(store) {
        this.classesLeft = Docs.data.classes.length;
        this.getTestContainer().setDisabled(true);
        store.removeAll();
        Ext.each(Docs.data.classes, function(cls) {
            var task = new Ext.util.DelayedTask(function() {
                this.locateClsExamples(store, cls.name);
            }, this);
            task.delay(0);
        }, this);
    },

    /**
     * Locates all inline examples attached to a class file.
     * 
     * @param {Ext.data.Store} store The data store used to populate the grid.
     * @param {String} cls The Ext class name being interrogated.
     * @private
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

                this.classesLeft--;
                if (this.classesLeft === 0) {
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
     * @param {String} html The html being parsed.
     * @private
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
   
    /**
     * Called after view's grid is rendered.
     *
     * @param {Ext.grid.Panel} grid The grid panel that was rendered.
     * @private
     */ 
    onGridAfterRender: function(grid) {
        var store = grid.getStore();
        this.locateExamples(store);
    }
});
