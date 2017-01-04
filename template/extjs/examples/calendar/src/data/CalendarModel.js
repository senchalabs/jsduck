Ext.define('Ext.calendar.data.CalendarModel', {
    extend: 'Ext.data.Model',
    
    requires: [
        'Ext.util.MixedCollection',
        'Ext.calendar.data.CalendarMappings'
    ],
    
    statics: {
        /**
         * Reconfigures the default record definition based on the current {@link Ext.calendar.data.CalendarMappings CalendarMappings}
         * object. See the header documentation for {@link Ext.calendar.data.CalendarMappings} for complete details and 
         * examples of reconfiguring a CalendarRecord.
         * @method create
         * @static
         * @return {Function} The updated CalendarRecord constructor function
         */
        reconfigure: function(){
            var Data = Ext.calendar.data,
                Mappings = Data.CalendarMappings,
                proto = Data.CalendarModel.prototype,
                fields = [];
            
            // It is critical that the id property mapping is updated in case it changed, since it
            // is used elsewhere in the data package to match records on CRUD actions:
            proto.idProperty = Mappings.CalendarId.name || 'id';
            
            for(prop in Mappings){
                if(Mappings.hasOwnProperty(prop)){
                    fields.push(Mappings[prop]);
                }
            }
            proto.fields.clear();
            for(var i = 0, len = fields.length; i < len; i++){
                proto.fields.add(Ext.create('Ext.data.Field', fields[i]));
            }
            return Data.CalendarModel;
        }
    }
},
function() {
    Ext.calendar.data.CalendarModel.reconfigure();
});