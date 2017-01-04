/**
 * Estonian Translations
 * By Rene Saarsoo (2012-05-28)
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Laen...</div>';
    }

    Ext.define("Ext.locale.et.view.View", {
        override: "Ext.view.View",
        emptyText: ""
    });

    Ext.define("Ext.locale.et.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} valitud rida"
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.et.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "Laen..."
    });

    if (Ext.Date) {
        Ext.Date.monthNames = ["Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"];

        // Month names aren't shortened to strictly three letters
        var shortMonthNames = ["Jaan", "Veeb", "Märts", "Apr", "Mai", "Juuni", "Juuli", "Aug", "Sept", "Okt", "Nov", "Dets"];
        Ext.Date.getShortMonthName = function(month) {
            return shortMonthNames[month];
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

        Ext.Date.dayNames = ["Pühapäev", "Esmaspäev", "Teisipäev", "Kolmapäev", "Neljapäev", "Reede", "Laupäev"];

        // Weekday names are abbreviated to single letter
        Ext.Date.getShortDayName = function(day) {
            return Ext.Date.dayNames[day].substring(0, 1);
        };
    }

    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "OK",
            cancel: "Katkesta",
            yes: "Jah",
            no: "Ei"
        };
    }

    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: ' ',
            decimalSeparator: ',',
            currencySign: '\u20ac', // Euro
            dateFormat: 'd.m.Y'
        });
    }

    Ext.define("Ext.locale.et.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "Täna",
        minText: "See kuupäev on enne määratud vanimat kuupäeva",
        maxText: "See kuupäev on pärast määratud hiliseimat kuupäeva",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Järgmine kuu (Ctrl+Paremale)',
        prevText: 'Eelmine kuu (Ctrl+Vasakule)',
        monthYearText: 'Vali kuu (Ctrl+Üles/Alla aastate muutmiseks)',
        todayTip: "{0} (Tühik)",
        format: "d.m.Y",
        startDay: 1
    });

    Ext.define("Ext.locale.et.picker.Month", {
        override: "Ext.picker.Month",
        okText: "&#160;OK&#160;",
        cancelText: "Katkesta"
    });

    Ext.define("Ext.locale.et.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "Lehekülg",
        afterPageText: "{0}-st",
        firstText: "Esimene lk",
        prevText: "Eelmine lk",
        nextText: "Järgmine lk",
        lastText: "Viimane lk",
        refreshText: "Värskenda",
        displayMsg: "Näitan {0} - {1} {2}-st",
        emptyMsg: 'Puuduvad andmed mida näidata'
    });

    Ext.define("Ext.locale.et.form.Basic", {
        override: "Ext.form.Basic",
        waitTitle: "Palun oota..."
    });

    Ext.define("Ext.locale.et.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "Välja sisu ei vasta nõuetele"
    });

    Ext.define("Ext.locale.et.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "Selle välja minimaalne pikkus on {0}",
        maxLengthText: "Selle välja maksimaalne pikkus on {0}",
        blankText: "Selle välja täitmine on nõutud",
        regexText: "",
        emptyText: null
    });

    Ext.define("Ext.locale.et.form.field.Number", {
        override: "Ext.form.field.Number",
        minText: "Selle välja vähim väärtus võib olla {0}",
        maxText: "Selle välja suurim väärtus võib olla {0}",
        nanText: "{0} pole korrektne number"
    });

    Ext.define("Ext.locale.et.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "Võimetustatud",
        disabledDatesText: "Võimetustatud",
        minText: "Kuupäev peab olema alates kuupäevast: {0}",
        maxText: "Kuupäev peab olema kuni kuupäevani: {0}",
        invalidText: "{0} ei ole sobiv kuupäev - õige formaat on: {1}",
        format: "d.m.Y"
    });

    Ext.define("Ext.locale.et.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        valueNotFoundText: undefined
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "Laen..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: 'Selle välja sisuks peab olema e-posti aadress kujul "kasutaja@domeen.com"',
            urlText: 'Selle välja sisuks peab olema veebiaadress kujul "http:/'+'/www.domeen.com"',
            alphaText: 'See väli võib sisaldada vaid tähemärke ja alakriipsu',
            alphanumText: 'See väli võib sisaldada vaid tähemärke, numbreid ja alakriipsu'
        });
    }

    Ext.define("Ext.locale.et.form.field.HtmlEditor", {
        override: "Ext.form.field.HtmlEditor",
        createLinkText: 'Palun sisestage selle lingi internetiaadress:'
    }, function() {
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            buttonTips: {
                bold: {
                    title: 'Rasvane kiri (Ctrl+B)',
                    text: 'Muuda valitud tekst rasvaseks.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic: {
                    title: 'Kursiiv (Ctrl+I)',
                    text: 'Pane valitud tekst kaldkirja.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline: {
                    title: 'Allakriipsutus (Ctrl+U)',
                    text: 'Jooni valitud tekst alla.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize: {
                    title: 'Suurenda',
                    text: 'Suurenda teksti suurust.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize: {
                    title: 'Vähenda',
                    text: 'Vähenda teksti suurust.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor: {
                    title: 'Tausta värv',
                    text: 'Muuda valitud teksti taustavärvi.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor: {
                    title: 'Teksti värv',
                    text: 'Muuda valitud teksti värvi.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft: {
                    title: 'Vasakule',
                    text: 'Joonda tekst vasakule.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter: {
                    title: 'Keskele',
                    text: 'Joonda tekst keskele.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright: {
                    title: 'Paremale',
                    text: 'Joonda tekst paremale.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist: {
                    title: 'Loetelu',
                    text: 'Alusta loetelu.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist: {
                    title: 'Numereeritud list',
                    text: 'Alusta numereeritud nimekirja.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink: {
                    title: 'Link',
                    text: 'Muuda tekst lingiks.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit: {
                    title: 'Lähtekoodi muutmine',
                    text: 'Lülitu lähtekoodi muutmise režiimi.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    });

    Ext.define("Ext.locale.et.grid.header.Container", {
        override: "Ext.grid.header.Container",
        sortAscText: "Järjesta kasvavalt",
        sortDescText: "Järjesta kahanevalt",
        columnsText: "Tulbad"
    });

    Ext.define("Ext.locale.et.grid.feature.Grouping", {
        override: "Ext.grid.feature.Grouping",
        emptyGroupText: '(Tühi)',
        groupByText: 'Grupeeri selle välja järgi',
        showGroupsText: 'Näita gruppides'
    });

    Ext.define("Ext.locale.et.grid.property.HeaderContainer", {
        override: "Ext.grid.property.HeaderContainer",
        nameText: "Nimi",
        valueText: "Väärtus",
        dateFormat: "d.m.Y"
    });

    Ext.define("Ext.locale.et.grid.column.Date", {
        override: "Ext.grid.column.Date",
        format: 'd.m.Y'
    });

    Ext.define("Ext.locale.et.form.field.Time", {
        override: "Ext.form.field.Time",
        minText: "Kellaaeg peab olema alates {0}",
        maxText: "Kellaaeg peab olema kuni {0}",
        invalidText: "{0} ei ole sobiv kellaaeg",
        format: "H:i"
    });

    Ext.define("Ext.locale.et.form.CheckboxGroup", {
        override: "Ext.form.CheckboxGroup",
        blankText: "Vähemalt üks väli selles grupis peab olema valitud"
    });

    Ext.define("Ext.locale.et.form.RadioGroup", {
        override: "Ext.form.RadioGroup",
        blankText: "Vähemalt üks väli selles grupis peab olema valitud"
    });
});
