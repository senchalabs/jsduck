/*
Ext JS 4.1 - JavaScript Library
Copyright (c) 2006-2012, Sencha Inc.
All rights reserved.
licensing@sencha.com

http://www.sencha.com/license

Open Source License
------------------------------------------------------------------------------------------
This version of Ext JS is licensed under the terms of the Open Source GPL 3.0 license. 

http://www.gnu.org/licenses/gpl.html

There are several FLOSS exceptions available for use with this release for
open source applications that are distributed under a license other than GPL.

* Open Source License Exception for Applications

  http://www.sencha.com/products/floss-exception.php

* Open Source License Exception for Development

  http://www.sencha.com/products/ux-exception.php


Alternate Licensing
------------------------------------------------------------------------------------------
Commercial and OEM Licenses are available for an alternate download of Ext JS.
This is the appropriate option if you are creating proprietary applications and you are 
not prepared to distribute and share the source code of your application under the 
GPL v3 license. Please visit http://www.sencha.com/license for more details.

--

This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF THIRD-PARTY INTELLECTUAL PROPERTY RIGHTS.  See the GNU General Public License for more details.
*/
/*
Ext JS 4.1 - JavaScript Library
Copyright (c) 2006-2012, Sencha Inc.
All rights reserved.
licensing@sencha.com

http://www.sencha.com/license

Open Source License
------------------------------------------------------------------------------------------
This version of Ext JS is licensed under the terms of the Open Source GPL 3.0 license. 

http://www.gnu.org/licenses/gpl.html

There are several FLOSS exceptions available for use with this release for
open source applications that are distributed under a license other than GPL.

* Open Source License Exception for Applications

  http://www.sencha.com/products/floss-exception.php

* Open Source License Exception for Development

  http://www.sencha.com/products/ux-exception.php


Alternate Licensing
------------------------------------------------------------------------------------------
Commercial and OEM Licenses are available for an alternate download of Ext JS.
This is the appropriate option if you are creating proprietary applications and you are 
not prepared to distribute and share the source code of your application under the 
GPL v3 license. Please visit http://www.sencha.com/license for more details.

--

This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF THIRD-PARTY INTELLECTUAL PROPERTY RIGHTS.  See the GNU General Public License for more details.
*/
/*
Ext JS 4.1 - JavaScript Library
Copyright (c) 2006-2012, Sencha Inc.
All rights reserved.
licensing@sencha.com

http://www.sencha.com/license

Open Source License
------------------------------------------------------------------------------------------
This version of Ext JS is licensed under the terms of the Open Source GPL 3.0 license. 

http://www.gnu.org/licenses/gpl.html

There are several FLOSS exceptions available for use with this release for
open source applications that are distributed under a license other than GPL.

* Open Source License Exception for Applications

  http://www.sencha.com/products/floss-exception.php

* Open Source License Exception for Development

  http://www.sencha.com/products/ux-exception.php


Alternate Licensing
------------------------------------------------------------------------------------------
Commercial and OEM Licenses are available for an alternate download of Ext JS.
This is the appropriate option if you are creating proprietary applications and you are 
not prepared to distribute and share the source code of your application under the 
GPL v3 license. Please visit http://www.sencha.com/license for more details.

--

This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF THIRD-PARTY INTELLECTUAL PROPERTY RIGHTS.  See the GNU General Public License for more details.
*/
/*
This file is part of Ext JS 4.1

Copyright (c) 2011-2012 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as
published by the Free Software Foundation and appearing in the file LICENSE included in the
packaging of this file.

Please review the following information to ensure the GNU General Public License version 3.0
requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2012-07-04 21:11:01 (65ff594cd80b9bad45df640c22cc0adb52c95a7b)
*/


Ext.define('Ext.Neptune.button.Button', {
	override: 'Ext.button.Button',
	
    setScale: function(scale) {
        this.callParent(arguments);

        this.removeCls(this.allowedScales);
        this.addCls(scale);
    }
});

