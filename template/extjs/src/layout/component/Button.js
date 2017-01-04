/**
 * Component layout for buttons
 * @private
 */
Ext.define('Ext.layout.component.Button', {

    /* Begin Definitions */

    alias: ['layout.button'],

    extend: 'Ext.layout.component.Auto',

    /* End Definitions */

    type: 'button',

    cellClsRE: /-btn-(tl|br)\b/,
    htmlRE: /<.*>/,

    constructor: function () {
        this.callParent(arguments);

        this.hackWidth = Ext.isIE && (!Ext.isStrict || Ext.isIE6 || Ext.isIE7 || Ext.isIE8);
        this.heightIncludesPadding = Ext.isIE6 && Ext.isStrict;
    },

    // TODO - use last run results if text has not changed?

    beginLayout: function (ownerContext) {
        this.callParent(arguments);

        this.cacheTargetInfo(ownerContext);
    },

    beginLayoutCycle: function(ownerContext) {
        var me = this,
            empty = '',
            owner = me.owner,
            btnEl = owner.btnEl,
            btnInnerEl = owner.btnInnerEl,
            text = owner.text,
            htmlAutoHeight;

        me.callParent(arguments);

        btnInnerEl.setStyle('overflow', empty);

        // Clear all element widths
        if (!ownerContext.widthModel.natural) {
            owner.el.setStyle('width', empty);
        }

        // If the text is HTML we need to let the browser automatically size things to cope with the case where the text
        // is multi-line. This incurs a cost as we then have to measure those elements to derive other sizes
        htmlAutoHeight = ownerContext.heightModel.shrinkWrap && text && me.htmlRE.test(text);

        btnEl.setStyle('width', empty);
        btnEl.setStyle('height', htmlAutoHeight ? 'auto' : empty);
        btnInnerEl.setStyle('width', empty);
        btnInnerEl.setStyle('height', htmlAutoHeight ? 'auto' : empty);
        btnInnerEl.setStyle('line-height', htmlAutoHeight ? 'normal' : empty);
        btnInnerEl.setStyle('padding-top', empty);
        owner.btnIconEl.setStyle('width', empty);
    },

    calculateOwnerHeightFromContentHeight: function (ownerContext, contentHeight) {
        return contentHeight;
    },

    calculateOwnerWidthFromContentWidth: function (ownerContext, contentWidth) {
        return contentWidth;
    },

    measureContentWidth: function (ownerContext) {
        var me = this,
            owner = me.owner,
            btnEl = owner.btnEl,
            btnInnerEl = owner.btnInnerEl,
            text = owner.text,
            btnFrameWidth, metrics, sizeIconEl, width, btnElContext, btnInnerElContext;

        // IE suffers from various sizing problems, usually caused by relying on it to size elements automatically. Even
        // if an element is sized correctly it can prove necessary to set that size explicitly on the element to get it
        // to size and position its children correctly. While the exact nature of the problems varies depending on the
        // browser version, doctype and button configuration there is a common solution: set the sizes manually.
        if (owner.text && me.hackWidth && btnEl) {
            btnFrameWidth = me.btnFrameWidth;

            // If the button text is something like '<' or '<<' then we need to escape it or it won't be measured
            // correctly. The button text is supposed to be HTML and strictly speaking '<' and '<<' aren't valid HTML.
            // However in practice they are commonly used and have worked 'correctly' in previous versions.
            if (text.indexOf('>') === -1) {
                text = text.replace(/</g, '&lt;');
            }

            metrics = Ext.util.TextMetrics.measure(btnInnerEl, text);

            width = metrics.width + btnFrameWidth + me.adjWidth;

            btnElContext = ownerContext.getEl('btnEl');
            btnInnerElContext = ownerContext.getEl('btnInnerEl');
            sizeIconEl = (owner.icon || owner.iconCls) && 
                    (owner.iconAlign == "top" || owner.iconAlign == "bottom");

            // This cheat works (barely) with publishOwnerWidth which calls setProp also
            // to publish the width. Since it is the same value we set here, the dirty bit
            // we set true will not be cleared by publishOwnerWidth.
            ownerContext.setWidth(width); // not setWidth (no framing)

            btnElContext.setWidth(metrics.width + btnFrameWidth);
            btnInnerElContext.setWidth(metrics.width + btnFrameWidth);

            if (sizeIconEl) {
                owner.btnIconEl.setWidth(metrics.width + btnFrameWidth);
            }
        } else {
            width = ownerContext.el.getWidth();
        }

        return width;
    },

    measureContentHeight: function (ownerContext) {
        var me = this,
            owner = me.owner,
            btnInnerEl = owner.btnInnerEl,
            btnItem = ownerContext.getEl('btnEl'),
            btnInnerItem = ownerContext.getEl('btnInnerEl'),
            minTextHeight = me.minTextHeight,
            adjHeight = me.adjHeight,
            text = owner.getText(),
            height,
            textHeight,
            topPadding;

        if (owner.vertical) {
            height = Ext.util.TextMetrics.measure(btnInnerEl, owner.text).width;
            height += me.btnFrameHeight + adjHeight;

            // Vertical buttons need height explicitly set
            ownerContext.setHeight(height, /*dirty=*/true, /*force=*/true);
        }
        else {
            // If the button text is HTML we have to handle it specially as it could contain multiple lines
            if (text && me.htmlRE.test(text)) {
                textHeight = btnInnerEl.getHeight();

                // HTML content doesn't guarantee multiple lines: in the single line case it could now be too short for the icon
                if (textHeight < minTextHeight) {
                    topPadding = Math.floor((minTextHeight - textHeight) / 2);

                    // Resize the span and use padding to center the text vertically. The hack to remove the padding
                    // from the height on IE6 is especially needed for link buttons
                    btnInnerItem.setHeight(minTextHeight - (me.heightIncludesPadding ? topPadding : 0));
                    btnInnerItem.setProp('padding-top', topPadding);

                    textHeight = minTextHeight;
                }

                // Calculate the height relative to the text span, auto can't be trusted in IE quirks
                height = textHeight + adjHeight;
            }
            else {
                height = ownerContext.el.getHeight();
            }
        }

        // IE quirks needs the button height setting using style or it won't position the icon correctly (even if the height was already correct)
        btnItem.setHeight(height - adjHeight);

        return height;
    },

    publishInnerHeight: function(ownerContext, height) {
        var me = this,
            owner = me.owner,
            isNum = Ext.isNumber,
            btnItem = ownerContext.getEl('btnEl'),
            btnInnerEl = owner.btnInnerEl,
            btnInnerItem = ownerContext.getEl('btnInnerEl'),
            btnHeight = isNum(height) ? height - me.adjHeight : height,
            btnFrameHeight = me.btnFrameHeight,
            text = owner.getText(),
            textHeight,
            paddingTop;

        btnItem.setHeight(btnHeight);
        btnInnerItem.setHeight(btnHeight);

        // Only need the line-height setting for regular, horizontal Buttons
        if (!owner.vertical && btnHeight >= 0) {
            btnInnerItem.setProp('line-height', btnHeight - btnFrameHeight + 'px');
        }

        // Button text may contain markup that would force it to wrap to more than one line (e.g. 'Button<br>Label').
        // When this happens, we cannot use the line-height set above for vertical centering; we instead reset the
        // line-height to normal, measure the rendered text height, and add padding-top to center the text block
        // vertically within the button's height. This is more expensive than the basic line-height approach so
        // we only do it if the text contains markup.
        if (text && me.htmlRE.test(text)) {
            btnInnerItem.setProp('line-height', 'normal');
            btnInnerEl.setStyle('line-height', 'normal');
            textHeight = Ext.util.TextMetrics.measure(btnInnerEl, text).height;
            paddingTop = Math.floor(Math.max(btnHeight - btnFrameHeight - textHeight, 0) / 2);
            btnInnerItem.setProp('padding-top', me.btnFrameTop + paddingTop);
            btnInnerItem.setHeight(btnHeight - (me.heightIncludesPadding ? paddingTop : 0));
        }
    },

    publishInnerWidth: function(ownerContext, width) {
        var me = this,
            isNum = Ext.isNumber,
            btnItem = ownerContext.getEl('btnEl'),
            btnInnerItem = ownerContext.getEl('btnInnerEl'),
            btnWidth = isNum(width) ? width - me.adjWidth : width;

        btnItem.setWidth(btnWidth);
        btnInnerItem.setWidth(btnWidth);
    },
    
    clearTargetCache: function(){
        delete this.adjWidth;    
    },

    cacheTargetInfo: function(ownerContext) {
        var me = this,
            owner = me.owner,
            scale = owner.scale,
            padding, frameSize, btnWrapPadding, btnInnerEl, innerFrameSize;

        // The cache is only valid for a particular scale
        if (!('adjWidth' in me) || me.lastScale !== scale) {
            // If there has been a previous layout run it could have sullied the line-height
            if (me.lastScale) {
                owner.btnInnerEl.setStyle('line-height', '');
            }

            me.lastScale = scale;

            padding = ownerContext.getPaddingInfo();
            frameSize = ownerContext.getFrameInfo();
            btnWrapPadding = ownerContext.getEl('btnWrap').getPaddingInfo();
            btnInnerEl = ownerContext.getEl('btnInnerEl');
            innerFrameSize = btnInnerEl.getPaddingInfo();

            Ext.apply(me, {
                // Width adjustment must take into account the arrow area. The btnWrap is the <em> which has padding to accommodate the arrow.
                adjWidth       : btnWrapPadding.width + frameSize.width + padding.width,
                adjHeight      : btnWrapPadding.height + frameSize.height + padding.height,
                btnFrameWidth  : innerFrameSize.width,
                btnFrameHeight : innerFrameSize.height,
                btnFrameTop    : innerFrameSize.top,

                // Use the line-height rather than height because if the text is multi-line then the height will be 'wrong'
                minTextHeight  : parseInt(btnInnerEl.getStyle('line-height'), 10)
            });
        }

        me.callParent(arguments);
    },
    
    finishedLayout: function(){
        var owner = this.owner;
        this.callParent(arguments);
        // Fixes issue EXTJSIV-5989. Looks like a browser repaint bug
        // This hack can be removed once it is resolved.
        if (Ext.isWebKit) {
            owner.el.dom.offsetWidth;
        }
    }
});
