SimpleTasksSettings = {
    // This property is used to turn on local storage.  If set to false the php backend will be used.
    useLocalStorage: true
};

if (SimpleTasksSettings.useLocalStorage && !window.localStorage) {
    alert('Simple Tasks is configured to use HTML5 Local Storage, but your browser does not support Local Storage');
} else {
    Ext.Loader.setPath('Ext.ux', '../ux/')
    Ext.Loader.setConfig({
        enabled: true
    });
    Ext.application({
        name: 'SimpleTasks',
        autoCreateViewport: true,
        controllers: ['Lists', 'Tasks']
    });
}
