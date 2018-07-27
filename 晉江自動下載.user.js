// ==UserScript==
// @name         晉江自動下載
// @namespace    https://zijung.me/
// @version      2.0.0
// @description  自動下載晉江小說的內容爲 txt （VIP 章節需自己購買）
// @author       Zijung Chueh <i@zijung.me>
// @license      MIT
// @match        *://www.jjwxc.net/onebook.php?*
// @match        *://my.jjwxc.net/onebook_vip.php?*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    let novelNameContainer = document.querySelector("h1"),
        novelName = novelNameContainer.innerText,
        novelId = parseInt(
                document.querySelector("#novelid") ?
                document.querySelector("#novelid").value :
                document.querySelector("#clickNovelid").innerText
            ),
        chapterId = parseInt(
                document.querySelector("#chapterid") ?
                document.querySelector("#chapterid").value : 0
            ),
        filename = novelName + "_" + chapterId + ".txt",
        autoDownloadControlKey = "download-" + novelId,
        autoDownload = GM_getValue(autoDownloadControlKey, false),
        contentContainer = document.querySelector(".noveltext");

    // 添加控制按鈕到小說名旁邊
    let labelElement = document.createElement('label');
    labelElement.innerHTML = '<input type="checkbox"> 自動下載';
    novelNameContainer.append(labelElement);

    let checkboxElement = labelElement.querySelector('input');
    checkboxElement.checked = autoDownload;
    checkboxElement.addEventListener('change', function(event) {
        GM_setValue(autoDownloadControlKey, this.checked);

        if (this.checked) {
            download();
        }
    });

    if (autoDownload !== false) {
        download();
    }

    function download() {
        // 如果是列表頁，跳轉到第一章
        if (!chapterId) {
            toNextChapter();
            return;
        }

        // 去掉無用標籤
        let beforeTitle = true;
        let eleIndex = 0;
        let loopTimes = contentContainer.childElementCount;
        for (let i = 0; i < loopTimes; i++) {
            let ele = contentContainer.children[eleIndex];
            let deleteElement = false;

            if (beforeTitle) {
                // 遇到 align="center"，說明到了標題，不再刪標籤
                if (ele.getAttribute("align") == "center") {
                    beforeTitle = false;
                } else {
                    // 還沒到標題，刪除標籛
                    deleteElement = true;
                }
            }

            // 右對齊的標籛（比如「插入書籤」），直接刪除
            if (ele.getAttribute("align") == "right") {
                deleteElement = true;
            }

            if (deleteElement) {
                console.log(ele);
                contentContainer.removeChild(ele);
            } else {
                eleIndex++;
            }
        }

        let hrs = document.querySelectorAll('hr');
        if (hrs) {
            hrs.forEach((hr) => {
                hr.insertAdjacentHTML('afterend', '<br /><br /><br /><br />' + '-'.repeat(80) + '<br />');
            });
        }

        // 去除「@无限好文，尽在晋江文学城」和每行末尾空格
        contentContainer.innerText = contentContainer.innerText.replace('@无限好文，尽在晋江文学城', '');
        contentContainer.innerText = contentContainer.innerText.replace(/( |　|\t)+$/gm, '');

        (function save(filename, content) {
            let blob = new Blob([content], { type: 'text/plain' }),
                anchor = document.createElement('a');

            anchor.download = filename;
            anchor.href = window.URL.createObjectURL(blob);
            anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
            anchor.click();
        })(filename, contentContainer.innerText);

        toNextChapter();
    }

    function toNextChapter() {
        setTimeout(() => {
            fetch("/getchapterlist.php?novelid=" + novelId, {"credentials": "include",})
                .then((resp) => resp.json())
                .then((data) => {
                    if (data.state == 200) {
                        let nextChapterId = chapterId + 1;
                        let vipMonthFlag = parseInt(
                                document.querySelector('#vip_month_flag') ?
                                document.querySelector('#vip_month_flag').innerText : 0
                            );

                        for (let value of data.body) {
                            let bookUrl = "";

                            value.chapterId = parseInt(value.chapterId);
                            value.vip_flag = parseInt(value.vip_flag)

                            if (value.chapterId != nextChapterId) continue;

                            if ((value.lockstatus == "authorlock" || value.isLock == 1) && vipMonthFlag == 0) {
                                // alert("下一章被作者鎖啦！");

                                // 直接跳過被鎖章節
                                nextChapterId++;
                                continue;
                            } else if (value.lockstatus == "managerlock" || value.isLock == 2) {
                                // alert("下一章被管理鎖啦！");

                                // 直接跳過被鎖章節
                                nextChapterId++;
                                continue;
                            } else if (vipMonthFlag > 0 && value.chapterId >= vipMonthFlag) {
                                bookUrl = 'http://my.jjwxc.net/onebook_vip.php?novelid=' + novelId + '&chapterid=' + value.chapterId;
                            } else if (value.vip_flag > 0 && value.chapterId >= value.vip_flag) {
                                bookUrl = 'http://my.jjwxc.net/onebook_vip.php?novelid=' + novelId + '&chapterid=' + value.chapterId;
                            } else {
                                bookUrl = 'http://www.jjwxc.net/onebook.php?novelid=' + novelId + '&chapterid=' + value.chapterId;
                            }

                            if (bookUrl) {
                                location.href = bookUrl;
                            }

                            return;
                        }

                        GM_setValue(autoDownloadControlKey, false);
                        alert("沒有更新的章節啦！");
                    } else {
                        alert("獲取下一章失敗！");
                    }
                })
        }, 3000);
    }
})();
