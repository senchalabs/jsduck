/**
 * Farsi (Persian) translation
 * By Mohaqa
 * 03-10-2007, 06:23 PM
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">در حال بارگذاری ...</div>';
    }

    Ext.define("Ext.locale.fa.view.View", {
        override: "Ext.view.View",
        emptyText: ""
    });

    Ext.define("Ext.locale.fa.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} رکورد انتخاب شده"
    });

    Ext.define("Ext.locale.fa.TabPanelItem", {
        override: "Ext.TabPanelItem",
        closeText: "بستن"
    });

    Ext.define("Ext.locale.fa.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "مقدار فیلد صحیح نیست"
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.fa.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "در حال بارگذاری ..."
    });

    if (Ext.Date) {
        Ext.Date.monthNames = ["ژانویه", "فوریه", "مارس", "آپریل", "می", "ژوئن", "جولای", "آگوست", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"];

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

        Ext.Date.dayNames = ["یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
    }

    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "تایید",
            cancel: "بازگشت",
            yes: "بله",
            no: "خیر"
        };
    }

    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\ufdfc',
            // Iranian Rial
            dateFormat: 'Y/m/d'
        });
    }

    Ext.define("Ext.locale.fa.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "امروز",
        minText: "این تاریخ قبل از محدوده مجاز است",
        maxText: "این تاریخ پس از محدوده مجاز است",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'ماه بعد (Control + Right)',
        prevText: 'ماه قبل (Control+Left)',
        monthYearText: 'یک ماه را انتخاب کنید (Control+Up/Down برای انتقال در سال)',
        todayTip: "{0} (Spacebar)",
        format: "y/m/d",
        startDay: 0
    });

    Ext.define("Ext.locale.fa.picker.Month", {
        override: "Ext.picker.Month",
        okText: "&#160;OK&#160;",
        cancelText: "Cancel"
    });

    Ext.define("Ext.locale.fa.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "صفحه",
        afterPageText: "از {0}",
        firstText: "صفحه اول",
        prevText: "صفحه قبل",
        nextText: "صفحه بعد",
        lastText: "صفحه آخر",
        refreshText: "بازخوانی",
        displayMsg: "نمایش {0} - {1} of {2}",
        emptyMsg: 'داده ای برای نمایش وجود ندارد'
    });

    Ext.define("Ext.locale.fa.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "حداقل طول این فیلد برابر است با {0}",
        maxLengthText: "حداکثر طول این فیلد برابر است با {0}",
        blankText: "این فیلد باید مقداری داشته باشد",
        regexText: "",
        emptyText: null
    });

    Ext.define("Ext.locale.fa.form.field.Number", {
        override: "Ext.form.field.Number",
        minText: "حداقل مقدار این فیلد برابر است با {0}",
        maxText: "حداکثر مقدار این فیلد برابر است با {0}",
        nanText: "{0} یک عدد نیست"
    });

    Ext.define("Ext.locale.fa.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "غیرفعال",
        disabledDatesText: "غیرفعال",
        minText: "تاریخ باید پس از {0} باشد",
        maxText: "تاریخ باید پس از {0} باشد",
        invalidText: "{0} تاریخ صحیحی نیست - فرمت صحیح {1}",
        format: "y/m/d"
    });

    Ext.define("Ext.locale.fa.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        valueNotFoundText: undefined
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "در حال بارگذاری ..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: 'مقدار این فیلد باید یک ایمیل با این فرمت باشد "user@example.com"',
            urlText: 'مقدار این آدرس باید یک آدرس سایت با این فرمت باشد "http:/' + '/www.example.com"',
            alphaText: 'مقدار این فیلد باید فقط از حروف الفبا و _ تشکیل شده باشد ',
            alphanumText: 'مقدار این فیلد باید فقط از حروف الفبا، اعداد و _ تشکیل شده باشد'
        });
    }

    Ext.define("Ext.locale.fa.form.field.HtmlEditor", {
        override: "Ext.form.field.HtmlEditor",
        createLinkText: 'لطفا آدرس لینک را وارد کنید:'
    }, function() {
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            buttonTips: {
                bold: {
                    title: 'تیره (Ctrl+B)',
                    text: 'متن انتخاب شده را تیره می کند.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic: {
                    title: 'ایتالیک (Ctrl+I)',
                    text: 'متن انتخاب شده را ایتالیک می کند.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline: {
                    title: 'زیرخط (Ctrl+U)',
                    text: 'زیر هر نوشته یک خط نمایش می دهد.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize: {
                    title: 'افزایش اندازه',
                    text: 'اندازه فونت را افزایش می دهد.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize: {
                    title: 'کاهش اندازه',
                    text: 'اندازه متن را کاهش می دهد.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor: {
                    title: 'رنگ زمینه متن',
                    text: 'برای تغییر رنگ زمینه متن استفاده می شود.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor: {
                    title: 'رنگ قلم',
                    text: 'رنگ  قلم متن را تغییر می دهد.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft: {
                    title: 'چیدن متن از سمت چپ',
                    text: 'متن از سمت چپ چیده شده می شود.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter: {
                    title: 'متن در وسط ',
                    text: 'نمایش متن در قسمت وسط صفحه و رعابت سمت چپ و راست.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright: {
                    title: 'چیدن متن از سمت راست',
                    text: 'متن از سمت راست پیده خواهد شد.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist: {
                    title: 'لیست همراه با علامت',
                    text: 'یک لیست جدید ایجاد می کند.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist: {
                    title: 'لیست عددی',
                    text: 'یک لیست عددی ایجاد می کند. ',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink: {
                    title: 'لینک',
                    text: 'متن انتخاب شده را به لینک تبدیل کنید.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit: {
                    title: 'ویرایش سورس',
                    text: 'رفتن به حالت ویرایش سورس.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    });

    Ext.define("Ext.locale.fa.grid.header.Container", {
        override: "Ext.grid.header.Container",
        sortAscText: "مرتب سازی افزایشی",
        sortDescText: "مرتب سازی کاهشی",
        lockText: "قفل ستون ها",
        unlockText: "بازکردن ستون ها",
        columnsText: "ستون ها"
    });

    Ext.define("Ext.locale.fa.grid.PropertyColumnModel", {
        override: "Ext.grid.PropertyColumnModel",
        nameText: "نام",
        valueText: "مقدار",
        dateFormat: "Y/m/d"
    });

});
