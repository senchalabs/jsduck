# Trees
______________________________________________

The {@link Ext.tree.Panel Tree Panel} Component is one of the most versatile Components in Ext JS and is an excellent tool for displaying heirarchical data in an application.  Tree Panel extends from the same class as {@link Ext.grid.Panel Grid Panel}, so all of the benefits of Grid Panels - features, extensions, and plugins can also be used on Tree Panels. Things like columns, column resizing, dragging and dropping, renderers, sorting and filtering can be expected to work similarly for both components.

Let's start by creating a very simple Tree.

    @example
    Ext.create('Ext.tree.Panel', {
        renderTo: Ext.getBody(),
        title: 'Simple Tree',
        width: 150,
        height: 150,
        root: {
            text: 'Root',
            expanded: true,
            children: [
                {
                    text: 'Child 1',
                    leaf: true
                },
                {
                    text: 'Child 2',
                    leaf: true
                },
                {
                    text: 'Child 3',
                    expanded: true,
                    children: [
                        {
                            text: 'Grandchild',
                            leaf: true
                        }
                    ]
                }
            ]
        }
    });

This Tree Panel renders itself to the document body.  We defined a root node that is expanded by default. The root node has three children, the first two of which are leaf nodes which means they cannot have any children.  The third node is not a leaf node and has has one child leaf node.  The `text` property is used as the node's text label. See [Simple Tree](guides/tree/examples/simple_tree/index.html) for a live demo.