Ext.define('Ext.Neptune.tab.Bar', {
    override: 'Ext.tab.Bar',
    
    onAdd: function(tab) {
        tab.position = this.dock;
        tab.ui = this.ui;
        this.callParent(arguments);
    }
});

Ext.define('Ext.Neptune.container.ButtonGroup', {
	override: 'Ext.container.ButtonGroup',
	
    beforeRender: function() {
        var me = this;

        me.callParent();

        
        if (me.header) {
            
            delete me.header.items.items[0].flex;
        }

        me.callParent(arguments);
    }
});

Ext.define('Ext.Neptune.layout.component.field.Trigger', {
	override: 'Ext.layout.component.field.Trigger',
	
    sizeBodyContents: function(width, height, ownerContext) {
        var me = this,
            owner = me.owner,
            triggerWidth = owner.getTriggerWidth();

        
        
        if (owner.hideTrigger || owner.readOnly || triggerWidth > 0) {
            ownerContext.inputContext.setProp('width', width, true);
        }
	}
});

Ext.define('Ext.Neptune.menu.Menu', {
	override: 'Ext.menu.Menu',
	
    baseCls: Ext.baseCSSPrefix + 'menu',

	initComponent: function() {
        var me = this;

        me.addEvents(
            
            'click',

            
            'mouseenter',

            
            'mouseleave',

            
            'mouseover'
        );

        Ext.menu.Manager.register(me);

        
        if (me.plain) {
            me.cls = Ext.baseCSSPrefix + 'menu-plain';
        }

        
        
        
        
        if (!me.layout) {
            me.layout = {
                type: 'vbox',
                align: 'stretchmax',
                overflowHandler: 'Scroller'
            };
            
            if (!me.floating) {
                me.layout.align = 'stretch';
            }
        }

        
        if (me.floating === false && me.initialConfig.hidden !== true) {
            me.hidden = false;
        }

        me.callParent(arguments);

        me.on('beforeshow', function() {
            var hasItems = !!me.items.length;
            
            
            
            if (hasItems && me.rendered) {
                me.el.setStyle('visibility', null);
            }
            return hasItems;
        });
    }
});

Ext.define('Ext.Neptune.panel.Tool', {
	override: 'Ext.panel.Tool',
	
    renderTpl: ['<div id="{id}-toolEl" class="{baseCls}-{type}" role="presentation"></div>']
});

Ext.define('Ext.Neptune.window.MessageBox', {
	override: 'Ext.window.MessageBox',
	
	initComponent: function() {
        var me = this,
            i, button;

        me.title = '&#160;';

        me.topContainer = new Ext.container.Container({
            anchor: '100%',
            style: {
                padding: '10px',
                overflow: 'hidden'
            },
            items: [
                me.iconComponent = new Ext.Component({
                    cls: me.baseCls + '-icon',
                    width: 50,
                    height: me.iconHeight,
                    style: {
                        'float': 'left'
                    }
                }),
                me.promptContainer = new Ext.container.Container({
                    layout: {
                        type: 'anchor'
                    },
                    items: [
                        me.msg = new Ext.Component({
                            autoEl: { tag: 'span' },
                            cls: me.baseCls + '-text'
                        }),
                        me.textField = new Ext.form.field.Text({
                            anchor: '100%',
                            enableKeyEvents: true,
                            listeners: {
                                keydown: me.onPromptKey,
                                scope: me
                            }
                        }),
                        me.textArea = new Ext.form.field.TextArea({
                            anchor: '100%',
                            height: 75
                        })
                    ]
                })
            ]
        });
        me.progressBar = new Ext.ProgressBar({
            anchor: '-10',
            style: 'margin-left:10px'
        });

        me.items = [me.topContainer, me.progressBar];

        
        me.msgButtons = [];
        for (i = 0; i < 4; i++) {
            button = me.makeButton(i);
            me.msgButtons[button.itemId] = button;
            me.msgButtons.push(button);
        }
        me.bottomTb = new Ext.toolbar.Toolbar({
            ui: 'footer',
            dock: 'bottom',
            layout: {
                pack: 'end'
            },
            items: [
                me.msgButtons[0],
                me.msgButtons[1],
                me.msgButtons[2],
                me.msgButtons[3]
            ]
        });
        me.dockedItems = [me.bottomTb];

        me.callParent();
    }
});

