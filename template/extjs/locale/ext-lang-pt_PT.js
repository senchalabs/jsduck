/**
 * Portuguese/Portugal (pt_PT) Translation
 * by Nuno Franco da Costa - francodacosta.com
 * translated from ext-lang-en.js
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">A carregar...</div>';
    }

    Ext.define("Ext.locale.pt_PT.view.View", {
        override: "Ext.view.View",
        emptyText: ""
    });

    Ext.define("Ext.locale.pt_PT.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} linha(s) seleccionada(s)"
    });

    Ext.define("Ext.locale.pt_PT.TabPanelItem", {
        override: "Ext.TabPanelItem",
        closeText: "Fechar aba"
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.pt_PT.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "A carregar..."
    });

    if (Ext.Date) {
        Ext.Date.monthNames = ["Janeiro", "Fevereiro", "Mar&ccedil;o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

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

        Ext.Date.dayNames = ["Domingo", "Segunda", "Ter&ccedil;a", "Quarta", "Quinta", "Sexta", "Sabado"];

        Ext.Date.getShortDayName = function(day) {
            return Ext.Date.dayNames[day].substring(0, 3);
        };
    }

    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "OK",
            cancel: "Cancelar",
            yes: "Sim",
            no: "N&atilde;o"
        };
    }

    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',
            // Portugese Euro
            dateFormat: 'Y/m/d'
        });
    }

    Ext.define("Ext.locale.pt_PT.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "Hoje",
        minText: "A data &eacute; anterior ao m&iacute;nimo definido",
        maxText: "A data &eacute; posterior ao m&aacute;ximo definido",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'M&ecirc;s Seguinte (Control+Right)',
        prevText: 'M&ecirc;s Anterior (Control+Left)',
        monthYearText: 'Escolha um m&ecirc;s (Control+Up/Down ava&ccedil;ar/recuar anos)',
        todayTip: "{0} (barra de espa&ccedil;o)",
        format: "y/m/d",
        startDay: 0
    });

    Ext.define("Ext.locale.pt_PT.picker.Month", {
        override: "Ext.picker.Month",
        okText: "&#160;OK&#160;",
        cancelText: "Cancelar"
    });

    Ext.define("Ext.locale.pt_PT.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "P&aacute;gina",
        afterPageText: "de {0}",
        firstText: "Primeira P&aacute;gina",
        prevText: "P&aacute;gina Anterior",
        nextText: "Pr%oacute;xima P&aacute;gina",
        lastText: "&Uacute;ltima P&aacute;gina",
        refreshText: "Recaregar",
        displayMsg: "A mostrar {0} - {1} de {2}",
        emptyMsg: 'Sem dados para mostrar'
    });

    Ext.define("Ext.locale.pt_PT.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "O valor deste campo &eacute; inv&aacute;lido"
    });

    Ext.define("Ext.locale.pt_PT.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "O comprimento m&iacute;nimo deste campo &eaute; {0}",
        maxLengthText: "O comprimento m&aacute;ximo deste campo &eaute; {0}",
        blankText: "Este campo &eacute; de preenchimento obrigat&oacute;rio",
        regexText: "",
        emptyText: null
    });

    Ext.define("Ext.locale.pt_PT.form.field.Number", {
        override: "Ext.form.field.Number",
        minText: "O valor m&iacute;nimo deste campo &eaute; {0}",
        maxText: "O valor m&aacute;ximo deste campo &eaute; {0}",
        nanText: "{0} n&atilde;o &eacute; um numero"
    });

    Ext.define("Ext.locale.pt_PT.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "Desabilitado",
        disabledDatesText: "Desabilitado",
        minText: "A data deste campo deve ser posterior a {0}",
        maxText: "A data deste campo deve ser anterior a {0}",
        invalidText: "{0} n&atilde;o &eacute; uma data v&aacute;lida - deve estar no seguinte formato{1}",
        format: "y/m/d",
        altFormats: "m/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d"
    });

    Ext.define("Ext.locale.pt_PT.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        valueNotFoundText: undefined
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "A Carregar..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: 'Este campo deve ser um endere&ccedil;o de email no formato "utilizador@dominio.com"',
            urlText: 'Este campo deve ser um URL no formato "http:/' + '/www.dominio.com"',
            alphaText: 'Este campo deve conter apenas letras e _',
            alphanumText: 'Este campo deve conter apenas letras, n&uacute;meros e _'
        });
    }

    Ext.define("Ext.locale.pt_PT.form.field.HtmlEditor", {
        override: "Ext.form.field.HtmlEditor",
        createLinkText: 'Indique o endere&ccedil;o do link:'
    }, function() {
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            buttonTips: {
                bold: {
                    title: 'Negrito (Ctrl+B)',
                    text: 'Transforma o texto em Negrito.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic: {
                    title: 'It&aacute;lico (Ctrl+I)',
                    text: 'Transforma o texto em it&aacute;lico.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline: {
                    title: 'Sublinhar (Ctrl+U)',
                    text: 'Sublinha o texto.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize: {
                    title: 'Aumentar texto',
                    text: 'Aumenta o tamanho da fonte.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize: {
                    title: 'Encolher texto',
                    text: 'Diminui o tamanho da fonte.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor: {
                    title: 'C&ocirc;r de fundo do texto',
                    text: 'Altera a c&ocirc;r de fundo do texto.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor: {
                    title: 'C&ocirc;r do texo',
                    text: 'Altera a a&ocirc;r do texo.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft: {
                    title: 'ALinhar &agrave; esquerda',
                    text: 'ALinha o texto &agrave; esquerda.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter: {
                    title: 'Centrar',
                    text: 'Centra o texto.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright: {
                    title: 'ALinhar &agrave; direita',
                    text: 'ALinha o texto &agravce; direita.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist: {
                    title: 'Lista',
                    text: 'Inicia uma lista.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist: {
                    title: 'Lista Numerada',
                    text: 'Inicia uma lista numerada.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink: {
                    title: 'Hyperlink',
                    text: 'Transforma o texto num hyperlink.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit: {
                    title: 'Editar c&oacute;digo',
                    text: 'Alterar para o modo de edi&ccedil;&atilde;o de c&oacute;digo.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    });

    Ext.define("Ext.locale.pt_PT.form.Basic", {
        override: "Ext.form.Basic",
        waitTitle: "Por favor espere..."
    });

    Ext.define("Ext.locale.pt_PT.grid.header.Container", {
        override: "Ext.grid.header.Container",
        sortAscText: "Ordena&ccedil;&atilde;o Crescente",
        sortDescText: "Ordena&ccedil;&atilde;o Decrescente",
        lockText: "Fixar Coluna",
        unlockText: "Libertar Coluna",
        columnsText: "Colunas"
    });

    Ext.define("Ext.locale.pt_PT.grid.GroupingFeature", {
        override: "Ext.grid.GroupingFeature",
        emptyGroupText: '(Nenhum)',
        groupByText: 'Agrupar por este campo',
        showGroupsText: 'Mostrar nos Grupos'
    });

    Ext.define("Ext.locale.pt_PT.grid.PropertyColumnModel", {
        override: "Ext.grid.PropertyColumnModel",
        nameText: "Nome",
        valueText: "Valor",
        dateFormat: "Y/j/m"
    });

});
