/**
 * Korean Translations By nicetip
 * 05 September 2007
 * Modify by techbug / 25 February 2008
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">로딩중...</div>';
    }

    Ext.define("Ext.locale.ko.view.View", {
        override: "Ext.view.View",
        emptyText: ""
    });

    Ext.define("Ext.locale.ko.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} 개가 선택되었습니다."
    });

    Ext.define("Ext.locale.ko.TabPanelItem", {
        override: "Ext.TabPanelItem",
        closeText: "닫기"
    });

    Ext.define("Ext.locale.ko.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "올바른 값이 아닙니다."
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.ko.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "로딩중..."
    });

    if (Ext.Date) {
        Ext.Date.monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

        Ext.Date.dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    }
    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "확인",
            cancel: "취소",
            yes: "예",
            no: "아니오"
        };
    }

    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: ',',
            decimalSeparator: '.',
            currencySign: '\u20a9',
            // Korean Won
            dateFormat: 'm/d/Y'
        });
    }

    Ext.define("Ext.locale.ko.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "오늘",
        minText: "최소 날짜범위를 넘었습니다.",
        maxText: "최대 날짜범위를 넘었습니다.",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: '다음달(컨트롤키+오른쪽 화살표)',
        prevText: '이전달 (컨트롤키+왼족 화살표)',
        monthYearText: '월을 선택해주세요. (컨트롤키+위/아래 화살표)',
        todayTip: "{0} (스페이스바)",
        format: "m/d/y",
        startDay: 0
    });

    Ext.define("Ext.locale.ko.picker.Month", {
        override: "Ext.picker.Month",
        okText: "확인",
        cancelText: "취소"
    });

    Ext.define("Ext.locale.ko.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "페이지",
        afterPageText: "/ {0}",
        firstText: "첫 페이지",
        prevText: "이전 페이지",
        nextText: "다음 페이지",
        lastText: "마지막 페이지",
        refreshText: "새로고침",
        displayMsg: "전체 {2} 중 {0} - {1}",
        emptyMsg: '표시할 데이터가 없습니다.'
    });

    Ext.define("Ext.locale.ko.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "최소길이는 {0}입니다.",
        maxLengthText: "최대길이는 {0}입니다.",
        blankText: "값을 입력해주세요.",
        regexText: "",
        emptyText: null
    });

    Ext.define("Ext.locale.ko.form.field.Number", {
        override: "Ext.form.field.Number",
        minText: "최소값은 {0}입니다.",
        maxText: "최대값은 {0}입니다.",
        nanText: "{0}는 올바른 숫자가 아닙니다."
    });

    Ext.define("Ext.locale.ko.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "비활성",
        disabledDatesText: "비활성",
        minText: "{0}일 이후여야 합니다.",
        maxText: "{0}일 이전이어야 합니다.",
        invalidText: "{0}는 올바른 날짜형식이 아닙니다. - 다음과 같은 형식이어야 합니다. {1}",
        format: "m/d/y"
    });

    Ext.define("Ext.locale.ko.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        valueNotFoundText: undefined
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "로딩중..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: '이메일 주소 형식에 맞게 입력해야합니다. (예: "user@example.com")',
            urlText: 'URL 형식에 맞게 입력해야합니다. (예: "http:/' + '/www.example.com")',
            alphaText: '영문, 밑줄(_)만 입력할 수 있습니다.',
            alphanumText: '영문, 숫자, 밑줄(_)만 입력할 수 있습니다.'
        });
    }

    Ext.define("Ext.locale.ko.form.field.HtmlEditor", {
        override: "Ext.form.field.HtmlEditor",
        createLinkText: 'URL을 입력해주세요:'
    }, function() {
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            buttonTips: {
                bold: {
                    title: '굵게 (Ctrl+B)',
                    text: '선택한 텍스트를 굵게 표시합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic: {
                    title: '기울임꼴 (Ctrl+I)',
                    text: '선택한 텍스트를 기울임꼴로 표시합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline: {
                    title: '밑줄 (Ctrl+U)',
                    text: '선택한 텍스트에 밑줄을 표시합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize: {
                    title: '글꼴크기 늘림',
                    text: '글꼴 크기를 크게 합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize: {
                    title: '글꼴크기 줄임',
                    text: '글꼴 크기를 작게 합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor: {
                    title: '텍스트 강조 색',
                    text: '선택한 텍스트의 배경색을 변경합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor: {
                    title: '글꼴색',
                    text: '선택한 텍스트의 색을 변경합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft: {
                    title: '텍스트 왼쪽 맞춤',
                    text: '왼쪽에 텍스트를 맞춥니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter: {
                    title: '가운데 맞춤',
                    text: '가운데에 텍스트를 맞춥니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright: {
                    title: '텍스트 오른쪽 맞춤',
                    text: '오른쪽에 텍스트를 맞춥니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist: {
                    title: '글머리 기호',
                    text: '글머리 기호 목록을 시작합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist: {
                    title: '번호 매기기',
                    text: '번호 매기기 목록을 시작합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink: {
                    title: '하이퍼링크',
                    text: '선택한 텍스트에 하이퍼링크를 만듭니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit: {
                    title: '소스편집',
                    text: '소스편집 모드로 변환합니다.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    });

    Ext.define("Ext.locale.ko.grid.header.Container", {
        override: "Ext.grid.header.Container",
        sortAscText: "오름차순 정렬",
        sortDescText: "내림차순 정렬",
        lockText: "칼럼 잠금",
        unlockText: "칼럼 잠금해제",
        columnsText: "칼럼 목록"
    });

    Ext.define("Ext.locale.ko.grid.GroupingFeature", {
        override: "Ext.grid.GroupingFeature",
        emptyGroupText: '(None)',
        groupByText: '현재 필드로 그룹핑합니다.',
        showGroupsText: '그룹으로 보여주기'

    });

    Ext.define("Ext.locale.ko.grid.PropertyColumnModel", {
        override: "Ext.grid.PropertyColumnModel",
        nameText: "항목",
        valueText: "값",
        dateFormat: "m/j/Y"
    });

});
