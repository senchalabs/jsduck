/*

This file is a modified version of direct-grid.js found in the Ext JS 4 package.

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/

Ext.onReady(function() {
	Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
	
	//added model inside onready
	Ext.define('PersonalInfo', {
		extend: 'Ext.data.Model',
		fields: ['id', 'name', 'address', 'state']
	});
	
	//separated store into unique var for guaranteeRange
	var store = Ext.create('Ext.data.Store', {
		id: 'store',
		model: 'PersonalInfo',
		autoLoad: true,
		proxy: {
			type: 'direct',
			api: {
				create:	QueryDatabase.createRecord,
				read: QueryDatabase.getResults,
				update:	QueryDatabase.updateRecords,
				destroy: QueryDatabase.destroyRecord
			}
		}
	});
	
	var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
		clicksToMoveEditor: 1,
		autoCancel: false
	});
	
	var alphaSpaceTest = /^[-\sa-zA-Z]+$/;
	
	Ext.apply(Ext.form.field.VTypes, {
	    //  vtype validation function
	    alphaSpace: function(val, field) {
	        return alphaSpaceTest.test(val);
	    },
	    // vtype Text property: The error text to display when the validation function returns false
	    alphaSpaceText: 'Not a valid state.  Must not contain numbers.',
	    // vtype Mask property: The keystroke filter mask
	    alphaSpaceMask: /^[-\sa-zA-Z]+$/
	});
	
	// create the Grid
	var grid = Ext.create('Ext.grid.Panel', {
		height: 450,
		width: 700,
		cls: 'grid',
		title: 'Velociraptor Owners',
		store: store,
		columns: [{
			dataIndex: 'id',
			width: 50,
			text: 'ID'
		}, {
			dataIndex: 'name',
			flex: 1,
			text: 'Name',
			//pt 2
			allowBlank: false,
			field: {
				type: 'textfield',
				allowBlank: false
			}
		}, {
			dataIndex: 'address',
			flex: 1.3,
			text: 'Address',
			//pt 2
			allowBlank: false,
			field: {
				type: 'textfield',
				allowBlank: false
			}
		}, {
			dataIndex: 'state',
			flex: 0.8,
			text: 'State',
			//pt 2
			allowBlank: false,
			field: {
				type: 'textfield',
				allowBlank: false,
				vtype: 'alphaSpace'
			}
		}],
		renderTo: Ext.getBody(),
		//pt 2
		plugins: [
			rowEditing
		],
		dockedItems: [{
			xtype: 'toolbar',
			store: store,
			dock: 'bottom',
			//creating, add items
			items: [{
				iconCls: 'add',
				text: 'Add',
				handler: function() {
					rowEditing.cancelEdit();
					// create a record
					var newRecord = Ext.create('PersonalInfo');
					store.insert(0, newRecord);
					rowEditing.startEdit(0, 0);
					
					// write about this section in tutorial
					var sm = grid.getSelectionModel();
					grid.on('edit', function() {
						var record = sm.getSelection()
						store.sync();
						store.remove(record);
						store.load();
					});
				}
			}, {
				iconCls: 'delete',
				text: 'Delete',
				handler: function() {
					rowEditing.cancelEdit();
					var sm = grid.getSelectionModel();
					Ext.Msg.show({
					     title:'Delete Record?',
					     msg: 'You are deleting a record permanently, this cannot be undone. Proceed?',
					     buttons: Ext.Msg.YESNO,
					     icon: Ext.Msg.QUESTION,
					     fn: function(btn){
					     	if(btn === 'yes') {
					     		store.remove(sm.getSelection());
					     		store.sync();
					     	}
					     }
					});
				}
			}]
		}]
	});
});