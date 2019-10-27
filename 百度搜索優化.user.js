// ==UserScript==
// @name         百度搜索優化
// @namespace    https://zhihsian.me/
// @version      0.4
// @description  百度搜索結果頁根據域名過濾、顯示原始網址、移除重定向。修改自：https://github.com/Binkcn/baidu-search-optimization
// @author       zhihsian <i@zhihsian.me>
// @create       2019-01-25
// @lastmodified 2019-09-02
// @license      GNU GPLv3
// @match        *://www.baidu.com/*
// @connect      www.baidu.com
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @note         2019-09-02 Version 0.4 修復 AJAX 頁面問題
// @note         2019-08-13 Version 0.3 添加增刪屏蔽域名功能
// @note         2019-01-25 Version 0.2 每100毫秒执行一次过滤效果，解决在Ajax搜索下过滤不生效的问题。同时增加对新闻搜索结果的过滤。
// @note         2019-01-25 Version 0.1 第一个版本发布。
// ==/UserScript==

(function() {
    'use strict';

    const blockListKey = 'blockList';
    const parseRedirectStatusAttribute = 'data-parse-redirect-status';

    let blockList = GM_getValue(blockListKey, ['baijiahao.baidu.com', 'jingyan.baidu.com']);

    const style = `
        #baidu_search_opt {
            position: fixed;
            right: 0;
            top: 50%;
            transform: translate(0, -50%);
            background: #ffffff;
            border: 1px solid #cccccc;
            border-right: none;
            padding: 10px;
        }
        .remove_block_list_item {
            color: #ff0000;
            cursor: pointer;
            padding-right: 5px;
        }
        .block_this_domain {
            cursor: pointer;
            color: #666666;
        }
        `;

    setInterval(function() {
        createConfigBox();

        var domList = document.querySelectorAll('h3.t > a, .c-row > a');

        for (let aEle of domList) {
            if (aEle != null && aEle.getAttribute(parseRedirectStatusAttribute) == null) {
                aEle.setAttribute(parseRedirectStatusAttribute, '0');

                if (aEle.href.indexOf("www.baidu.com/link") > -1) {
                    parseUrl(aEle);
                }
            }
        }
    }, 100);

    function parseUrl(aEle) {
        const url = aEle.href.replace(/^http:$/, 'https:');

        let xhr = GM_xmlhttpRequest({
            extData: aEle,
            url: url,
            headers: {"Accept": "*//*", "Referer": url},
            method: "GET",
            timeout: 5000,
            onreadystatechange: function(response) {
                if (response.responseHeaders.indexOf("tm-finalurl") >= 0) {
                    var realUrl = getRegx(response.responseHeaders, "tm-finalurl\\w+: ([^\\s]+)");
                    if (realUrl == null || realUrl == '' || realUrl.indexOf("www.baidu.com/search/error") > 0) return;

                    doParseRedirectStatus(xhr, aEle, realUrl);
                }
            }
        });
    }

    function removeFromBlockList(domain) {
        let index = blockList.indexOf(domain);
        if (index == -1) return;

        blockList.splice(index, 1);

        GM_setValue(blockListKey, blockList);
        createConfigBox();
    }

    function addToBlockList(domain) {
        if (blockList.includes(domain)) return;

        blockList.push(domain);

        GM_setValue(blockListKey, blockList);
        createConfigBox();
    }

    function onBlockThisDomainClick() {
        addToBlockList(this.getAttribute('data-domain'));
    }

    function showUrl(container, realUrl) {
        let itemShowUrl = container.querySelector('.c-showurl');
        if (itemShowUrl) {
            if (itemShowUrl.tagName == 'A') {
                itemShowUrl.setAttribute("href", realUrl);
            }

            if (itemShowUrl.querySelector('.c-showurl')) {
                /*
                 * <div class="c-showurl">
                 *     <span class="c-showurl">tieba.baidu.com/ </span><span class="c-tools">***</span> - 
                 *     <a target="_blank" href="http://open.baidu.com/" class="op_LAMP"></a>
                 * </div>
                 * 
                 * 目前只發現有百度貼吧，且顯示了域名「tieba.baidu.com」，不處理
                 */
                return;
            }

            const text = (realUrl.length < 40) ? realUrl : realUrl.substring(0, 40) + '...';

            if (itemShowUrl.firstElementChild) {
                if (itemShowUrl.firstElementChild.tagName == 'B') {
                    /**
                     * <a href="https://edu.csdn.net/" class="c-showurl">https://edu.<b>csdn</b>.net/&nbsp;</a>
                     * 
                     * 已顯示了地址且地址中的關鍵詞被加粗，不處理
                     */
                    return;
                }

                if (itemShowUrl.firstElementChild == itemShowUrl.lastElementChild) {
                    // <a class="c-showurl"><img src="xxxx">百度企业信用</a>
                    // 添加一個 span 標籤到最後，以顯示完整地址
                    itemShowUrl.append(document.createElement('span'));
                }

                itemShowUrl.lastElementChild.append(document.createTextNode('：' + text));
            } else {
                itemShowUrl.innerText = text;
            }
        }
    }

    function showBlock(container, domain) {
        // 地址後三角形
        let cTools = container.querySelector('.c-tools');

        if (cTools.nextSibling && cTools.nextSibling.classList.contains('block_this_domain')) {
            // 已經添加，不處理
            return;
        }

        let blockEle = document.createElement('span');
        blockEle.className = 'block_this_domain';
        blockEle.innerText = '屏蔽';
        blockEle.setAttribute('data-domain', domain);
        blockEle.addEventListener('click', onBlockThisDomainClick);
        cTools.parentElement.insertBefore(blockEle, cTools.nextSibling);
    }

    function getContainer(ele) {
        while (ele) {
            if (ele.classList.contains('c-container')) {
                return ele;
            }

            ele = ele.parentElement;
        }

        return null;
    }

    function doParseRedirectStatus(xhr, aEle, realUrl) {
        if (realUrl == null || realUrl == "" || typeof(realUrl) == "undefined") return;

        if (realUrl.indexOf("www.baidu.com/link") >= 0) return;

        if (aEle.getAttribute(parseRedirectStatusAttribute) == '1') return;

        try {
            aEle.setAttribute(parseRedirectStatusAttribute, '1');
            aEle.setAttribute("href", realUrl);

            const domain = getHost(realUrl);

            let itemContainer = getContainer(aEle);;
            if (!itemContainer) {
                console.log(aEle);
                return;
            }

            if (blockList.includes(domain)) {
                console.log('Block Host Hit', realUrl);

                itemContainer.style = "display: none";
            }

            showUrl(itemContainer, realUrl);
            showBlock(itemContainer, domain);

            xhr.abort();
        } catch (e) {

        }
    };

    function onRemoveBlockListItemClick() {
        const domain = this.getAttribute('data-domain');
        removeFromBlockList(domain);
    }

    function createConfigBox() {
        let blockListEle = document.querySelector('#baidu_search_opt>ul')
        if (blockListEle) { // 若存在，清空原來的列表
            while (blockListEle.firstChild) {
                blockListEle.removeChild(blockListEle.firstChild);
            }
        } else {    // 否則，創建列表
            // 添加 CSS
            GM_addStyle(style);

            let container = document.createElement('div');
            container.id = 'baidu_search_opt';
            document.querySelector('body').append(container);

            blockListEle = document.createElement('ul');
            container.append(blockListEle);
        }

        for (const domain of blockList) {
            let blockItemEle = document.createElement('li');
            blockItemEle.className = 'block_list_item';
            blockItemEle.innerText = domain;
            blockListEle.append(blockItemEle);

            let removeBlockItemEle = document.createElement('span');
            removeBlockItemEle.className = 'remove_block_list_item';
            removeBlockItemEle.setAttribute('data-domain', domain);
            removeBlockItemEle.innerText = '×';
            removeBlockItemEle.addEventListener('click', onRemoveBlockListItemClick);
            blockItemEle.prepend(removeBlockItemEle);
        }
    }

    function getRegx(string, reg) {
        var RegE = new RegExp(reg);
        try {
            return RegE.exec(string)[1];
        } catch (e) {
        }

        return '';
    }

    function getHost(string) {
        return string.replace(/(\/[^/]*|\s*)/, "").replace(/<[^>]*>/g, "").replace(/https?:\/\//g, "").replace(/<\/?strong>/g, "").replace(/<\/?b>/g, "").replace(/<?>?/g, "").replace(/( |\/).*/g, "");
    }
})();
