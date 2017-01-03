/**
 * Model for a book
 */
Ext.define('Books.model.Book', {
    extend: 'Ext.data.Model',
    requires: ['Books.model.Review', 'Ext.data.association.HasMany', 'Ext.data.association.BelongsTo'],

    fields: [
        'id',
        'name',
        'author',
        'detail',
        'price',
        'image'
    ],

    hasMany: {model: 'Books.model.Review', name: 'reviews'}
});
