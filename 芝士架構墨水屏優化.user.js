// ==UserScript==
// @name         芝士架構墨水屏優化
// @namespace    https://zsien.tech/
// @version      0.0.1
// @description  優化芝士架構在墨水屏下的顯示效果
// @author       zsien <i@zsien.cn>
// @match        https://www.cheko.cc/*
// @icon         https://www.cheko.cc/favicon.ico
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
.mt-0 {
    margin-top: 0
}
.mt-1 {
    margin-top: .25rem
}
.mt-10,
.mt-2,
.mt-20,
.mt-24,
.mt-4,
.mt-6,
.mt-60 {
    margin-top: 0.5rem;
}

.mb-10,
.mb-56,
.mb-6,
.mb-\\[10px\\] {
    margin-bottom: 0.5rem;
}

.p-1 {
    padding: .25rem
}
.p-10,
.p-16,
.p-2,
.p-4,
.p-6,
.p-8 {
    padding: 0.5rem;
}

.px-1 {
    padding-left: 0.25rem;
    padding-right: 0.25rem
}
.px-10,
.px-11,
.px-14,
.px-16,
.px-2,
.px-20,
.px-24,
.px-4,
.px-6,
.px-8,
.px-\\[15px\\] {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.py-1 {
    padding-top: .25rem;
    padding-bottom: .25rem
}

.py-10,
.py-2,
.py-3,
.py-4,
.py-5,
.py-6,
.py-8 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
}

.gap-1,
.gap-10,
.gap-12,
.gap-14,
.gap-2,
.gap-2\\.5,
.gap-20,
.gap-4,
.gap-5,
.gap-6,
.gap-8 {
    gap: 0.5rem;
}

.gap-x-2,
.gap-x-6 {
    -moz-column-gap: 0.5rem;
    column-gap: 0.5rem
}

.gap-y-10,
.gap-y-4,
.gap-y-6 {
    row-gap: 0.5rem;
}

.my-10,
.my-4,
.my-6 {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem
}

.bg-white {
    border: 1px solid #000000;
}


/* 文字顯示黑色 */
.font-medium {
    color: #000000;
}
p {
    color: #000000;
}

#__next>div {
    background-color: #ffffff !important;

    /* 首頁 */
    >main>div>.grid-cols-3 {
        padding: 0;

        >div {
            border-radius: 0;
        }
    }

    /* 答題頁 */
    &.min-w-\\[1300px\\] {
        min-width: 1200px;
    }

    >main.w-\\[1300px\\] {
        width: 1200px;

        >div {
            padding-left: 0;
            padding-right: 0;
        }

        >.w-\\[1400px\\] {
            width: 1200px;

            /* 去題目右側背景圖 */
            [alt="test_book"] {
                display: none;
            }

            /* 「凱恩解析」右側圖片 */
            [alt="light"] {
                display: none;
            }

            /* 正確答案 */
            button.border-green-600::after {
                content: "✓";
            }

            /* 錯誤答案 */
            button.border-red-600::after {
                content: "✗";
            }

            >.w-\\[300px\\] {
                width: 250px;
            }
        }
    }

    /* 統計頁 */
    >.w-\\[1400px\\] {
        width: 1200px;
    }

    /* 去 footer */
    >div:last-child {
        display: none;
    }
}
`);
})();