Ext.define('Ext.Neptune.grid.column.Column', {
    override: 'Ext.grid.column.Column',

    initComponent: function() {
        var me = this,
            i,
            len,
            item;

        if (Ext.isDefined(me.header)) {
            me.text = me.header;
            delete me.header;
        }

        
        
        
        if (me.flex) {
            me.minWidth = me.minWidth || Ext.grid.plugin.HeaderResizer.prototype.minColWidth;
        }

        if (!me.triStateSort) {
            me.possibleSortStates.length = 2;
        }

        
        if (Ext.isDefined(me.columns)) {
            me.isGroupHeader = true;

            
            if (me.dataIndex) {
                Ext.Error.raise('Ext.grid.column.Column: Group header may not accept a dataIndex');
            }
            if ((me.width && me.width !== Ext.grid.header.Container.prototype.defaultWidth) || me.flex) {
                Ext.Error.raise('Ext.grid.column.Column: Group header does not support setting explicit widths or flexs. The group header width is calculated by the sum of its children.');
            }
            

            
            me.items = me.columns;
            delete me.columns;
            delete me.flex;
            delete me.width;
            me.cls = (me.cls||'') + ' ' + Ext.baseCSSPrefix + 'group-header';
            me.sortable = false;
            me.resizable = false;
            me.align = 'center';
        } else {
            
            
            me.isContainer = false;
        }

        me.addCls(Ext.baseCSSPrefix + 'column-header-align-' + me.align);

        if (me.sortable) {
            me.addCls(Ext.baseCSSPrefix + 'column-header-sortable');
        }

        
		Ext.grid.column.Column.superclass.initComponent.call(this, arguments);

        me.on({
            element:  'el',
            click:    me.onElClick,
            dblclick: me.onElDblClick,
            scope:    me
        });
        me.on({
            element:    'titleEl',
            mouseenter: me.onTitleMouseOver,
            mouseleave: me.onTitleMouseOut,
            scope:      me
        });
    }
});

Ext.define('Ext.Neptune.Shadow', {
    override: 'Ext.Shadow',

    offset: 3
});

Ext.define('Ext.Neptune.layout.container.Accordion', {
    override: 'Ext.layout.container.Accordion',

    targetCls: Ext.baseCSSPrefix + 'box-layout-ct ' + Ext.baseCSSPrefix + 'accordion-body',
    collapseFirst : true,

    beforeRenderItems: function (items) {
        var me = this,
            ln = items.length,
            i, comp;

        for (i = 0; i < ln; i++) {
            comp = items[i];
            if (!comp.rendered) {
                
                comp.on({
                    beforerender: me.onChildPanelRender,
                    single: true
                });

                
                if (me.collapseFirst) {
                    comp.collapseFirst = me.collapseFirst;
                }
                if (me.hideCollapseTool) {
                    comp.hideCollapseTool = me.hideCollapseTool;
                    comp.titleCollapse = true;
                }
                else if (me.titleCollapse) {
                    comp.titleCollapse = me.titleCollapse;
                }

                delete comp.hideHeader;
                delete comp.width;
                comp.collapsible = true;
                comp.title = comp.title || '&#160;';
                comp.toolsFirst = true;
                comp.addBodyCls(Ext.baseCSSPrefix + 'accordion-body');

                
                if (me.fill) {
                    
                    if (me.expandedItem !== undefined) {
                        comp.collapsed = true;
                    }
                    
                    else if (comp.hasOwnProperty('collapsed') && comp.collapsed === false) {
                        me.expandedItem = i;
                    } else {
                        comp.collapsed = true;
                    }
                    
                    me.owner.mon(comp, {
                        show: me.onComponentShow,
                        beforeexpand: me.onComponentExpand,
                        beforecollapse: me.onComponentCollapse,
                        scope: me
                    });
                } else {
                    comp.animCollapse = me.initialAnimate;
                    comp.autoScroll = false;
                }
                comp.border = comp.collapsed;
            }
        }

        
        if (ln && me.expandedItem === undefined) {
            me.expandedItem = 0;
            comp = items[0];
            comp.collapsed = comp.border = false;
        }
    }
});

