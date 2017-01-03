# Localization in Ext JS
______________________________________________

Communicating with users in a language that they understand and with
conventions that they're used to is vital.  Ext JS comes bundled with
localization files for over 40 languages ranging from Indonesian to
Macedonian, and it's dead-easy to set up.

## Ext's Localization Files

In the root directory of your copy of Ext JS there is a folder called
`locale`. This contains all the bundled translations of Ext JS
framework. You can inspect the contents of each to see exactly what
they contain. Here's an excerpt from the Spanish localization file:

    Ext.define("Ext.locale.es.form.field.Number", {
        override: "Ext.form.field.Number",
        decimalSeparator: ",",
        decimalPrecision: 2,
        minText: "El valor mínimo para este campo es de {0}",
        maxText: "El valor máximo para este campo es de {0}",
        nanText: "{0} no es un número válido"
    });

You can see that it applies an override to {@link
Ext.form.field.Number} which applies the Spanish strings to error
messages and specifies Spanish decimal separator. Using an override
ensures that these properties will be overridden in class prototype
right after the class itself is loaded.

## Utilizing Localization

The simplest way to localize Ext JS is to just stick an additional
`<script>` tag to your HTML:

    <!DOCTYPE html>
    <html>
    <head>
        <!-- Ensure we're using UTF-8 -->
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Localization example</title>
        <!-- Main Ext JS files -->
        <link rel="stylesheet" type="text/css" href="extjs/resources/css/ext-all.css">
        <script type="text/javascript" src="extjs/ext-debug.js"></script>
        <!-- Include the translations -->
        <script type="text/javascript" src="extjs/locale/ext-lang-es.js"></script>

        <script type="text/javascript" src="app.js"></script>
    </head>
    <body>

    </body>
    </html>

Switching between different languages can be accomplished by server
side code that generates an appropriate `<script>` tag based on the
currently selected locale.

And before you even ask for it - you really should refresh the entire
page when switching locales.  Ext JS does not support changing the
locale on the fly (like updating the texts inside already rendered
components).

## Internationalizing your Ext JS extensions

When you write a custom component or plugin to Ext JS and want to
share it with a world take a moment to ensure it follows Ext JS
practices for localization.  At very minimum every text string that's
shown to user should be defined as a property:

    Ext.define("Ext.ux.Weather, {
        sunText: "It's a nice sunny day",
        rainText: "Bad weather, don't go out",
        // ...other code...
    });

Also watch out when you're dealing with dates - every language tends
to have it's own way of writing them.  So when your extension renders
a date, provide a config option to specify the format.

This way users of your extension can easily override the
locale-specific parts.

But even better is to build your extension so that it doesn't need any
additional localization at all.  Make use of the messages already
translated in Ext JS itself (e.g. use `Ext.MessageBox.buttonText.ok`
when rendering "OK" button).  Default to the default date format when
rendering dates (`Ext.util.Format.dateFormat`).

## Localizing your own app

Ext JS doesn't enforce any particular approach to localization.  It's
only the framework itself that uses the approach outlined here.  Feel
free to localize your app in whichever way feels best for you.

If you're unsure you can use the same approach that Ext JS uses or you
could give a try to good-old GNU Gettext.
