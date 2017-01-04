/**
 * Greek (Old Version) Translations by Vagelis
 * 03-June-2007
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Öüñôùóç...</div>';
    }

    Ext.define("Ext.locale.gr.view.View", {
        override: "Ext.view.View",
        emptyText: ""
    });

    Ext.define("Ext.locale.gr.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} åðéëåãìÝíç(åò) ãñáììÞ(Ýò)"
    });

    Ext.define("Ext.locale.gr.TabPanelItem", {
        override: "Ext.TabPanelItem",
        closeText: "Êëåßóôå áõôÞ ôçí êáñôÝëá"
    });

    Ext.define("Ext.locale.gr.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "Ç ôéìÞ óôï ðåäßï äåí åßíáé Ýãêõñç"
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.gr.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "Öüñôùóç..."
    });

    if (Ext.Date) {
        Ext.Date.monthNames = ["ÉáíïõÜñéïò", "ÖåâñïõÜñéïò", "ÌÜñôéïò", "Áðñßëéïò", "ÌÜéïò", "Éïýíéïò", "Éïýëéïò", "Áýãïõóôïò", "ÓåðôÝìâñéïò", "Ïêôþâñéïò", "ÍïÝìâñéïò", "ÄåêÝìâñéïò"];

        Ext.Date.dayNames = ["ÊõñéáêÞ", "ÄåõôÝñá", "Ôñßôç", "ÔåôÜñôç", "ÐÝìðôç", "ÐáñáóêåõÞ", "ÓÜââáôï"];
    }

    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "ÅíôÜîåé",
            cancel: "Áêýñùóç",
            yes: "Íáé",
            no: "¼÷é"
        };
    }

    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',
            // Greek Euro
            dateFormat: 'ì/ç/Å'
        });
    }

    Ext.define("Ext.locale.gr.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "ÓÞìåñá",
        minText: "Ç çìåñïìçíßá áõôÞ åßíáé ðñéí ôçí ìéêñüôåñç çìåñïìçíßá",
        maxText: "Ç çìåñïìçíßá áõôÞ åßíáé ìåôÜ ôçí ìåãáëýôåñç çìåñïìçíßá",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Åðüìåíïò ÌÞíáò (Control+Right)',
        prevText: 'Ðñïçãïýìåíïò ÌÞíáò (Control+Left)',
        monthYearText: 'ÅðéëÝîôå ÌÞíá (Control+Up/Down ãéá ìåôáêßíçóç óôá Ýôç)',
        todayTip: "{0} (Spacebar)",
        format: "ì/ç/Å"
    });

    Ext.define("Ext.locale.gr.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "Óåëßäá",
        afterPageText: "áðü {0}",
        firstText: "Ðñþôç óåëßäá",
        prevText: "Ðñïçãïýìåíç óåëßäá",
        nextText: "Åðüìåíç óåëßäá",
        lastText: "Ôåëåõôáßá óåëßäá",
        refreshText: "ÁíáíÝùóç",
        displayMsg: "ÅìöÜíéóç {0} - {1} áðü {2}",
        emptyMsg: 'Äåí âñÝèçêáí åããñáöÝò ãéá åìöÜíéóç'
    });

    Ext.define("Ext.locale.gr.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "Ôï åëÜ÷éóôï ìÝãåèïò ãéá áõôü ôï ðåäßï åßíáé {0}",
        maxLengthText: "Ôï ìÝãéóôï ìÝãåèïò ãéá áõôü ôï ðåäßï åßíáé {0}",
        blankText: "Ôï ðåäßï áõôü åßíáé õðï÷ñåùôïêü",
        regexText: "",
        emptyText: null
    });

    Ext.define("Ext.locale.gr.form.field.Number", {
        override: "Ext.form.field.Number",
        minText: "Ç åëÜ÷éóôç ôéìÞ ãéá áõôü ôï ðåäßï åßíáé {0}",
        maxText: "Ç ìÝãéóôç ôéìÞ ãéá áõôü ôï ðåäßï åßíáé {0}",
        nanText: "{0} äåí åßíáé Ýãêõñïò áñéèìüò"
    });

    Ext.define("Ext.locale.gr.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "ÁðåíåñãïðïéçìÝíï",
        disabledDatesText: "ÁðåíåñãïðïéçìÝíï",
        minText: "Ç çìåñïìçíßá ó' áõôü ôï ðåäßï ðñÝðåé íá åßíáé ìåôÜ áðü {0}",
        maxText: "Ç çìåñïìçíßá ó' áõôü ôï ðåäßï ðñÝðåé íá åßíáé ðñéí áðü {0}",
        invalidText: "{0} äåí åßíáé Ýãêõñç çìåñïìçíßá - ðñÝðåé íá åßíáé ôçò ìïñöÞò {1}",
        format: "ì/ç/Å"
    });

    Ext.define("Ext.locale.gr.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        valueNotFoundText: undefined
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "Öüñôùóç..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: 'Áõôü ôï ðåäßï ðñÝðåé íá åßíáé e-mail address ôçò ìïñöÞò "user@example.com"',
            urlText: 'Áõôü ôï ðåäßï ðñÝðåé íá åßíáé ìéá äéåýèõíóç URL ôçò ìïñöÞò "http:/' + '/www.example.com"',
            alphaText: 'Áõôü ôï ðåäßï ðñÝðåé íá ðåñéÝ÷åé ãñÜììáôá êáé _',
            alphanumText: 'Áõôü ôï ðåäßï ðñÝðåé íá ðåñéÝ÷åé ãñÜììáôá, áñéèìïýò êáé _'
        });
    }

    Ext.define("Ext.locale.gr.grid.header.Container", {
        override: "Ext.grid.header.Container",
        sortAscText: "Áýîïõóá Ôáîéíüìçóç",
        sortDescText: "Öèßíïõóá Ôáîéíüìçóç",
        lockText: "Êëåßäùìá óôÞëçò",
        unlockText: "Îåêëåßäùìá óôÞëçò",
        columnsText: "ÓôÞëåò"
    });

    Ext.define("Ext.locale.gr.grid.PropertyColumnModel", {
        override: "Ext.grid.PropertyColumnModel",
        nameText: "¼íïìá",
        valueText: "ÔéìÞ",
        dateFormat: "ì/ç/Å"
    });

});
