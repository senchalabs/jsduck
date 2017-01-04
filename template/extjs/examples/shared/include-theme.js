(function() {
    var url = getUrl(),
        thisDir = getDir(url),
        params = getMergedQueryParams(url),
        theme = getTheme(params),
        css = getCss(theme),
        js = getJs(theme);

    document.write(Ext.String.format('<link rel="stylesheet" type="text/css" href="{0}/../../resources/css/ext-{1}.css" />', thisDir, css));

    if (js) {
        document.write(Ext.String.format('<script type="text/javascript" src="{0}/../../ext-{1}.js"></script>', thisDir, js));
    }

    if (params.themes_combo != null) {
        Ext.require('Ext.panel.Panel');
        Ext.require('Ext.data.ArrayStore');
        Ext.require('Ext.form.field.ComboBox');

        Ext.onReady(function() {
            Ext.create('Ext.panel.Panel', {
                autoShow: true,
                frame: true,
                renderTo: Ext.getBody(),
                items: {
                    editable: false,
                    fieldLabel: 'Theme',
                    labelWidth: 50,
                    value: theme,
                    width: 180,
                    xtype: 'combo',
                    listeners: {
                        change: function(combo, value) {
                            params.theme = value;

                            location.search = Ext.Object.toQueryString(params);
                        }
                    },
                    store: [
                        ['classic', 'Classic'],
                        ['gray', 'Gray'],
                        ['access', 'Accessibility'],
                        ['neptune', 'Neptune']
                    ],
                    style: {
                        margin: '2px'
                    }
                },
                style: {
                    position: 'absolute',
                    right: '10px',
                    top: '10px'
                }
            });
        });
    }

    // Extract the URL used to load this script file
    function getUrl() {
        var scripts = document.getElementsByTagName('script'),
            thisScript = scripts[scripts.length - 1];

        return thisScript.src;
    }

    // The directory of this script file
    function getDir(url) {
        return url.slice(0, url.lastIndexOf('/'));
    }

    // Combines the query parameters from the page URL and the script URL
    function getMergedQueryParams(url) {
        var searchIndex = url.indexOf('?'),
            parse = Ext.Object.fromQueryString;

        return Ext.apply(searchIndex === -1 ? {} : parse(url.slice(searchIndex)), parse(location.search));
    }

    // Get the canonical theme name from the query parameters
    function getTheme(params) {
        return {
            access: 'access',
            accessibility: 'access',
            gray: 'gray',
            grey: 'gray',
            neptune: 'neptune'
        }[params.theme || params.css] || 'classic';
    }

    // Get the CSS file name from the theme name
    function getCss(theme) {
        return {
            access: 'all-access',
            classic: 'all',
            gray: 'all-gray',
            neptune: 'neptune'
        }[theme];
    }

    // Get the JS file name from the theme name
    function getJs(theme) {
        return {
            neptune: 'neptune'
        }[theme];
    }
})();