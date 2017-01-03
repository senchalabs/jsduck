# Ext JS 4.1 Upgrade Guide

This guide is meant to assist developers migrating from Ext JS 4.0.x to 4.1. Our goal was to maintain API compatibility
as much as possible, despite the scope of the changes we are making to address bugs and user feedback. However, some
changes were needed, which you need to consider in further Ext JS development.

If you encounter issues related to these API changes, please post your issues directly to our community forum found
[here](http://www.sencha.com/forum/forumdisplay.php?93-Ext-4.1). If you are a support subscriber, you can also file your
issue through our support portal found [here](http://www.sencha.com/support/).

## Component render called only on top-most components

Previous releases used the `render` method  to render all components in a top-down traversal. In 4.1, rendering is
performed in memory as markup which is then written to the DOM. This means that the `render` method of child components
is not called. It's recommended that code in the `render` method be moved to either `beforeRender` (new to 4.1) or
`afterRender`. For best performance, make style or `add/removeCls` adjustments in `beforeRender` so that these values
are generated in the initial markup and not made to the DOM element as it would be in `afterRender`.

## Component onRender elements now exist in DOM at time of call

Previous releases created the component's primary element (`el`) when calling the parent class method. This is no longer
possible because of bulk rendering. Any logic that was performed prior to calling the `parent` method can be moved to
the new `beforeRender` method

## Component renderTpl now calls helper methods

As part of bulk rendering, a `renderTpl` now calls helper methods on the template instance to inject content and
container items. This can be best seen in the default `renderTpl` for components and containers:

Code for components:

    renderTpl: '{%this.renderContent(out,values)%}'

Code for containers:

    renderTpl: '{%this.renderContainer(out,values)%}'


## callParent calls overridden method

As part of formalizing `Ext.define/override` in Ext JS 4.1, it is now possible to name and require overrides just as
you would a normal class:

    Ext.define('My.patch.Grid', {
        override: 'Ext.grid.Panel',
        foo: function () {
            this.callParent(); // calls Ext.grid.Panel.foo
        }
    });

The above code in Ext JS 4.0 would have called the base class `foo` method. You had to use the `callOverridden` to
accomplish the above. In Ext JS 4.1, to bypass the overriden method, you just need to use the following code:

    Ext.define('My.patch.Grid', {
        override: 'Ext.grid.Panel',
        foo: function () {
            Ext.grid.Panel.superclass.foo.call(this);
        }
    });

It is even possible for a class to `require` its own overrides. This enables breaking up a large class into independent
parts expressed as overrides (a better approach than `AbstractFoo` and `Foo`).

## FocusManager no longer requires subscribe

In previous releases, use of `FocusManager` was inefficient. `FocusManager` used to have to be pointed at a container
(that is, it had to subscribe to the Container), and it would dig out all descendant components and add listeners to
both the descendants' elements and the descendant components themselves. It also had to monitor for adds and removes
within that container tree.

In Ext JS 4.1, `onFocus` and `onBlur` template methods in `AbstractComponent` are called on focus and blur of the
component's `getFocusEl()`. This is part of a component’s natural functionality. Non-focusable components won't
implement `getFocusEl`, and so they will not be part of the focus tree. Containers are focusable so that you can
navigate between and into them.

Now, `FocusManager` hooks directly into `AbstractComponent` template methods and hears what is being focused. Once it's
enabled it globally tracks focus, and adds framing which follows focus, and allows navigation into the
container->component tree.

## Component doLayout and doComponentLayout methods internal changes

The doLayout and doComponentLayout methods have been modified. Their previous functionality has been combined into
`updateLayout`. As a component author, these methods can no longer be overridden to perform a custom layout since they
will not be called internally as they used to be. Instead you can override `afterComponentLayout`, which is given the
new size and old size as parameters, or you can respond to the resize event.  Overriding `afterComponentLayout` is a
possible way of postprocessing a Component's structure after a layout. If you are writing a derived component, the
method override should be preferred. Just be sure to use `callParent`.

Note that the size of the component should not be changed by this method,since the size has been determined already. If
the size is changed again, this could lead to infinite recursion at worst (since `afterComponentLayout` will be called
again) or just wrong layout.

## config setters are called to set default values

In Ext JS 4.0, the config mechanism in `Ext.define` would create `getter` and `setter` methods, but the default value
would bypass the setter. In Ext JS 4.1 (and Touch 2), config defaults are now passed to the setter method. This can
affect the timing of the first call to the setter method, but it is needed because setters are designed to enable
transformation-on-set semantics.

The generated getter for a config property named “foo” looks like the following:

    getFoo: function () {
        if (!this._isFooInitialized) {
            this._isFooInitialized = true;
            this.setFoo(this.config.foo);
        }
        return this.foo; // or call user-provided getFoo method
    },

And the generated setter looks like this:

    setFoo: function (newValue) {
        var oldValue = this.foo;

        if (!this._isFooInitialized) {
            this._isFooInitialized = true;
        }

        this.applyFoo(newValue, oldValue);

        if (typeof newValue != ‘undefined’) {
            this.foo = newValue;
            if (newValue !== oldValue) {
                this.updateFoo(newValue, oldValue);
            }
        }
    }

If there is no `applyFoo` and/or `updateFoo` method, these calls are simply skipped. It is best to provide custom
implementations of `applyFoo` rather than a custom `setFoo` so that the rest of the provided boilerplate is preserved.
Alternatively, responding only to changes in the property is often ideal, so implementing `updateFoo` may be better to
ignore setter calls that do not change the property.

## Ext.data.Model can now join multiple Ext.data.Stores

A single record can belong to more than one store, especially in the case of a tree. The `store` property on a model
now only references the first store. Use the `stores` array to examine all stores.

## Ext.layout.container.Border adds splitter components to the container

In Ext JS 4.1, when you configure components with `split: true`, Border layout inserts extra splitter components as
siblings of the current components. This simplifies Border and also allows enables it to dynamically modify regions.

## Infinite grid scrolling is simpler

To scroll an indeterminate sized dataset within a grid, simply configure the Store with

    buffered: true,
    autoLoad: true,

The grid will scroll through the whole dataset using natural scrolling, but only using as many table rows as are
necessary to display the visible portion of the data with a small (configurable) leading and trailing zone to provide
scrolling.

## XTemplate improvements

XTemplates now accept `<tpl elseif>` and  `<tpl else>` tags between `<tpl if>` and `</tpl>`

XTemplates now evaluate embedded script fragments as "scriptlets" using "{% code %}". The code is executed, but nothing
is placed into the template’s output stream.

## Grid plugins

Certain Sencha-supplied Grid plugins and Features may now be used with lockable grids. The non-locked columns of a
lockable grid may be edited using a row or cell editor. The grouping Features divide into two to work on both sides of
the lockable grid and stay synchronized.

See the `examples/grid/locking-group-summary-grid.html` example in your SDK for an example.

## History

In previous versions of Ext JS, using the Ext.util.History class required you to manually add a form element to your
page. This is no longer required. They will still be used if present, but it is best to remove them and allow the
framework to generate what is required for the browser. The form that was required looked like this:

    <form id="history-form" class="x-hide-display">
        <input type="hidden" id="x-history-field" />
        <iframe id="x-history-frame"></iframe>
    </form>
