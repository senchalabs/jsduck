/**
 * Model for statistics per class.
 */
Ext.define('Docs.model.Stats', {
    extend: 'Ext.data.Model',
    fields: [
        'name',

        'local_cfgs',
        'local_properties',
        'local_methods',
        'local_events',
        'local_members',

        'total_cfgs',
        'total_properties',
        'total_methods',
        'total_events',
        'total_members',

        'fanIn',
        'fanOut',
        'class_wc',
        'members_wc',
        'wc_per_member'
    ]
});