Ext.define('Ext.Neptune.panel.Header', {
    override: 'Ext.panel.Header',

    toolsFirst: false,

    initComponent: function() {
        var me = this,
            ruleStyle,
            rule,
            style,
            ui,
            tempEl;

        me.indicateDragCls = me.baseCls + '-draggable';
        me.title = me.title || '&#160;';
        me.tools = me.tools || [];
        me.items = me.items || [];
        me.orientation = me.orientation || 'horizontal';
        me.dock = (me.dock) ? me.dock : (me.orientation == 'horizontal') ? 'top' : 'left';

        
        
        me.addClsWithUI([me.orientation, me.dock]);

        if (me.indicateDrag) {
            me.addCls(me.indicateDragCls);
        }

        
        if (!Ext.isEmpty(me.iconCls)) {
            me.initIconCmp();
            me.items.push(me.iconCmp);
        }

        
        if (me.orientation == 'vertical') {
            me.layout = {
                type : 'vbox',
                align: 'center'
            };
            me.textConfig = {
                width: 15,
                cls: me.baseCls + '-text',
                type: 'text',
                text: me.title,
                rotate: {
                    degrees: 90
                }
            };
            ui = me.ui;
            if (Ext.isArray(ui)) {
                ui = ui[0];
            }
            ruleStyle = '.' + me.baseCls + '-text-' + ui;
            if (Ext.scopeResetCSS) {
                ruleStyle = '.' + Ext.baseCSSPrefix + 'reset ' + ruleStyle;
            }
            rule = Ext.util.CSS.getRule(ruleStyle);
            if (rule) {
                style = rule.style;
            }else {
                
                style = (tempEl = Ext.getBody().createChild({style: 'position:absolute', cls: me.baseCls + '-text-' + ui})).getStyles('fontFamily', 'fontWeight', 'fontSize', 'color');
                tempEl.remove();
            }
            if (style) {
                Ext.apply(me.textConfig, {
                    'font-family': style.fontFamily,
                    'font-weight': style.fontWeight,
                    'font-size': style.fontSize,
                    fill: style.color
                });
            }
            me.titleCmp = new Ext.draw.Component({
                
                ariaRole  : 'heading',
                focusable : false,
                viewBox   : false,
                flex      : 1,
                id        : me.id + '_hd',
                autoSize  : true,
                margins   : '5 0 0 0',
                items     : [ me.textConfig ],
                xhooks: {
                    setSize: function (width) {
                        
                        this.callParent([width]);
                    }
                },
                
                
                childEls  : [
                    { name: 'textEl', select: '.' + me.baseCls + '-text' }
                ]
            });
        } else {
            me.layout = {
                type : 'hbox',
                align: 'middle'
            };
            me.titleCmp = new Ext.Component({
                
                xtype     : 'component',
                ariaRole  : 'heading',
                focusable : false,
                noWrap    : true,
                flex      : 1,
                id        : me.id + '_hd',
                cls       : me.baseCls + '-text-container',
                renderTpl : me.getTpl('headingTpl'),
                renderData: {
                    title: me.title,
                    cls  : me.baseCls,
                    ui   : me.ui
                },
                childEls  : ['textEl']
            });
        }

        

        if (me.toolsFirst) {
            me.addCls(me.baseCls + '-tools-first');
            me.items = me.items.concat(me.tools);
            me.items.push(me.titleCmp);
        } else {
            me.items.push(me.titleCmp);
            me.items = me.items.concat(me.tools);
        }
        
		Ext.panel.Header.superclass.initComponent.call(this, arguments);
        
        me.on({
            click: me.onClick,
            mouseover: me.onMouseOver,
            mouseout : me.onMouseOut,
            mousedown: me.onMouseDown,
            mouseup: me.onMouseUp,
            element: 'el',
            scope: me
        });
    },

    
    onRender: function() {
        var me = this;
        me.doc = Ext.getDoc();
        me.callParent(arguments);
    },

    
    onMouseOver: function() {
        this.addCls(this.baseCls + '-over');
    },

    
    onMouseOut: function() {
        this.removeCls(this.baseCls + '-over');
        this.removeCls(this.baseCls + '-pressed');
    },

    
    onMouseDown: function() {
        this.addCls(this.baseCls + '-pressed');
    },

    
    onMouseUp: function(e) {
        this.removeCls(this.baseCls + '-pressed');
    }
});

