// ==UserScript==
// @name         CSDN 博客淨化
// @namespace    https://zhihsian.me/
// @version      0.1
// @description  取消 CSDN 博客的「展開閱讀全文」
// @author       zhihsian <i@zhihsian.me>
// @license      MIT
// @match        *://blog.csdn.net/*
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    let hide_article_box = document.querySelector('.hide-article-box');
    if (hide_article_box) {
        hide_article_box.remove();
    }

    let article_content = document.querySelector('#article_content');
    if (article_content) {
        article_content.style = "";
    }
})();
