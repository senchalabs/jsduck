/**
 * Serbian Latin Translation
 * by Atila Hajnal (latin, utf8 encoding)
 * sr
 * 14 Sep 2007
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Učitavam...</div>';
    }

    Ext.define("Ext.locale.sr.view.View", {
        override: "Ext.view.View",
        emptyText: "Ne postoji ni jedan slog"
    });

    Ext.define("Ext.locale.sr.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} izabranih redova"
    });

    Ext.define("Ext.locale.sr.TabPanelItem", {
        override: "Ext.TabPanelItem",
        closeText: "Zatvori оvu »karticu«"
    });

    Ext.define("Ext.locale.sr.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "Unešena vrednost nije pravilna"
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.sr.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "Učitavam..."
    });

    if (Ext.Date) {
        Ext.Date.monthNames = ["Januar", "Februar", "Mart", "April", "Мај", "Jun", "Јul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];

        Ext.Date.dayNames = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
    }

    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "U redu",
            cancel: "Odustani",
            yes: "Da",
            no: "Ne"
        };
    }

    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u0414\u0438\u043d\u002e',
            // Serbian Dinar
            dateFormat: 'd.m.Y'
        });
    }

    Ext.define("Ext.locale.sr.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "Danas",
        minText: "Datum је ispred najmanjeg dozvoljenog datuma",
        maxText: "Datum је nakon najvećeg dozvoljenog datuma",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Sledeći mesec (Control+Desno)',
        prevText: 'Prethodni mesec (Control+Levo)',
        monthYearText: 'Izaberite mesec (Control+Gore/Dole za izbor godine)',
        todayTip: "{0} (Razmaknica)",
        format: "d.m.y",
        startDay: 1
    });

    Ext.define("Ext.locale.sr.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "Strana",
        afterPageText: "od {0}",
        firstText: "Prva strana",
        prevText: "Prethodna strana",
        nextText: "Sledeća strana",
        lastText: "Poslednja strana",
        refreshText: "Osveži",
        displayMsg: "Prikazana {0} - {1} od {2}",
        emptyMsg: 'Nemam šta prikazati'
    });

    Ext.define("Ext.locale.sr.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "Minimalna dužina ovog polja је {0}",
        maxLengthText: "Maksimalna dužina ovog polja је {0}",
        blankText: "Polje је obavezno",
        regexText: "",
        emptyText: null
    });

    Ext.define("Ext.locale.sr.form.field.Number", {
        override: "Ext.form.field.Number",
        minText: "Minimalna vrednost u polju је {0}",
        maxText: "Maksimalna vrednost u polju је {0}",
        nanText: "{0} nije pravilan broj"
    });

    Ext.define("Ext.locale.sr.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "Pasivno",
        disabledDatesText: "Pasivno",
        minText: "Datum u ovom polju mora biti nakon {0}",
        maxText: "Datum u ovom polju mora biti pre {0}",
        invalidText: "{0} nije pravilan datum - zahtevani oblik je {1}",
        format: "d.m.y",
        altFormats: "d.m.y|d/m/Y|d-m-y|d-m-Y|d/m|d-m|dm|dmy|dmY|d|Y-m-d"
    });

    Ext.define("Ext.locale.sr.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        valueNotFoundText: undefined
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "Učitavam..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: 'Ovo polje prihavata e-mail adresu isključivo u obliku "korisnik@domen.com"',
            urlText: 'Ovo polje prihavata URL adresu isključivo u obliku "http:/' + '/www.domen.com"',
            alphaText: 'Ovo polje može sadržati isključivo slova i znak _',
            alphanumText: 'Ovo polje može sadržati само slova, brojeve i znak _'
        });
    }

    Ext.define("Ext.locale.sr.grid.header.Container", {
        override: "Ext.grid.header.Container",
        sortAscText: "Rastući redosled",
        sortDescText: "Opadajući redosled",
        lockText: "Zaključaj kolonu",
        unlockText: "Otključaj kolonu",
        columnsText: "Kolone"
    });

    Ext.define("Ext.locale.sr.grid.PropertyColumnModel", {
        override: "Ext.grid.PropertyColumnModel",
        nameText: "Naziv",
        valueText: "Vrednost",
        dateFormat: "d.m.Y"
    });

});
