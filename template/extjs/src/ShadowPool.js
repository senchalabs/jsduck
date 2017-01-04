/**
 * Private utility class that manages the internal Shadow cache.
 * @private
 */
Ext.define('Ext.ShadowPool', {
    singleton: true,
    requires: ['Ext.DomHelper'],

    markup: (function() {
        return Ext.String.format(
            '<div class="{0}{1}-shadow" role="presentation"></div>',
            Ext.baseCSSPrefix,
            Ext.isIE && !Ext.supports.CSS3BoxShadow ? 'ie' : 'css'
        );
    }()),

    shadows: [],

    pull: function() {
        var sh = this.shadows.shift();
        if (!sh) {
            sh = Ext.get(Ext.DomHelper.insertHtml("beforeBegin", document.body.firstChild, this.markup));
            sh.autoBoxAdjust = false;
        }
        return sh;
    },

    push: function(sh) {
        this.shadows.push(sh);
    },
    
    reset: function() {
        var shadows = [].concat(this.shadows),
            s,
            sLen    = shadows.length;

        for (s = 0; s < sLen; s++) {
            shadows[s].remove();
        }

        this.shadows = [];
    }
});