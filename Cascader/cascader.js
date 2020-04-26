(function($){
    $.fn.cascader = function(options){
        var defaults = {
            data:[],
            changeOnSelect:false,
            initSelectData: [],
            selectFn:function(selectjson){}
        };
        var opts = $.extend(defaults,options);

        (function (){
            if(!options.el || !document.getElementById(options.el)){
                throw new Error("component must a element node");
            }

            document.getElementById(options.el).classList.add("cascaderbox");
            var fragment = document.createDocumentFragment();

            var inputDivElement = document.createElement("div");
            inputDivElement.classList.add("inputbox");

            var arrowSpanElement = document.createElement("span");
            arrowSpanElement.classList.add("arrdown");

            var inputElement = document.createElement("input");
            inputElement.classList.add("searchtxt");
            inputElement.setAttribute("autocomplete", "off");
            inputElement.setAttribute("type", "text");
            inputElement.setAttribute("placeholder", "搜索或点击下拉选择");

            var labelSpanElement = document.createElement("span");
            labelSpanElement.classList.add("labelshow");
            inputDivElement.appendChild(arrowSpanElement);
            inputDivElement.appendChild(inputElement);
            inputDivElement.appendChild(labelSpanElement);

            var listElement = document.createElement("div");
            listElement.classList.add("dlist", "hid");

            var searchListElement = document.createElement("div");
            searchListElement.classList.add("dlist", "searchdlist", "hid");

            fragment.appendChild(inputDivElement);
            fragment.appendChild(listElement);
            fragment.appendChild(searchListElement);
            document.getElementById(options.el).appendChild(fragment);
        })();
       
        var _this = this,
            searchtxt = _this.find('.searchtxt'),
            dlist = _this.find('.dlist').eq(0),
            searchdlist = _this.find('.searchdlist'),
            curArr = [],
            labelshow = _this.find('.labelshow'),
            level = 0,
            initData = false,
            selJson=[],
            searchArr = [],
            searActiveArr = [],
            searchArr_value=[],
            focusState=false,
            currInitSelectDataArr=[],
            initSelectValueArr=[];

        (function (){
            if(opts.initSelectData.length) {
                var arr = [...options.initSelectData];
                bringItemByValue(options.data, arr);
                if(initSelectValueArr.length){
                    searchtxt.attr('placeholder','');
                    labelshow.html(initSelectValueArr.join(" / "));
                }
            }
        })();

        function bringItemByValue(data, arr){
            data.map(item =>
            {
                if(item.value == arr[0]) {
                    initSelectValueArr.push(item.label);
                    arr.shift();
                    if(arr.length && item.children && Array.isArray(item.children)) {
                        bringItemByValue(item.children, arr);
                    }
                }
            });
        }
 
        labelshow.bind('click',function(){
            if(!focusState){
                searchtxt.trigger('focus');
                focusState = true;
            }
             
        })
 
        searchtxt.bind('focus',function(){
            if(!initData){
                createUl(opts.data);
                if(opts.initSelectData.length) {
                    initSelectData(opts.data, options.initSelectData[0]);
                }
                popOpen(dlist);
                createSearchArr(opts.data);
                initData = true;
            }else if(searchdlist.hasClass('hid')){
                popOpen(dlist);
            }
             
        }).bind('blur',function(){
            focusState = false;
        }).bind('keyup',function(){
            var serchstr = $(this).val();
            popClose();
            labelshow.addClass('hid');
            if(serchstr.length > 0){
                createSearchBox(serchstr);
            }else{
                popClose();
            }
        })
 
        dlist.delegate('li.item','click',function(){
           var parent_index = $(this).parent().index();
           var value = $(this).attr('data-value');
           $(this).addClass('on').siblings().removeClass('on');
           level = parent_index;
           getArray(opts.data,value);
        });
 
        searchdlist.delegate('li.item2','click',function(){
            var searStr = ($(this).text()).split('/'),litxt = dlist.find('.dlist_ul').eq(0),len = searStr.length;
 
            litxt.nextAll().remove();
 
            createSearchdlist(opts.data,searStr[0]);
 
            for(var i = 1; i<len-1; i++){
                createSearchdlist(searActiveArr,searStr[i]);
            }
            dlist.find('.dlist_ul').each(function(i){
                var jqElArr = $(this).find('li');
                highlighting(jqElArr,searStr[i])
                if(i == len-1){
                    getValue();
                    labelshow.removeClass('hid');
                    searchtxt.val('');
                    popClose();
                }
            })
 
        })
 
        function highlighting(jqElArr,highStr){
            jqElArr.each(function(){
                var curtxt = $(this).attr('data-label');
                if(highStr == curtxt){
                    var selectedItem = $(this);
                    $(this).addClass('on').siblings().removeClass('on');
                    scrollToOpened(selectedItem);
                }
            })
             
        }
 
        function scrollToOpened(selectedItem){
          var listUl = selectedItem.parents('ul');
            if(selectedItem.size()>0){
                var scrollTop = listUl.scrollTop(),top = selectedItem.position().top + scrollTop;
                if(scrollTop < top){
                    top = top -(listUl.height() - selectedItem.height())/2;
                    listUl.scrollTop(top);
                }
            }
        }
 
        function createSearchdlist(data,label){
            for(var i in data){
                if(data[i].label == label){
                    searActiveArr = data[i].children;
                }
            }
            createUl(searActiveArr);
            
        }

        function initSelectData(data,value){
            var len = opts.initSelectData.length;
            createInitSelectData(data, value);
            for(var i = 1; i<len-1; i++){
                createInitSelectData(currInitSelectDataArr,opts.initSelectData[i]);
            }
            dlist.find('.dlist_ul').each(function(i){
                var jqElArr = $(this).find('li');
                highlightingValue(jqElArr,opts.initSelectData[i])
                if(i == len-1){
                    getValue();
                    labelshow.removeClass('hid');
                    searchtxt.val('');
                    popClose();
                }
            })
        }

        function createInitSelectData(data, value){
            for(var i in data){
                if(data[i].value == value){
                    currInitSelectDataArr = data[i].children;
                }
            }
            console.log("currInitSelectDataArr", currInitSelectDataArr);
            createUl(currInitSelectDataArr);
        }

        function highlightingValue(jqElArr,highStr){
            jqElArr.each(function(){
                var curValue = $(this).attr('data-value');
                if(highStr == curValue){
                    var selectedItem = $(this);
                    $(this).addClass('on').siblings().removeClass('on');
                    scrollToOpened(selectedItem);
                }
            })
             
        }
 
        var htmlClickHandler =function(e){
            if(dlist.hasClass('hid') && searchdlist.hasClass('hid')) return;
            var cascader = $(e.target).parents('.cascaderbox');
            if(cascader.size() == 0){
                popClose();
                if(labelshow.hasClass('hid')){
                    labelshow.removeClass('hid')
                    searchtxt.val('');
                }
            };
 
 
        }
 
        function getArray(data,value){
            for(var i in data){
                if(data[i].value == value){
                    curArr = data[i].children;
                    createEl();
                    break;
                }else{
                    getArray(data[i].children,value);
                }
            }
        }
 
        function createEl(){
            if(curArr){
               /*  点击非最后一个子级 */
                _this.find('.dlist_ul').eq(level).nextAll().remove();
                createUl(curArr);
                popOpen(dlist);
                if(opts.changeOnSelect){ /* 选择即改变,可选择任意级 */
                     getValue();
                }
                 
            }else{
                /* 点击最后一个子级 */
                _this.find('.dlist_ul').eq(level).nextAll().remove();
                getValue();
                popClose();
            }
        }
 
        function createUl(data){
            var arr = data, liArr = []; ul = $('<ul class="dlist_ul"></ul>');
            if(Array.isArray(data) && data.length) {
                $.each(arr,function(i,data){
                    var lastClass = '';
                    if(!data.children){
                        lastClass = 'lastchild'
                    }
                    liArr.push('<li data-label="'+data.label+'" data-value="'+data.value+'" class="item '+lastClass+'">'+data.label+'</li>')
     
                })
                ul.append(liArr.join(''));
                dlist.append(ul);
            }
        }
 
        function getValue(){
            selJson = []; /* 最终选项数组 */
            dlist.find('li.on').each(function(i,data){
                var label = $(this).attr('data-label'),
                    value = $(this).attr('data-value');
                selJson.push({"value":value,"label":label});
 
            })
 
            var selectedStr = selJsonToStr(selJson);
 
            searchtxt.attr('placeholder','');
            labelshow.html(selectedStr);
            opts.selectFn(selJson);
             
        }
 
        function selJsonToStr(arr){
            var listArr = [];
            $.each(arr,function(i,data){
                var label = data.label;
                listArr.push(label);
            })
            str = listArr.join(' / ');
            return str;
        }
 
        function createSearchArr(data,label){
            for(var i in data){
                if(!label){
                    label = ''
                }
                var str = label + '' + data[i].label + "/";
                if(data[i].children){
                    curArr = data[i].children;
                    createSearchArr(curArr,str)
                }else{
                    str = str.substring(0,str.lastIndexOf("/"));
                    searchArr.push(str);
                    searchArr_value.push(data[i].value);
                }
            }
        }
 
        function createSearchBox(label){
            var liArr = []; ul = $('<ul class="dlist_ul dlist_search"></ul>');
            $.each(searchArr,function(i,data){
                if(data.indexOf(label) != -1){
                    var value = searchArr_value[i];
                    liArr.push('<li data-value="'+value+'" class="item2">'+data+'</li>')
                }
            });
             
            if(liArr.length != 0){
                searchdlist.empty();
                ul.append(liArr.join(''));
                searchdlist.append(ul);
                popOpen(searchdlist);
            }else{
                searchdlist.empty();
                ul.append('<li class="nosearch">无匹配数据</li>')
                searchdlist.append(ul);
                popOpen(searchdlist);
            }
        }
  
        function popClose(){
            _this.removeClass('open');
            _this.find('.dlist').addClass('hid');
        }
 
        function popOpen(el){
            _this.addClass('open');
            el.removeClass('hid');
        }
 
        $('html').bind('click',htmlClickHandler)  
    }
})(jQuery)