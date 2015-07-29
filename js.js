/**
 * User: Eric Ma
 * Email: zjafei@gmail.com
 * Date: 2015/5/26
 * Time: 21:54
 */
define(function (require, exports, module) {


    var selectAreaJson = [],
        selectAreaTemp = $('<div style="display:none"></div>'),
        $body = $('body'),
        dialogPlus = require('dialogPlus');

    //创建单个区域html结构
    function createAreaHtml(obj, level, pid) {
        var areaListHtml = '',
            moreHtml = '';

        if (typeof obj.son !== "undefined" && obj.son.length > 0) {
            areaListHtml = '<div class="area-list"  i="' + obj.id + '" p="' + pid + '" level="' + level + '"></div>';
            moreHtml = ' <span class="js-select-area-more glyphicon glyphicon-triangle-bottom" i="' + obj.id + '" p="' + pid + '"></span>';
        }
        return '<div class="area-container" level="' + level + '" id="' + obj.id + '" p="' + pid + '">' +
            '<div class="area-head checkbox"  i="' + obj.id + '" p="' + pid + '">' +
            '<label>' +
            '<input class="js-select-area" type="checkbox" level="' + level + '" autocomplete="off" value="" i="' + obj.id + '" p="' + pid + '"> ' + obj.shortname +
            '</label>' +
            '<span class="text-warning js-select-area-number" i="' + obj.id + '" level="' + level + '"></span>' +
            moreHtml +
            '</div>' +
            areaListHtml +
            '</div>'
    }

    //创建全部区域html结构
    function createAreaListHtml(areaAry, dom, level, pid) {
        //ajax获取地区json /index.php/Usercenter/Supply/getallarea.html
        $.each(areaAry, function () {
            dom.append(createAreaHtml(this, level, pid));
            if (typeof this.son === "object" && this.son.length > 0) {
                createAreaListHtml(this.son, $('.area-list[i="' + this.id + '"]'), level + 1, this.id);
            }
        });
    }

    //根据修改指定ID的checked属性为true
    function checkedCheckbox(idAry) {
        $('._SELECTAREA .js-select-area').prop('checked', false);
        if (idAry.length > 0) {
            $.each(idAry, function () {
                $('._SELECTAREA .js-select-area[i="' + this + '"]').prop('checked', true);
            });
        }
    }

    //选择框对父级选择框的影响
    function parentCheckbox(pid) {
        if (pid !== '') {
            var allLength = $('._SELECTAREA .area-list[i="' + pid + '"] input[type="checkbox"][p="' + pid + '"]').length;//同级别的全部选择框
            var checkedLenght = $('._SELECTAREA .area-list[i="' + pid + '"] input[type="checkbox"][p="' + pid + '"]:checked').length;//同级别的选中的选择框
            var p = $('._SELECTAREA .js-select-area[i="' + pid + '"]');
            p.prop('checked', allLength === checkedLenght);
            var id = p.attr('p');
            if (id !== '') {//向上迭代父级选择框
                parentCheckbox(id);
            }
        }
    }

    //改变所有数字
    function changeAllNumber(dom) {
        $.each(dom, function () {
            var myThis = $(this);
            var l = myThis.find('.js-select-area:checked').length;
            if (l > 0) {
                $('._SELECTAREA .js-select-area-number[i="' + myThis.attr('i') + '"]').text('(' + l + ')');
            } else {
                $('._SELECTAREA .js-select-area-number[i="' + myThis.attr('i') + '"]').text('');
            }

        });
        // alert(0);
    }

    //获取最末级被选中的选择框的ID数组
    function getLastCheckedAreaIdArray(dom) {
        var ary = [];
        $.each(dom, function () {
            var id = $(this).attr('i');
            //console.log($('#' + id + ' > .area-list').length);
            if ($('._SELECTAREA #' + id + ' > .area-list').length === 0) {
                ary.push(id);
            }
        });
        return ary;
    }

    //获取被选中的选择框的ID数组
    function getAllCheckedAreaIdArray(dom) {
        var ary = [];
        $.each(dom, function () {
            ary.push($(this).attr('i'));
        });
        return ary;
    }

    //获取被选中的选择框的名称数组
    function getAreaNameArray(dom, ary) {
        $.each(dom, function () {
            var myThis = $(this);
            var id = myThis.attr('i');

            if (myThis.prop('checked')) {
                console.log(myThis.parent().text().replace(/\s+/g, ''));
                ary.push(myThis.parent().text().replace(/\s+/g, ''));
            } else {
                var list = $('._SELECTAREA .js-select-area[p ="' + id + '"]');
                if (list.length > 0) {
                    getAreaNameArray(list, ary);
                }
            }
        });
        return ary;
    }

    //城市列表的显示与隐藏
    $body.on('click', '._SELECTAREA .js-select-area-more', function (e) {
        var id = $(this).attr('i');//自己的ID
        var curId = $('._SELECTAREA .cur').eq(0).attr('i');//原来显示的

        if (id === curId) {
            $('._SELECTAREA #' + id).removeAttr('style');
            $('._SELECTAREA .area-list[i="' + id + '"]').removeClass('cur').hide();
        } else {
            $('._SELECTAREA #' + curId).removeAttr('style');
            $('._SELECTAREA .area-list[i="' + curId + '"]').removeClass('cur').hide();
            $('._SELECTAREA .area-list[i="' + id + '"]').addClass('cur').show();
            $('._SELECTAREA #' + id).css({
                'z-index': '99'
            });
        }
        e.stopPropagation();
    });
    $body.on('click', '.cur', function (e) {
        e.stopPropagation();
    });
    $body.on('click', '.area-container[style="z-index: 99;"] > .area-head > label', function (e) {
        e.stopPropagation();
    });
    $(document).click(function () {
        var curId = $('._SELECTAREA .cur').eq(0).attr('i');//原来显示的
        $('._SELECTAREA #' + curId).removeAttr('style');
        $('._SELECTAREA .area-list[i="' + curId + '"]').removeClass('cur').hide();
    });

    //创建弹窗
    function createselectAreaDialog(cb, hs) {
        //createAreaListHtml(selectAreaJson, selectAreaTemp, 0, '');
        dialogPlus({
            title: '新增地区',
            cssUri: seajs.data.base + 'modules/widget/selectArea/css.css',
            padding: 10,
            content: '<div class="_SELECTAREA" id="_SELECTAREA">' + selectAreaTemp.html() + '</div>',
            fixed: true,
            quickClose: true,
            width: 650,
            height: 300,
            onbeforeremove: function () {
                selectAreaTemp.html($('#_SELECTAREA').html());
            },
            ok: function () {
                var checked = $('._SELECTAREA .js-select-area:checked');
                cb({
                    lastCheckedAreaId: getLastCheckedAreaIdArray(checked),
                    allCheckedAreaId: getAllCheckedAreaIdArray(checked),
                    areaName: getAreaNameArray($('._SELECTAREA .js-select-area[level="0"]'),[])
                });
            }
        }).showModal();

        selectAreaTemp.html('');

        $('._SELECTAREA .area-container[level="0"]:odd ').css({'background-color': '#ECF4FF'});

        //选择框的点击动作
        $('.js-select-area').click(function () {
            var id = $(this).attr('i');//自己的ID
            var pid = $(this).attr('p');
            $('.area-list[i="' + id + '"] input[type="checkbox"]').prop('checked', this.checked);//子级全选或全不选
            parentCheckbox(pid);
            changeAllNumber($('._SELECTAREA .area-list[level="1"]'));
        });
        checkedCheckbox(hs);
        changeAllNumber($('._SELECTAREA .area-list[level="1"]'));
    }

    module.exports = function (callback, haveSelect) {

        var hs = [],
            cb = function () {
            };
        if (typeof  haveSelect === "object" && haveSelect.length > 0) {
            hs = haveSelect;
        }
        if (typeof callback === "function") {
            cb = callback;
        }
        $body.append(selectAreaTemp);
        if (selectAreaJson.length > 0) {
            createselectAreaDialog(cb, hs)
        } else {
            $.ajax({
                type: "POST",
                url: APP_PATH + '/Aides/Aides/getbigarea',
                dataType: "json",
                success: function (data) {
                    switch (data.status) {
                        case 1:
                            selectAreaJson = data.arealist;
                            createAreaListHtml(selectAreaJson, selectAreaTemp, 0, '');
                            createselectAreaDialog(cb, hs);
                            break;
                        case 0:
                            alert(data.info);
                            break;
                    }
                }
            });
        }
    };
});