Internally a Tree Panel stores its data in a {@link Ext.data.TreeStore TreeStore}. The above example uses the {@link Ext.tree.Panel#root root} config as a shortcut for configuring a store.  If we were to configure the store separately, the code would look something like this:

    var store = Ext.create('Ext.data.TreeStore', {
        root: {
            text: 'Root',
            expanded: true,
            children: [
                {
                    text: 'Child 1',
                    leaf: true
                },
                {
                    text: 'Child 2',
                    leaf: true
                },
                ...
            ]
        }
    });

    Ext.create('Ext.tree.Panel', {
        title: 'Simple Tree',
        store: store,
        ...
    });

For more on {@link Ext.data.Store Store}s see the [Data Guide](#/guide/data).


## The Node Interface
In the above examples we set a couple of different properties on tree nodes. But what are nodes exactly? As mentioned before, the Tree Panel is bound to a {@link Ext.data.TreeStore TreeStore}. A Store in Ext JS manages a collection of {@link Ext.data.Model Model} instances. Tree nodes are simply Model instances that are decorated with a {@link Ext.data.NodeInterface NodeInterface}.  Decorating a Model with a NodeInterface gives the Model the fields, methods and properties that are required for it to be used in a tree.  The following is a screenshot that shows the structure of a node in the developer tools.

{@img nodeinterface.png A model instance decorated with the NodeInterface}

In order to see the full set of fields, methods and properties available on nodes, see the API documentation for the {@link Ext.data.NodeInterface NodeInterface} class.

## Visually changing your tree
Let's try something simple. When you set the {@link Ext.tree.Panel#useArrows useArrows} configuration to true, the Tree Panel hides the lines and uses arrows as expand and collapse icons.

{@img arrows.png Arrows}

Setting the {@link Ext.tree.Panel#rootVisible rootVisible} property to false visually removes the root node. By doing this, the root node will automatically be expanded. The following image shows the same tree with `rootVisible` set to false and {@link Ext.tree.Panel#lines lines} set to false.

{@img root-lines.png Root not visible and no lines}

## Multiple columns
Since {@link Ext.tree.Panel Tree Panel} extends from the same base class as {@link Ext.grid.Panel Grid Panel} adding more columns is very easy to do.

    @example
    var tree = Ext.create('Ext.tree.Panel', {
        renderTo: Ext.getBody(),
        title: 'TreeGrid',
        width: 300,
        height: 150,
        fields: ['name', 'description'],
        columns: [{
            xtype: 'treecolumn',
            text: 'Name',
            dataIndex: 'name',
            width: 150,
            sortable: true
        }, {
            text: 'Description',
            dataIndex: 'description',
            flex: 1,
            sortable: true
        }],
        root: {
            name: 'Root',
            description: 'Root description',
            expanded: true,
            children: [{
                name: 'Child 1',
                description: 'Description 1',
                leaf: true
            }, {
                name: 'Child 2',
                description: 'Description 2',
                leaf: true
            }]
        }
    });

The {@link Ext.tree.Panel#columns columns} configuration expects an array of {@link Ext.grid.column.Column} configurations just like a {@link Ext.grid.Panel Grid Panel} would have.  The only difference is that a Tree Panel requires at least one column with an xtype of 'treecolumn'.  This type of column has tree-specific visual effects like depth, lines and expand and collapse icons. A typical Tree Panel would have only one 'treecolumn'.

The `fields` configuration is passed on to the Model that the internally created Store uses (See the [Data Guide](#/guide/data) for more information on {@link Ext.data.Model Model}s). Notice how the {@link Ext.grid.column.Column#dataIndex dataIndex} configurations on the columns map to the fields we specified - name and description.

It is also worth noting that when columns are not defined, the tree will automatically create one single `treecolumn` with a `dataIndex` set to 'text'. It also hides the headers on the tree. To show this header when using only a single column set the `hideHeaders` configuration to 'false'.

## Adding nodes to the tree

The root node for the Tree Panel does not have to be specified in the initial configuration.  We can always add it later:

    var tree = Ext.create('Ext.tree.Panel');
    tree.setRootNode({
        text: 'Root',
        expanded: true,
        children: [{
            text: 'Child 1',
            leaf: true
        }, {
            text: 'Child 2',
            leaf: true
        }]
    });

Although this is useful for very small trees with only a few static nodes, most Tree Panels will contain many more nodes. So let's take a look at how we can programmatically add new nodes to the tree.

    var root = tree.getRootNode();

    var parent = root.appendChild({
        text: 'Parent 1'
    });

    parent.appendChild({
        text: 'Child 3',
        leaf: true
    });

    parent.expand();

Every node that is not a leaf node has an {@link Ext.data.NodeInterface#appendChild appendChild} method which accepts a Node, or a config object for a Node as its first parameter, and returns the Node that was appended. The above example also calls the {@link Ext.data.NodeInterface#method-expand expand} method to expand the newly created parent.

{@img append-children.png Appending to the tree}

Also useful is the ability to define children inline when creating the new parent nodes. The following code gives us the same result.

    var parent = root.appendChild({
        text: 'Parent 1',
        expanded: true,
        children: [{
            text: 'Child 3',
            leaf: true
        }]
    });

Sometimes we want to insert a node into a specific location in the tree instead of appending it. Besides the `appendChild` method, {@link Ext.data.NodeInterface} also provides {@link Ext.data.NodeInterface#insertBefore insertBefore} and {@link Ext.data.NodeInterface#insertChild insertChild} methods.

    var child = parent.insertChild(0, {
        text: 'Child 2.5',
        leaf: true
    });

    parent.insertBefore({
        text: 'Child 2.75',
        leaf: true
    }, child.nextSibling);

The `insertChild` method expects an index at which the child will be inserted. The `insertBefore` method expects a reference node. The new node will be inserted before the reference node.

{@img insert-children.png Inserting children into the tree}

NodeInterface also provides several more properties on nodes that can be used to reference other nodes.

* {@link Ext.data.NodeInterface#nextSibling nextSibling}
* {@link Ext.data.NodeInterface#previousSibling previousSibling}
* {@link Ext.data.NodeInterface#parentNode parentNode}
* {@link Ext.data.NodeInterface#lastChild lastChild}
* {@link Ext.data.NodeInterface#firstChild firstChild}
* {@link Ext.data.NodeInterface#childNodes childNodes}

## Loading and Saving Tree Data using a Proxy

Loading and saving Tree data is somewhat more complex than dealing with flat data because of all the fields that are required to represent the hierarchical structure of the tree.
This section will explain the intricacies of working with tree data.

### NodeInterface Fields

The first and most important thing to understand when working with tree data is how the {@link Ext.data.NodeInterface NodeInterface} class' fields work.
Every node in a Tree is simply a {@link Ext.data.Model Model} instance decorated with the NodeInterface's fields and methods.
Assume for a moment that an application has a Model called Person.  A Person only has two fields - id and name:

    Ext.define('Person', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'id', type: 'int' },
            { name: 'name', type: 'string' }
        ]
    });

At this point Person is just a plain vanilla Model.  If an instance is created, it can easily be verified that it only has two fields by looking at its `fields` collection

    console.log(Person.prototype.fields.getCount()); // outputs '2'

When the Person model is used in a TreeStore, something interesting happens.  Notice the field count now:

    var store = Ext.create('Ext.data.TreeStore', {
        model: 'Person',
        root: {
            name: 'Phil'
        }
    });

    console.log(Person.prototype.fields.getCount()); // outputs '24'

The Person model's prototype got 22 extra fields added to it just by using it in a TreeStore.  All of these extra fields are defined on the {@link Ext.data.NodeInterface NodeInterface}
class and are added to the Model's prototype the first time an instance of that Model is used in a TreeStore (by setting it as the root node).

So what exactly are these 22 extra fields, and what do they do?  A quick look at the NodeInterface source code reveals that it decorates the Model with the following fields.
These fields are used internally to store information relating to the tree's structure and state:

    {name: 'parentId',   type: idType,    defaultValue: null},
    {name: 'index',      type: 'int',     defaultValue: null, persist: false},
    {name: 'depth',      type: 'int',     defaultValue: 0, persist: false},
    {name: 'expanded',   type: 'bool',    defaultValue: false, persist: false},
    {name: 'expandable', type: 'bool',    defaultValue: true, persist: false},
    {name: 'checked',    type: 'auto',    defaultValue: null, persist: false},
    {name: 'leaf',       type: 'bool',    defaultValue: false},
    {name: 'cls',        type: 'string',  defaultValue: null, persist: false},
    {name: 'iconCls',    type: 'string',  defaultValue: null, persist: false},
    {name: 'icon',       type: 'string',  defaultValue: null, persist: false},
    {name: 'root',       type: 'boolean', defaultValue: false, persist: false},
    {name: 'isLast',     type: 'boolean', defaultValue: false, persist: false},
    {name: 'isFirst',    type: 'boolean', defaultValue: false, persist: false},
    {name: 'allowDrop',  type: 'boolean', defaultValue: true, persist: false},
    {name: 'allowDrag',  type: 'boolean', defaultValue: true, persist: false},
    {name: 'loaded',     type: 'boolean', defaultValue: false, persist: false},
    {name: 'loading',    type: 'boolean', defaultValue: false, persist: false},
    {name: 'href',       type: 'string',  defaultValue: null, persist: false},
    {name: 'hrefTarget', type: 'string',  defaultValue: null, persist: false},
    {name: 'qtip',       type: 'string',  defaultValue: null, persist: false},
    {name: 'qtitle',     type: 'string',  defaultValue: null, persist: false},
    {name: 'children',   type: 'auto',   defaultValue: null, persist: false}

#### NodeInterface Fields are Reserved Names

It is important to note that all of the above field names should be treated as "reserved" names.  For example, it is not allowed to have a field called "parentId"
in a Model, if that Model is intended to be used in a Tree, since the Model's field will override the NodeInterface field.  The exception to this rule is
when there is a legitimate need to override the persistence of a field.

#### Persistent Fields vs Non-persistent Fields and Overriding the Persistence of Fields

Most of NodeInterface's fields default to `persist: false`.  This means they are non-persistent fields by default.  Non-persistent fields will not be saved via
the Proxy when calling the TreeStore's sync method or calling save() on the Model.  In most cases, the majority of these fields can be left at their default
persistence setting,  but there are cases where it is necessary to override the persistence of some fields.  The following example demonstrates how to override
the persistence of a NodeInterface field.  When overriding a NodeInterface field it is important to only change the `persist` property.  `name`, `type`, and `defaultValue`
should never be changed.

    // overriding the persistence of NodeInterface fields in a Model definition
    Ext.define('Person', {
        extend: 'Ext.data.Model',
        fields: [
            // Person fields
            { name: 'id', type: 'int' },
            { name: 'name', type: 'string' }

            // override a non-persistent NodeInterface field to make it persistent
            { name: 'iconCls', type: 'string',  defaultValue: null, persist: true },
        ]
    });

Let's take a more in-depth look at each NodeInterface field and the scenarios in which it might be necessary to  override its `persist` property.
In each example below it is assumed that a {@link Ext.data.proxy.Server Server Proxy} is being used unless otherwise noted.

Persistent by default:

* `parentId` - used to store the id of a node's parent node.  This field should always be persistent, and should not be overridden.
* `leaf` - used to indicate that the node is a leaf node, and therefore cannot have children appended to it.  This field should not normally need to be overridden.

Non-persistent by default:

* `index` - used to store the order of nodes within their parent. When a node is {@link Ext.data.NodeInterface#insertBefore inserted} or
{@link Ext.data.NodeInterface#removeChild removed}, all of its sibling nodes after the insertion or removal point will have their indexes updated.
If desired, the application can use this field to persist the ordering of nodes. However, if the server uses a different method of storing order,
it may be more appropriate to leave the index field as non-persistent. When using a {@link Ext.data.proxy.WebStorage WebStorage Proxy} if storing order
is required, this field must be overridden to be persistent. Also if client-side {@link Ext.data.TreeStore#folderSort sorting} is being used it is recommended
for the index field to be left as non-persistent, since sorting updates the indexes of all the sorted nodes, which would cause them to be persisted
on next sync or save if the `persist` property is true.
* `depth` - used to store the depth of a node in the tree hierarchy.  Override this field to turn on persistence if the server needs to store the depth field.
When using a {@link Ext.data.proxy.WebStorage WebStorage Proxy} it is recommended to not override the persistence of the depth field since it is not needed
to properly store the tree structure and will just take up extra space.
* `checked` - this field should be overridden to be persistent if the tree is using the [checkbox feature](#!/example/tree/check-tree.html)
* `expanded` - used to store the expanded/collapsed state of a node.  This field should not normally need to be overridden.
* `expandable` - used internally to indicate that this node is expandable.  Do not override the persistence of this field.
* `cls` - used to apply a css class to the node when it is rendered in a TreePanel.  Override this field to be persistent if desired.
* `iconCls` - used to apply a css class to the node's icon when it is rendered in a TreePanel.  Override this field to be persistent if desired.
* `icon` - used to apply a cutom icon to the node node when it is rendered in a TreePanel.  Override this field to be persistent if desired.
* `root` - used to indicate that this node is the root node.  This field should not be overridden.
* `isLast` - used to indicate that this node is the last of its siblings. This field should not normally need to be overridden.
* `isFirst` - used to indicate that this node is the first of its siblings. This field should not normally need to be overridden.
* `allowDrop` - used internally to deny dropping on the node.  Do not override the persistence of this field.
* `allowDrag` - used internally to deny dragging the node.  Do not override the persistence of this field.
* `loaded` - used internally to indicate that the node's children have been loaded.  Do not override the persistence of this field.
* `loading` - used internally to indicate that the proxy is in the process of loading the node's children. Do not override the persistence of this field.
* `href` - used to specify a url that the node should be a link to.  Override to be persistent if desired.
* `hrefTarget` - used to specify the target for the `href`.  Override to be persistent if desired.
* `qtip` - used to add a tooltip text to the node.  Override to be persistent if desired.
* `qtitle` - used to specify the title for the `tooltip`.  Override to be persistent if desired.
* `children` - used internally when loading a node and its children all in one request.  Do not override the persistence of this field.

### Loading Data

There are two ways to load tree data.  The first is to for the proxy to fetch the entire tree all at once.  For larger trees where loading everything
at once is not ideal, it may be preferable to use the second method - dynamically loading the children for each node when it is expanded.

#### Loading the Entire Tree

Internally the tree only loads data in response to a node being expanded.  However the entire hierarchy can be loaded if the proxy retrieves a nested object
containing the whole tree structure.  To accomplish this, initialize the TreeStore's root node to `expanded`:

    Ext.define('Person', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'id', type: 'int' },
            { name: 'name', type: 'string' }
        ],
        proxy: {
            type: 'ajax',
            api: {
                create: 'createPersons',
                read: 'readPersons',
                update: 'updatePersons',
                destroy: 'destroyPersons'
            }
        }

    });

    var store = Ext.create('Ext.data.TreeStore', {
        model: 'Person',
        root: {
            name: 'People',
            expanded: true
        }
    });

    Ext.create('Ext.tree.Panel', {
        renderTo: Ext.getBody(),
        width: 300,
        height: 200,
        title: 'People',
        store: store,
        columns: [
            { xtype: 'treecolumn', header: 'Name', dataIndex: 'name', flex: 1 }
        ]
    });

Assume that the `readPersons` url returns the following json object

    {
        "success": true,
        "children": [
            { "id": 1, "name": "Phil", "leaf": true },
            { "id": 2, "name": "Nico", "expanded": true, "children": [
                { "id": 3, "name": "Mitchell", "leaf": true }
            ]},
            { "id": 4, "name": "Sue", "loaded": true }
        ]
    }

That's all that's needed to load the entire tree.

{@img tree-bulk-load.png Tree with Bulk Loaded Data}

Important items to note:

* For all non-leaf nodes that do not have children (for example, Person with name Sue above),
the server response MUST set the `loaded` property to `true`.  Otherwise the proxy will attempt to load children for these nodes when they are expanded.
* The question then arises - if the server is allowed to set the `loaded` property on a node in the JSON response can it set any of the other non-persistent fields?
The answer is yes - sometimes.  In the example above the node with name "Nico" has is `expanded` field set to `true` so that it will be initially displayed as expanded
in the Tree Panel.  Caution should be exercised as there are cases where this is not appropriate and could cause serious problems, like setting the `root` property on
a node that is not the root node for example.  In general `loaded` and `expanded` are the only cases where it is recommended for the server to set a non-persistent field
in the JSON response.

#### Dynamically Loading Children When a Node is Expanded

For larger trees it may be desirable to only load parts of the tree by loading child nodes only when their parent node is expanded.  Suppose in the above example,
that the node with name "Sue" does not have its `loaded` field set to `true` by the server response.  The Tree would display an expander icon next to the node.
When the node is expanded the proxy will make another request to the `readPersons` url that looks something like this:

    /readPersons?node=4

This tells the server to retrieve the child nodes for the node with an id of 4.  The data should be returned in the same format as the data that was used to load the root node:

    {
        "success": true,
        "children": [
            { "id": 5, "name": "Evan", "leaf": true }
        ]
    }

Now the Tree looks something like this:

{@img tree-dynamic-load.png Tree with Dynamically Loaded Node}

### Saving Data

Creating, updating, and deleting nodes is handled automatically and seamlessly by the Proxy.

#### Creating a New Node

    // Create a new node and append it to the tree:
    var newPerson = Ext.create('Person', { name: 'Nige', leaf: true });
    store.getNodeById(2).appendChild(newPerson);

Since the proxy is defined directly on the Model, the Model's {@link Ext.data.Model#save save()} method can be used to persist the data:

    newPerson.save();

#### Updating an Existing Node

    store.getNodeById(1).set('name', 'Philip');

#### Removing a Node

    store.getRootNode().lastChild.remove();

#### Bulk Operations

After creating, updating, and removing several nodes, they can all be persisted in one operation by calling the TreeStore's {@link Ext.data.TreeStore#sync sync()} method:

    store.sync();
