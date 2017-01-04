
/**
 * List compiled by mystix on the extjs.com forums.
 * Thank you Mystix!
 * Vietnamese translation
 * By bpmtri
 * 12-April-2007 04:06PM
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Đang tải...</div>';
    }

    Ext.define("Ext.locale.vn.view.View", {
        override: "Ext.view.View",
        emptyText: ""
    });

    Ext.define("Ext.locale.vn.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} dòng được chọn"
    });

    Ext.define("Ext.locale.vn.TabPanelItem", {
        override: "Ext.TabPanelItem",
        closeText: "Đóng thẻ này"
    });

    Ext.define("Ext.locale.vn.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "Giá trị của ô này không hợp lệ."
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.vn.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "Đang tải..."
    });

    if (Ext.Date) {
        Ext.Date.monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

        Ext.Date.dayNames = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    }

    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "Đồng ý",
            cancel: "Hủy bỏ",
            yes: "Có",
            no: "Không"
        };
    }

    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ab',
            // Vietnamese Dong
            dateFormat: 'd/m/Y'
        });
    }

    Ext.define("Ext.locale.vn.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "Hôm nay",
        minText: "Ngày này nhỏ hơn ngày nhỏ nhất",
        maxText: "Ngày này lớn hơn ngày lớn nhất",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Tháng sau (Control+Right)',
        prevText: 'Tháng trước (Control+Left)',
        monthYearText: 'Chọn một tháng (Control+Up/Down để thay đổi năm)',
        todayTip: "{0} (Spacebar - Phím trắng)",
        format: "d/m/y"
    });

    Ext.define("Ext.locale.vn.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "Trang",
        afterPageText: "of {0}",
        firstText: "Trang đầu",
        prevText: "Trang trước",
        nextText: "Trang sau",
        lastText: "Trang cuối",
        refreshText: "Tải lại",
        displayMsg: "Hiển thị {0} - {1} của {2}",
        emptyMsg: 'Không có dữ liệu để hiển thị'
    });

    Ext.define("Ext.locale.vn.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "Chiều dài tối thiểu của ô này là {0}",
        maxLengthText: "Chiều dài tối đa của ô này là {0}",
        blankText: "Ô này cần phải nhập giá trị",
        regexText: "",
        emptyText: null
    });

    Ext.define("Ext.locale.vn.form.field.Number", {
        override: "Ext.form.field.Number",
        minText: "Giá trị nhỏ nhất của ô này là {0}",
        maxText: "Giá trị lớn nhất của ô này là  {0}",
        nanText: "{0} hông phải là một số hợp lệ"
    });

    Ext.define("Ext.locale.vn.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "Vô hiệu",
        disabledDatesText: "Vô hiệu",
        minText: "Ngày nhập trong ô này phải sau ngày {0}",
        maxText: "Ngày nhập trong ô này phải trước ngày {0}",
        invalidText: "{0} không phải là một ngày hợp lệ - phải có dạng {1}",
        format: "d/m/y"
    });

    Ext.define("Ext.locale.vn.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        valueNotFoundText: undefined
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "Đang tải..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: 'Giá trị của ô này phải là một địa chỉ email có dạng như "ten@abc.com"',
            urlText: 'Giá trị của ô này phải là một địa chỉ web(URL) hợp lệ, có dạng như "http:/' + '/www.example.com"',
            alphaText: 'Ô này chỉ được nhập các kí tự và gạch dưới(_)',
            alphanumText: 'Ô này chỉ được nhập các kí tự, số và gạch dưới(_)'
        });
    }

    Ext.define("Ext.locale.vn.grid.header.Container", {
        override: "Ext.grid.header.Container",
        sortAscText: "Tăng dần",
        sortDescText: "Giảm dần",
        lockText: "Khóa cột",
        unlockText: "Bỏ khóa cột",
        columnsText: "Các cột"
    });

    Ext.define("Ext.locale.vn.grid.PropertyColumnModel", {
        override: "Ext.grid.PropertyColumnModel",
        nameText: "Tên",
        valueText: "Giá trị",
        dateFormat: "j/m/Y"
    });

});
