/**
 *
 */
Ext.define('Ext.grid.feature.Chunking', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.chunking',

    chunkSize: 20,
    rowHeight: Ext.isIE ? 27 : 26,
    visibleChunk: 0,
    hasFeatureEvent: false,
    attachEvents: function() {
        this.view.el.on('scroll', this.onBodyScroll, this, {buffer: 300});
    },

    onBodyScroll: function(e, t) {
        var view = this.view,
            top  = t.scrollTop,
            nextChunk = Math.floor(top / this.rowHeight / this.chunkSize);
        if (nextChunk !== this.visibleChunk) {

            this.visibleChunk = nextChunk;
            view.refresh();
            view.el.dom.scrollTop = top;
            //BrowserBug: IE6,7,8 quirks mode takes setting scrollTop 2x.
            view.el.dom.scrollTop = top;
        }
    },

    collectData: function(records, preppedRecords, startIndex, fullWidth, o) {
        //headerCt = this.view.headerCt,
        //colums = headerCt.getColumnsForTpl(),
        var me = this,
            recordCount = o.rows.length,
            start = 0,
            i = 0,
            visibleChunk = me.visibleChunk,
            rows,
            chunkLength,
            origRows = o.rows;

        delete o.rows;
        o.chunks = [];
        for (; start < recordCount; start += me.chunkSize, i++) {
            if (start + me.chunkSize > recordCount) {
                chunkLength = recordCount - start;
            } else {
                chunkLength = me.chunkSize;
            }
            
            if (i >= visibleChunk - 1 && i <= visibleChunk + 1) {
                rows = origRows.slice(start, start + me.chunkSize);
            } else {
                rows = [];
            }
            o.chunks.push({
                rows: rows,
                fullWidth: fullWidth,
                chunkHeight: chunkLength * me.rowHeight
            });
        }

        return o;
    },

    getTableFragments: function() {
        return {
            openTableWrap: function() {
                return '<tpl for="chunks"><div class="' + Ext.baseCSSPrefix + 'grid-chunk" style="height: {chunkHeight}px;">';
            },
            closeTableWrap: function() {
                return '</div></tpl>';
            }
        };
    }
});