Ext.define('Ext.Neptune.panel.Panel', {
    override: 'Ext.panel.Panel',

    
    toolsFirst: false,

    updateHeader: function(force) {
        var me = this,
            header = me.header,
            title = me.title,
            tools = me.tools;

        if (!me.preventHeader && (force || title || (tools && tools.length))) {
            if (header) {
                header.show();
            } else {
                header = me.header = new Ext.panel.Header({
                    title       : title,
                    orientation : (me.headerPosition == 'left' || me.headerPosition == 'right') ? 'vertical' : 'horizontal',
                    dock        : me.headerPosition || 'top',
                    textCls     : me.headerTextCls,
                    iconCls     : me.iconCls,
                    baseCls     : me.baseCls + '-header',
                    tools       : tools,
                    ui          : me.ui,
                    id          : me.id + '_header',
                    indicateDrag: me.draggable,
                    toolsFirst  : me.toolsFirst,
                    border      : me.border,
                    frame       : me.frame && me.frameHeader,
                    ignoreParentFrame : me.frame || me.overlapHeader,
                    ignoreBorderManagement: me.frame || me.ignoreHeaderBorderManagement,
                    listeners   : me.collapsible && me.titleCollapse ? {
                        click: me.toggleCollapse,
                        scope: me
                    } : null
                });
                me.addDocked(header, 0);

                
                
                me.tools = header.tools;
            }
            me.initHeaderAria();

            me.addCls(me.baseCls + '-hasheader-' + me.headerPosition);
        } else if (header) {
            header.hide();
            
            me.removeCls(me.baseCls + '-hasheader-' + me.headerPosition);
        }
    }
});

Ext.define('Ext.Neptune.resizer.Splitter', {
    override: 'Ext.resizer.Splitter',

    onRender: function() {
        var me = this;

        me.callParent(arguments);

        
        if (me.performCollapse !== false) {
            if (me.renderData.collapsible) {
                me.mon(me.collapseEl, 'click', me.toggleTargetCmp, me);
            }
            if (me.collapseOnDblClick) {
                me.mon(me.el, 'dblclick', me.toggleTargetCmp, me);
            }
        }

        
        me.mon(me.getCollapseTarget(), {
            collapse: me.onTargetCollapse,
            expand: me.onTargetExpand,
            scope: me
        });

        me.mon(me.el, 'mouseover', me.onMouseOver, me);
        me.mon(me.el, 'mouseout', me.onMouseOut, me);

        me.el.unselectable();
        me.tracker = Ext.create(me.getTrackerConfig());

        
        me.relayEvents(me.tracker, [ 'beforedragstart', 'dragstart', 'dragend' ]);
    },

    onMouseOver: function() {
        this.el.addCls(this.baseCls + '-over');
    },

    onMouseOut: function() {
        this.el.removeCls(this.baseCls + '-over');
    }
});

