/**
 * Catalonian Translation by halkon_polako 6-12-2007
 * December correction halkon_polako 11-12-2007
 *
 * Synchronized with 2.2 version of ext-lang-en.js (provided by Condor 8 aug 2008)
 *     by halkon_polako 14-aug-2008
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Carregant...</div>';
    }

    Ext.define("Ext.locale.ca.view.View", {
        override: "Ext.view.View",
        emptyText: ""
    });

    Ext.define("Ext.locale.ca.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} fila(es) seleccionada(es)"
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.ca.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "Carregant..."
    });

    if (Ext.Date) {
        Ext.Date.monthNames = ["Gener", "Febrer", "Mar&#231;", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];

        Ext.Date.getShortMonthName = function(month) {
            return Ext.Date.monthNames[month].substring(0, 3);
        };

        Ext.Date.monthNumbers = {
            Gen: 0,
            Feb: 1,
            Mar: 2,
            Abr: 3,
            Mai: 4,
            Jun: 5,
            Jul: 6,
            Ago: 7,
            Set: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11
        };

        Ext.Date.getMonthNumber = function(name) {
            return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        };

        Ext.Date.dayNames = ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"];

        Ext.Date.getShortDayName = function(day) {
            return Ext.Date.dayNames[day].substring(0, 3);
        };

        Ext.Date.parseCodes.S.s = "(?:st|nd|rd|th)";
    }
    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "Acceptar",
            cancel: "Cancel&#183;lar",
            yes: "S&#237;",
            no: "No"
        };
    }

    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',
            // Spanish Euro
            dateFormat: 'd/m/Y'
        });
    }

    Ext.define("Ext.locale.ca.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "Avui",
        minText: "Aquesta data &#233;s anterior a la data m&#237;nima",
        maxText: "Aquesta data &#233;s posterior a la data m&#224;xima",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Mes Seg&#252;ent (Control+Fletxa Dreta)',
        prevText: 'Mes Anterior (Control+Fletxa Esquerra)',
        monthYearText: 'Seleccioni un mes (Control+Fletxa a Dalt o Abaix per canviar els anys)',
        todayTip: "{0} (Barra d&#39;espai)",
        format: "d/m/Y",
        startDay: 1
    });

    Ext.define("Ext.locale.ca.picker.Month", {
        override: "Ext.picker.Month",
        okText: "&#160;Acceptar&#160;",
        cancelText: "Cancel&#183;lar"
    });

    Ext.define("Ext.locale.ca.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "P&#224;gina",
        afterPageText: "de {0}",
        firstText: "Primera P&#224;gina",
        prevText: "P&#224;gina Anterior",
        nextText: "P&#224;gina Seg&#252;ent",
        lastText: "Darrera P&#224;gina",
        refreshText: "Refrescar",
        displayMsg: "Mostrant {0} - {1} de {2}",
        emptyMsg: 'Sense dades per mostrar'
    });

    Ext.define("Ext.locale.ca.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "El valor d&#39;aquest camp &#233;s inv&#224;lid"
    });

    Ext.define("Ext.locale.ca.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "El tamany m&#237;nim per aquest camp &#233;s {0}",
        maxLengthText: "El tamany m&#224;xim per aquest camp &#233;s {0}",
        blankText: "Aquest camp &#233;s obligatori",
        regexText: "",
        emptyText: null
    });

    Ext.define("Ext.locale.ca.form.field.Number", {
        override: "Ext.form.field.Number",
        decimalSeparator: ",",
        decimalPrecision: 2,
        minText: "El valor m&#237;nim per aquest camp &#233;s {0}",
        maxText: "El valor m&#224;xim per aquest camp &#233;s {0}",
        nanText: "{0} no &#233;s un nombre v&#224;lid"
    });

    Ext.define("Ext.locale.ca.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "Deshabilitat",
        disabledDatesText: "Deshabilitat",
        minText: "La data en aquest camp ha de ser posterior a {0}",
        maxText: "La data en aquest camp ha de ser inferior a {0}",
        invalidText: "{0} no &#233;s una data v&#224;lida - ha de tenir el format {1}",
        format: "d/m/Y",
        altFormats: "d/m/Y|d-m-y|d-m-Y|d/m|d-m|dm|dmy|dmY|d|Y-m-d"
    });

    Ext.define("Ext.locale.ca.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        valueNotFoundText: undefined
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "Carregant..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: 'Aquest camp ha de ser una adre&#231;a de e-mail amb el format "user@example.com"',
            urlText: 'Aquest camp ha de ser una URL amb el format "http:/' + '/www.example.com"',
            alphaText: 'Aquest camp nom&#233;s pot contenir lletres i _',
            alphanumText: 'Aquest camp nom&#233;s por contenir lletres, nombres i _'
        });
    }

    Ext.define("Ext.locale.ca.form.field.HtmlEditor", {
        override: "Ext.form.field.HtmlEditor",
        createLinkText: 'Si us plau, tecleixi la URL per l\'enlla&#231;:'
    }, function() {
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            buttonTips: {
                bold: {
                    title: 'Negreta (Ctrl+B)',
                    text: 'Posa el text seleccionat en negreta.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic: {
                    title: 'It&#224;lica (Ctrl+I)',
                    text: 'Posa el text seleccionat en it&#224;lica.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline: {
                    title: 'Subratllat (Ctrl+U)',
                    text: 'Subratlla el text seleccionat.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize: {
                    title: 'Augmentar Text',
                    text: 'Augmenta el tamany de la font de text.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize: {
                    title: 'Disminuir Text',
                    text: 'Disminueix el tamany de la font de text.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor: {
                    title: 'Color de fons',
                    text: 'Canvia el color de fons del text seleccionat.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor: {
                    title: 'Color de la font de text',
                    text: 'Canvia el color del text seleccionat.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft: {
                    title: 'Alinear a la esquerra',
                    text: 'Alinea el text a la esquerra.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter: {
                    title: 'Centrar el text',
                    text: 'Centra el text a l\'editor',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright: {
                    title: 'Alinear a la dreta',
                    text: 'Alinea el text a la dreta.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist: {
                    title: 'Llista amb vinyetes',
                    text: 'Comen&#231;a una llista amb vinyetes.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist: {
                    title: 'Llista numerada',
                    text: 'Comen&#231;a una llista numerada.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink: {
                    title: 'Enlla&#231;',
                    text: 'Transforma el text seleccionat en un enlla&#231;.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit: {
                    title: 'Editar Codi',
                    text: 'Canvia al mode d\'edici&#243; de codi.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    });

    Ext.define("Ext.locale.ca.grid.header.Container", {
        override: "Ext.grid.header.Container",
        sortAscText: "Ordenaci&#243; Ascendent",
        sortDescText: "Ordenaci&#243; Descendent",
        columnsText: "Columnes"
    });

    Ext.define("Ext.locale.ca.grid.GroupingFeature", {
        override: "Ext.grid.GroupingFeature",
        emptyGroupText: '(Buit)',
        groupByText: 'Agrupar Per Aquest Camp',
        showGroupsText: 'Mostrar en Grups'
    });

    Ext.define("Ext.locale.ca.grid.PropertyColumnModel", {
        override: "Ext.grid.PropertyColumnModel",
        nameText: "Nom",
        valueText: "Valor",
        dateFormat: "d/m/Y"
    });

    Ext.define("Ext.locale.ca.form.field.Time", {
        override: "Ext.form.field.Time",
        minText: "L\'hora en aquest camp ha de ser igual o posterior a {0}",
        maxText: "L\'hora en aquest camp ha de ser igual o anterior {0}",
        invalidText: "{0} no &#233;s un hora v&#224;lida",
        format: "g:i A",
        altFormats: "g:ia|g:iA|g:i a|g:i A|h:i|g:i|H:i|ga|ha|gA|h a|g a|g A|gi|hi|gia|hia|g|H"
    });

    Ext.define("Ext.locale.ca.form.CheckboxGroup", {
        override: "Ext.form.CheckboxGroup",
        blankText: "Ha de seleccionar almenys un &#233;tem d\'aquest group"
    });

    Ext.define("Ext.locale.ca.form.RadioGroup", {
        override: "Ext.form.RadioGroup",
        blankText: "Ha de seleccionar un &#233;tem d\'aquest grup"
    });
});
