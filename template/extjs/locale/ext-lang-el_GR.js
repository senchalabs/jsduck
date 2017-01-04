/**
 * Greek translation
 * By thesilentman (utf8 encoding)
 * 27 Apr 2008
 *
 * Changes since previous (second) Version:
 * + added Ext.Date.shortMonthNames
 * + added Ext.Date.getShortMonthName
 * + added Ext.Date.monthNumbers
 * + added Ext.grid.GroupingFeature
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Μεταφόρτωση δεδομένων...</div>';
    }


    Ext.define("Ext.locale.el_GR.view.View", {
        override: "Ext.view.View",
        emptyText: ""
    });

    Ext.define("Ext.locale.el_GR.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} Επιλεγμένες σειρές"
    });

    Ext.define("Ext.locale.el_GR.TabPanelItem", {
        override: "Ext.TabPanelItem",
        closeText: "Κλείστε το tab"
    });

    Ext.define("Ext.locale.el_GR.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "Το περιεχόμενο του πεδίου δεν είναι αποδεκτό"
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.el_GR.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "Μεταφόρτωση δεδομένων..."
    });

    if (Ext.Date) {
        Ext.Date.monthNames = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];

        Ext.Date.shortMonthNames = ["Ιαν", "Φεβ", "Μάρ", "Απρ", "Μάι", "Ιού", "Ιού", "Αύγ", "Σεπ", "Οκτ", "Νοέ", "Δεκ"];

        Ext.Date.getShortMonthName = function(month) {
            return Ext.Date.monthNames[month].substring(0, 3);
        };

        Ext.Date.monthNumbers = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11
        };

        Ext.Date.getMonthNumber = function(name) {
            return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        };

        Ext.Date.dayNames = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
    }

    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "OK",
            cancel: "Άκυρο",
            yes: "Ναι",
            no: "Όχι"
        };
    }

    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',
            // Greek Euro
            dateFormat: 'd/m/Y'
        });
    }

    Ext.define("Ext.locale.el_GR.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "Σήμερα",
        minText: "Η Ημερομηνία είναι προγενέστερη από την παλαιότερη αποδεκτή",
        maxText: "Η Ημερομηνία είναι μεταγενέστερη από την νεότερη αποδεκτή",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Επόμενος Μήνας (Control+Δεξί Βέλος)',
        prevText: 'Προηγούμενος Μήνας (Control + Αριστερό Βέλος)',
        monthYearText: 'Επιλογή Μηνός (Control + Επάνω/Κάτω Βέλος για μεταβολή ετών)',
        todayTip: "{0} (ΠΛήκτρο Διαστήματος)",
        format: "d/m/y"
    });

    Ext.define("Ext.locale.el_GR.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "Σελίδα",
        afterPageText: "από {0}",
        firstText: "Πρώτη Σελίδα",
        prevText: "Προηγούμενη Σελίδα",
        nextText: "Επόμενη Σελίδα",
        lastText: "Τελευταία Σελίδα",
        refreshText: "Ανανέωση",
        displayMsg: "Εμφάνιση {0} - {1} από {2}",
        emptyMsg: 'Δεν υπάρχουν δεδομένα'
    });

    Ext.define("Ext.locale.el_GR.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "Το μικρότερο αποδεκτό μήκος για το πεδίο είναι {0}",
        maxLengthText: "Το μεγαλύτερο αποδεκτό μήκος για το πεδίο είναι {0}",
        blankText: "Το πεδίο είναι υποχρεωτικό",
        regexText: "",
        emptyText: null
    });

    Ext.define("Ext.locale.el_GR.form.field.Number", {
        override: "Ext.form.field.Number",
        minText: "Η μικρότερη τιμή του πεδίου είναι {0}",
        maxText: "Η μεγαλύτερη τιμή του πεδίου είναι {0}",
        nanText: "{0} δεν είναι αποδεκτός αριθμός"
    });

    Ext.define("Ext.locale.el_GR.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "Ανενεργό",
        disabledDatesText: "Ανενεργό",
        minText: "Η ημερομηνία αυτού του πεδίου πρέπει να είναι μετά την {0}",
        maxText: "Η ημερομηνία αυτού του πεδίου πρέπει να είναι πριν την {0}",
        invalidText: "{0} δεν είναι έγκυρη ημερομηνία - πρέπει να είναι στη μορφή {1}",
        format: "d/m/y"
    });

    Ext.define("Ext.locale.el_GR.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        valueNotFoundText: undefined
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "Μεταφόρτωση δεδομένων..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: 'Το πεδίο δέχεται μόνο διευθύνσεις Email σε μορφή "user@example.com"',
            urlText: 'Το πεδίο δέχεται μόνο URL σε μορφή "http:/' + '/www.example.com"',
            alphaText: 'Το πεδίο δέχεται μόνο χαρακτήρες και _',
            alphanumText: 'Το πεδίο δέχεται μόνο χαρακτήρες, αριθμούς και _'
        });
    }

    Ext.define("Ext.locale.el_GR.form.field.HtmlEditor", {
        override: "Ext.form.field.HtmlEditor",
        createLinkText: 'Δώστε τη διεύθυνση (URL) για το σύνδεσμο (link):'
    }, function() {
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            buttonTips: {
                bold: {
                    title: 'Έντονα (Ctrl+B)',
                    text: 'Κάνετε το προεπιλεγμένο κείμενο έντονο.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic: {
                    title: 'Πλάγια (Ctrl+I)',
                    text: 'Κάνετε το προεπιλεγμένο κείμενο πλάγιο.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline: {
                    title: 'Υπογράμμιση (Ctrl+U)',
                    text: 'Υπογραμμίζετε το προεπιλεγμένο κείμενο.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize: {
                    title: 'Μεγέθυνση κειμένου',
                    text: 'Μεγαλώνετε τη γραμματοσειρά.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize: {
                    title: 'Σμίκρυνση κειμένου',
                    text: 'Μικραίνετε τη γραμματοσειρά.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor: {
                    title: 'Χρώμα Φόντου Κειμένου',
                    text: 'Αλλάζετε το χρώμα στο φόντο του προεπιλεγμένου κειμένου.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor: {
                    title: 'Χρώμα Γραμματοσειράς',
                    text: 'Αλλάζετε το χρώμα στη γραμματοσειρά του προεπιλεγμένου κειμένου.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft: {
                    title: 'Αριστερή Στοίχιση Κειμένου',
                    text: 'Στοιχίζετε το κείμενο στα αριστερά.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter: {
                    title: 'Κεντράρισμα Κειμένου',
                    text: 'Στοιχίζετε το κείμενο στο κέντρο.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright: {
                    title: 'Δεξιά Στοίχιση Κειμένου',
                    text: 'Στοιχίζετε το κείμενο στα δεξιά.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist: {
                    title: 'Εισαγωγή Λίστας Κουκίδων',
                    text: 'Ξεκινήστε μια λίστα με κουκίδες.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist: {
                    title: 'Εισαγωγή Λίστας Αρίθμησης',
                    text: 'Ξεκινήστε μια λίστα με αρίθμηση.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink: {
                    title: 'Hyperlink',
                    text: 'Μετατρέπετε το προεπιλεγμένο κείμενο σε Link.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit: {
                    title: 'Επεξεργασία Κώδικα',
                    text: 'Μεταβαίνετε στη λειτουργία επεξεργασίας κώδικα.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    });

    Ext.define("Ext.locale.el_GR.grid.header.Container", {
        override: "Ext.grid.header.Container",
        sortAscText: "Αύξουσα ταξινόμηση",
        sortDescText: "Φθίνουσα ταξινόμηση",
        lockText: "Κλείδωμα στήλης",
        unlockText: "Ξεκλείδωμα στήλης",
        columnsText: "Στήλες"
    });

    Ext.define("Ext.locale.el_GR.grid.GroupingFeature", {
        override: "Ext.grid.GroupingFeature",
        emptyGroupText: '(Καμμία)',
        groupByText: 'Ομαδοποίηση βάσει αυτού του πεδίου',
        showGroupsText: 'Να εμφανίζεται στις ομάδες'
    });

    Ext.define("Ext.locale.el_GR.grid.PropertyColumnModel", {
        override: "Ext.grid.PropertyColumnModel",
        nameText: "Όνομα",
        valueText: "Περιεχόμενο",
        dateFormat: "d/m/Y"
    });

});
