/**
 * Tree for classes.
 */
Ext.define('Docs.view.cls.Tree', {
    extend: 'Docs.view.DocTree',
    alias: 'widget.classtree',
    requires: [
        'Docs.view.cls.PackageLogic',
        'Docs.view.cls.InheritanceLogic'
    ],

    /**
     * @cfg {Object[]} data (required)
     * An array of classes
     */

    initComponent: function() {
        var tree = new Docs.view.cls.PackageLogic({classes: this.data, showPrivateClasses: true});
        this.root = tree.create();
        this.callParent();
    }
});