Ext.define('Ext.Neptune.tree.Panel', {
    override: 'Ext.tree.Panel',

    initComponent: function() {
        var me = this,
            cls = [me.treeCls],
            view;

        if (me.useArrows) {
            cls.push(Ext.baseCSSPrefix + 'tree-arrows');
        } else {
            cls.push(Ext.baseCSSPrefix + 'tree-no-arrows');
        }

        if (me.lines) {
            cls.push(Ext.baseCSSPrefix + 'tree-lines');
        } else {
            cls.push(Ext.baseCSSPrefix + 'tree-no-lines');
        }

        if (Ext.isString(me.store)) {
            me.store = Ext.StoreMgr.lookup(me.store);
        } else if (!me.store || Ext.isObject(me.store) && !me.store.isStore) {
            me.store = new Ext.data.TreeStore(Ext.apply({}, me.store || {}, {
                root: me.root,
                fields: me.fields,
                model: me.model,
                folderSort: me.folderSort
            }));
        } else if (me.root) {
            me.store = Ext.data.StoreManager.lookup(me.store);
            me.store.setRootNode(me.root);
            if (me.folderSort !== undefined) {
                me.store.folderSort = me.folderSort;
                me.store.sort();
            }
        }

        
        
        
        

        me.viewConfig = Ext.applyIf(me.viewConfig || {}, {
            rootVisible: me.rootVisible,
            animate: me.enableAnimations,
            singleExpand: me.singleExpand,
            node: me.store.getRootNode(),
            hideHeaders: me.hideHeaders
        });

        me.mon(me.store, {
            scope: me,
            rootchange: me.onRootChange,
            clear: me.onClear
        });

        me.relayEvents(me.store, [
            
            'beforeload',

            
            'load'
        ]);

        me.store.on({
            
            append: me.createRelayer('itemappend'),

            
            remove: me.createRelayer('itemremove'),

            
            move: me.createRelayer('itemmove'),

            
            insert: me.createRelayer('iteminsert'),

            
            beforeappend: me.createRelayer('beforeitemappend'),

            
            beforeremove: me.createRelayer('beforeitemremove'),

            
            beforemove: me.createRelayer('beforeitemmove'),

            
            beforeinsert: me.createRelayer('beforeiteminsert'),

            
            expand: me.createRelayer('itemexpand'),

            
            collapse: me.createRelayer('itemcollapse'),

            
            beforeexpand: me.createRelayer('beforeitemexpand'),

            
            beforecollapse: me.createRelayer('beforeitemcollapse')
        });

        
        if (!me.columns) {
            if (me.initialConfig.hideHeaders === undefined) {
                me.hideHeaders = true;
            }
            me.autoWidth = true;
            me.addCls(Ext.baseCSSPrefix + 'autowidth-table');
            me.columns = [{
                xtype    : 'treecolumn',
                text     : 'Name',
                width    : Ext.isIE6 ? null : 10000,
                dataIndex: me.displayField
            }];
        }

        if (me.cls) {
            cls.push(me.cls);
        }
        
        me.cls = cls.join(' ');
        Ext.tree.Panel.superclass.initComponent.apply(me, arguments);
        
        view = me.getView();

        
        
        if (Ext.isIE6 && me.autoWidth) {
            view.afterRender = Ext.Function.createSequence(view.afterRender, function() {
                this.stretcher = view.el.down('th').createChild({style:"height:0px;width:" + (this.getWidth() - Ext.getScrollbarSize().width) + "px"});
            });
            view.afterComponentLayout = Ext.Function.createSequence(view.afterComponentLayout, function() {
                this.stretcher.setWidth((this.getWidth() - Ext.getScrollbarSize().width));
            });
        }

        me.relayEvents(view, [
            
            'checkchange',
            
            'afteritemexpand',
            
            'afteritemcollapse'
        ]);

        
        if (!view.rootVisible && !me.getRootNode()) {
            me.setRootNode({
                expanded: true
            });
        }
    }
});
