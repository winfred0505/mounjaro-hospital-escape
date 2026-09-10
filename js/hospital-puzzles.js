/**
 * hospital-puzzles.js - 醫院藥事解密三大關卡與 9 個分支線索交互邏輯
 */

class HospitalPuzzleManager {
    constructor(engine) {
        this.engine = engine;
        this.activeClueId = null;
    }

    closeModal() {
        this.activeClueId = null;
        const modal = document.getElementById('puzzle-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.innerHTML = '';
        }
    }

    // 分支線索 1-1：冷鏈溫控極限
    openClue1_1() {
        this.activeClueId = '1_1';
        const modal = document.getElementById('puzzle-modal');
        modal.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="term-title">❄️ 終端 1-1：冷鏈溫控極限監測面板</div>
                    <button class="btn-term-close" onclick="puzzleManager.closeModal()">✖</button>
                </div>
                <div class="terminal-body">
                    <p class="term-desc">系統提示：冷鏈控制室門禁已被溫控異常碼鎖定，請依仿單規範核實以下三個冷鏈極限參數：</p>
                    <div class="question-block">
                        <label class="q-label">(1) 未使用的猛健樂注射筆平時應冷藏於攝氏幾度環境？</label>
                        <div class="q-options">
                            <select id="q1_1_1" class="term-select">
                                <option value="">-- 請選擇冷藏溫度 --</option>
                                <option value="0-4">0°C 至 4°C</option>
                                <option value="2-8">2°C 至 8°C</option>
                                <option value="4-10">4°C 至 10°C</option>
                            </select>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(2) 攜帶出門或使用中的注射筆，最高可在幾度室溫下保存長達幾天？</label>
                        <div class="q-inputs-row">
                            <span>最高攝氏</span>
                            <input type="number" inputmode="numeric" id="q1_1_2_temp" class="term-input-short" placeholder="度C">
                            <span>°C 室溫下，最長保存</span>
                            <input type="number" inputmode="numeric" id="q1_1_2_days" class="term-input-short" placeholder="天數">
                            <span>天。</span>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(3) 若筆內藥液不幸結凍，退冰解凍後是否可繼續使用？</label>
                        <div class="q-options">
                            <select id="q1_1_3" class="term-select">
                                <option value="">-- 請選擇處置方式 --</option>
                                <option value="yes_shake">搖勻回溫後仍可正常使用</option>
                                <option value="no_discard">切勿使用（必須直接丟棄報廢）</option>
                            </select>
                        </div>
                    </div>
                    <div class="term-actions">
                        <button class="btn-tech-action" onclick="puzzleManager.verifyClue1_1()">⚡ 寫入參數並校驗</button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    verifyClue1_1() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        const a1 = document.getElementById('q1_1_1').value;
        const a2Temp = parseInt(document.getElementById('q1_1_2_temp').value, 10);
        const a2Days = parseInt(document.getElementById('q1_1_2_days').value, 10);
        const a3 = document.getElementById('q1_1_3').value;

        if (a1 === '2-8' && a2Temp === 30 && a2Days === 30 && a3 === 'no_discard') {
            if (window.hospitalAudio) window.hospitalAudio.playCardScan();
            this.engine.gameState.solved_1_1 = true;
            alert("✅【線索 1-1 校驗成功！】\n冷藏必須維持 2°C~8°C，室溫極限為 30°C 且最多 30 天，結凍藥品絕不可使用！\n第一組安全參數已覆寫！");
            this.closeModal();
            this.checkRoom1Status();
        } else {
            if (window.hospitalAudio) window.hospitalAudio.playAlarm();
            alert("❌【校驗失敗：參數不符仿單規範！】\n提示：請參閱手冊「冷鏈與規格」，注意冷藏 2~8°C、室溫 30 度對應 30 天，以及結凍絕不可使用！");
        }
    }
    // 分支線索 1-2：注射筆規格與排氣機械
    openClue1_2() {
        this.activeClueId = '1_2';
        const modal = document.getElementById('puzzle-modal');
        modal.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="term-title">⚙️ 終端 1-2：KwikPen 規格與排氣機械檢定</div>
                    <button class="btn-term-close" onclick="puzzleManager.closeModal()">✖</button>
                </div>
                <div class="terminal-body">
                    <p class="term-desc">系統提示：請校驗猛健樂多劑量注射筆的機械構件與初次給藥排氣程序：</p>
                    <div class="question-block">
                        <label class="q-label">(1) 每一支猛健樂預充填注射筆（KwikPen）含有幾劑固定劑量？每劑固定體積為多少 mL？</label>
                        <div class="q-inputs-row">
                            <span>含</span>
                            <input type="number" inputmode="numeric" id="q1_2_1_doses" class="term-input-short" placeholder="劑數">
                            <span>劑固定劑量，每劑為</span>
                            <input type="number" step="0.1" inputmode="decimal" id="q1_2_1_vol" class="term-input-short" placeholder="mL">
                            <span>mL。</span>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(2) 首次給藥進行排氣（灌注）時，慢慢旋轉旋鈕需聽到幾聲「喀擦聲」？</label>
                        <div class="q-options">
                            <select id="q1_2_2_clicks" class="term-select">
                                <option value="">-- 請選擇次數 --</option>
                                <option value="1">聽到 1 聲喀擦聲</option>
                                <option value="2">聽到 2 聲喀擦聲</option>
                                <option value="3">聽到 3 聲喀擦聲</option>
                            </select>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(3) 此時劑量視窗會顯示什麼圖示代表排氣刻度已就緒？</label>
                        <div class="q-options">
                            <select id="q1_2_3_icon" class="term-select">
                                <option value="">-- 請選擇圖示 --</option>
                                <option value="zero">數字「0」</option>
                                <option value="line">長線條「─」</option>
                                <option value="droplet">水滴符號「💧」</option>
                            </select>
                        </div>
                    </div>
                    <div class="term-actions">
                        <button class="btn-tech-action" onclick="puzzleManager.verifyClue1_2()">⚡ 測試機械構件</button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    verifyClue1_2() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        const doses = parseInt(document.getElementById('q1_2_1_doses').value, 10);
        const vol = parseFloat(document.getElementById('q1_2_1_vol').value);
        const clicks = document.getElementById('q1_2_2_clicks').value;
        const icon = document.getElementById('q1_2_3_icon').value;

        if (doses === 4 && Math.abs(vol - 0.6) < 0.05 && clicks === '2' && icon === 'line') {
            if (window.hospitalAudio) {
                window.hospitalAudio.playDoubleClicks();
                setTimeout(() => window.hospitalAudio.playCardScan(), 300);
            }
            this.engine.gameState.solved_1_2 = true;
            alert("✅【線索 1-2 檢定通過！】\n喀擦！喀擦！成功還原 2 聲喀擦聲！每支 4 劑固定 0.6 mL，排氣時視窗精準對齊「長線條 (─)」！");
            this.closeModal();
            this.checkRoom1Status();
        } else {
            if (window.hospitalAudio) window.hospitalAudio.playAlarm();
            alert("❌【檢定失敗：機械規格或排氣數值有誤！】\n提示：請查閱使用說明步驟七。每支筆 4 劑固定 0.6 mL，旋轉聽到 2 聲喀擦且視窗顯示長線條！");
        }
    }

    // 分支線索 1-3：給藥完成判定與安全廢棄
    openClue1_3() {
        this.activeClueId = '1_3';
        const modal = document.getElementById('puzzle-modal');
        modal.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="term-title">🗑️ 終端 1-3：給藥完成判定與廢棄處置台</div>
                    <button class="btn-term-close" onclick="puzzleManager.closeModal()">✖</button>
                </div>
                <div class="terminal-body">
                    <p class="term-desc">系統提示：皮下給藥後的完成確認與針頭防護是藥事感控的核心，請完成下列兩項檢定：</p>
                    <div class="question-block">
                        <label class="q-label">(1) 當完成皮下注射將針頭拔出皮膚時，劑量視窗必須顯示什麼數字圖示，才代表已成功給予完整的 0.6 mL 藥量？</label>
                        <div class="q-options">
                            <select id="q1_3_1" class="term-select">
                                <option value="">-- 請選擇數值 --</option>
                                <option value="0">顯示數字「0」</option>
                                <option value="1">顯示數字「1」</option>
                                <option value="4">顯示數字「4」</option>
                            </select>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(2) 注射結束後，可以將針頭留在筆上放回冰箱保存嗎？脫離的針頭應丟棄於何處？</label>
                        <div class="q-options">
                            <select id="q1_3_2" class="term-select">
                                <option value="">-- 請選擇處置方式 --</option>
                                <option value="safe_leave">可以留在筆上，直接放回冰箱</option>
                                <option value="strict_sharps">絕不可連針頭保存（避免漏液與空氣進入）；針頭必須丟棄於防穿刺尖銳物保存容器</option>
                                <option value="trash_can">卸下後以衛生紙包覆，丟入一般生活垃圾桶</option>
                            </select>
                        </div>
                    </div>
                    <div class="term-actions">
                        <button class="btn-tech-action" onclick="puzzleManager.verifyClue1_3()">⚡ 提交感控確認</button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    verifyClue1_3() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        const a1 = document.getElementById('q1_3_1').value;
        const a2 = document.getElementById('q1_3_2').value;

        if (a1 === '0' && a2 === 'strict_sharps') {
            if (window.hospitalAudio) window.hospitalAudio.playCardScan();
            this.engine.gameState.solved_1_3 = true;
            alert("✅【線索 1-3 檢定通過！】\n視窗回到「0」確認完成完整劑量注入！嚴格恪守針頭不留筆、卸下針頭投入防穿刺尖銳物桶的安全規範！");
            this.closeModal();
            this.checkRoom1Status();
        } else {
            if (window.hospitalAudio) window.hospitalAudio.playAlarm();
            alert("❌【感控警報：判定數值或廢棄處置錯誤！】\n提示：拔針時視窗必須回到「0」，且針頭絕不可留在筆上、必須丟入防穿刺容器！");
        }
    }

    checkRoom1Status() {
        const s = this.engine.gameState;
        if (s.solved_1_1 && s.solved_1_2 && s.solved_1_3 && !s.room1Unlocked) {
            s.room1Unlocked = true;
            if (window.hospitalAudio) window.hospitalAudio.playDoorUnlock();
            this.engine.inventory.addItem('item_keycard');
            this.engine.inventory.addItem('item_prescriptions');
            alert("🔓 嗶————冷鏈控制台電子門禁全數解鎖！\n系統出槽口掉落【門禁感應磁卡】與【待審核門診處方箋】！\n團隊成功刷開儲備室大門，進入密室二：門診藥局！");
            this.engine.goToRoom(2);
        } else {
            this.engine.refreshView();
        }
    }
    // 分支線索 2-1：黑框警語與腫瘤風險
    openClue2_1() {
        this.activeClueId = '2_1';
        const modal = document.getElementById('puzzle-modal');
        modal.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="term-title">⚠️ 終端 2-1：黑框警語與腫瘤風險分析機</div>
                    <button class="btn-term-close" onclick="puzzleManager.closeModal()">✖</button>
                </div>
                <div class="terminal-body">
                    <p class="term-desc">系統警報：請分析 tirzepatide 仿單黑框警語中關於腫瘤風險與臨床衛教症狀：</p>
                    <div class="question-block">
                        <label class="q-label">(1) 在大鼠試驗中，tirzepatide 發現具有引發何種特定腫瘤的風險？</label>
                        <div class="q-options">
                            <select id="q2_1_tumor" class="term-select">
                                <option value="">-- 請選擇腫瘤類型 --</option>
                                <option value="liver">肝細胞癌 (HCC)</option>
                                <option value="thyroid_c">甲狀腺 C 細胞腫瘤（包括甲狀腺髓質癌 MTC）</option>
                                <option value="renal">腎細胞腺癌 (RCC)</option>
                            </select>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(2) 衛教時應告知病人主動通報哪些相關甲狀腺腫瘤的臨床症狀？（請全選正確項）</label>
                        <div class="q-checkbox-group">
                            <label><input type="checkbox" id="sym_neck"> 頸部腫塊</label>
                            <label><input type="checkbox" id="sym_swallow"> 吞嚥困難</label>
                            <label><input type="checkbox" id="sym_breath"> 呼吸困難</label>
                            <label><input type="checkbox" id="sym_voice"> 持續性的聲音嘶啞</label>
                            <label><input type="checkbox" id="sym_edema"> 下肢水腫 (干擾項)</label>
                        </div>
                    </div>
                    <div class="term-actions">
                        <button class="btn-tech-action" onclick="puzzleManager.verifyClue2_1()">⚡ 提交黑框警語審查</button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    verifyClue2_1() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        const tumor = document.getElementById('q2_1_tumor').value;
        const sNeck = document.getElementById('sym_neck').checked;
        const sSwallow = document.getElementById('sym_swallow').checked;
        const sBreath = document.getElementById('sym_breath').checked;
        const sVoice = document.getElementById('sym_voice').checked;
        const sEdema = document.getElementById('sym_edema').checked;

        if (tumor === 'thyroid_c' && sNeck && sSwallow && sBreath && sVoice && !sEdema) {
            if (window.hospitalAudio) window.hospitalAudio.playCardScan();
            this.engine.gameState.solved_2_1 = true;
            alert("✅【線索 2-1 審查通過！】\n確認黑框警語載明甲狀腺 C 細胞瘤 (MTC) 風險，並準確標記頸部腫塊、吞嚥/呼吸困難、持續聲音嘶啞四大通報症狀！");
            this.closeModal();
            this.checkRoom2Status();
        } else {
            if (window.hospitalAudio) window.hospitalAudio.playAlarm();
            alert("❌【審查失敗：警語項目或症狀勾選不完整！】\n提示：請參閱仿單最上方黑框警語！症狀包含頸部腫塊、吞嚥、呼吸困難及嘶啞聲音！");
        }
    }

    // 分支線索 2-2：絕對禁忌症處方攔截
    openClue2_2() {
        this.activeClueId = '2_2';
        const modal = document.getElementById('puzzle-modal');
        let rxCards = '';

        HOSPITAL_DATA.prescriptions.forEach((rx, idx) => {
            rxCards += `
                <div class="rx-review-card" id="rx-card-${idx}">
                    <div class="rx-header">
                        <span class="rx-id">${rx.rxId}</span>
                        <span class="rx-pt">${rx.patient}</span>
                    </div>
                    <div class="rx-body">
                        <div><strong>診斷：</strong>${rx.dx}</div>
                        <div><strong>病史記載：</strong><span class="rx-history-text">${rx.history}</span></div>
                        <div><strong>處方內容：</strong><code>${rx.rx}</code></div>
                    </div>
                    <div class="rx-actions">
                        <button class="btn-rx-action btn-intercept" onclick="puzzleManager.judgeRx(${idx}, false)">🚨 處方攔截 (絕對禁忌)</button>
                        <button class="btn-rx-action btn-pass" onclick="puzzleManager.judgeRx(${idx}, true)">✅ 審核合格 (放行調劑)</button>
                    </div>
                    <div class="rx-result-feedback" id="rx-feed-${idx}"></div>
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="terminal-window" style="max-width:760px;">
                <div class="terminal-header">
                    <div class="term-title">🚨 終端 2-2：門診處方安全性攔截系統</div>
                    <button class="btn-term-close" onclick="puzzleManager.closeModal()">✖</button>
                </div>
                <div class="terminal-body">
                    <p class="term-desc">系統警報大作！猛健樂嚴禁使用於 (1) 個人或家族有甲狀腺髓質癌 (MTC) 病史；(2) 第二型多發性內分泌腫瘤綜合症 (MEN 2) 患者。請逐筆審核下列處方：</p>
                    <div class="rx-list-container">
                        ${rxCards}
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
        this.rxJudgments = {};
    }

    judgeRx(index, userSaysSafe) {
        const rx = HOSPITAL_DATA.prescriptions[index];
        const feed = document.getElementById(`rx-feed-${index}`);
        const card = document.getElementById(`rx-card-${index}`);

        if (userSaysSafe === rx.isSafe) {
            if (window.hospitalAudio) window.hospitalAudio.playCardScan();
            this.rxJudgments[index] = true;
            card.classList.add('reviewed-correct');
            feed.className = 'rx-result-feedback success';
            feed.innerText = `判定正確！${rx.reason}`;
        } else {
            if (window.hospitalAudio) window.hospitalAudio.playAlarm();
            this.rxJudgments[index] = false;
            card.classList.remove('reviewed-correct');
            feed.className = 'rx-result-feedback error';
            feed.innerText = `判定錯誤！仿單警示：${rx.reason}`;
        }

        if (this.rxJudgments[0] && this.rxJudgments[1] && this.rxJudgments[2]) {
            setTimeout(() => {
                if (window.hospitalAudio) window.hospitalAudio.playCardScan();
                this.engine.gameState.solved_2_2 = true;
                alert("🎉【線索 2-2 攔截成功！】\n藥師成功及時攔截了 MTC 家族史與 MEN 2 兩張危險處方，守護了病人生命安全！");
                this.closeModal();
                this.checkRoom2Status();
            }, 500);
        }
    }

    // 分支線索 2-3：適應症與適當對象 (BMI)
    openClue2_3() {
        this.activeClueId = '2_3';
        const modal = document.getElementById('puzzle-modal');
        modal.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="term-title">⚖️ 終端 2-3：適應症與適當對象 (BMI) 審核儀</div>
                    <button class="btn-term-close" onclick="puzzleManager.closeModal()">✖</button>
                </div>
                <div class="terminal-body">
                    <p class="term-desc">系統提示：請校準猛健樂在第二型糖尿病與慢性體重控制的臨床適應症門檻：</p>
                    <div class="question-block">
                        <label class="q-label">(1) 猛健樂在血糖控制上的主要適應症為何？</label>
                        <div class="q-options">
                            <select id="q2_3_t2d" class="term-select">
                                <option value="">-- 請選擇血糖適應症 --</option>
                                <option value="t1d">第一型糖尿病的替代胰島素療法</option>
                                <option value="t2d_adjunct">作為飲食及運動療法之外的輔助治療，改善第二型糖尿病成人病人之血糖控制</option>
                            </select>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(2) 用於慢性體重控制時，適用成人在初始身體質量指數（BMI）上有何門檻規定？</label>
                        <div class="q-inputs-row" style="flex-direction:column; align-items:flex-start; gap:8px;">
                            <div>
                                • 初始 BMI ≥ <input type="number" inputmode="numeric" id="q2_3_bmi_obese" class="term-input-short" placeholder="30"> kg/m²（肥胖）
                            </div>
                            <div>
                                • 或初始 BMI ≥ <input type="number" inputmode="numeric" id="q2_3_bmi_overweight" class="term-input-short" placeholder="27"> kg/m² 且至少患有一項體重相關共病者。
                            </div>
                        </div>
                    </div>
                    <div class="term-actions">
                        <button class="btn-tech-action" onclick="puzzleManager.verifyClue2_3()">⚡ 鎖定適應症門檻</button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    verifyClue2_3() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        const t2d = document.getElementById('q2_3_t2d').value;
        const bmiObese = parseInt(document.getElementById('q2_3_bmi_obese').value, 10);
        const bmiOver = parseInt(document.getElementById('q2_3_bmi_overweight').value, 10);

        if (t2d === 't2d_adjunct' && bmiObese === 30 && bmiOver === 27) {
            if (window.hospitalAudio) window.hospitalAudio.playCardScan();
            this.engine.gameState.solved_2_3 = true;
            alert("✅【線索 2-3 審核通過！】\n血糖適應症為 T2D 飲食運動輔助；體重控制精準鎖定 BMI≥30 或 BMI≥27+共病門檻！");
            this.closeModal();
            this.checkRoom2Status();
        } else {
            if (window.hospitalAudio) window.hospitalAudio.playAlarm();
            alert("❌【校驗失敗：適應症定義或 BMI 數值有誤！】\n提示：糖尿病限改善第2型成人血糖；體重控制初始 BMI 為 30（肥胖）或 27（過重+共病）！");
        }
    }

    checkRoom2Status() {
        const s = this.engine.gameState;
        if (s.solved_2_1 && s.solved_2_2 && s.solved_2_3 && !s.room2Unlocked) {
            s.room2Unlocked = true;
            if (window.hospitalAudio) window.hospitalAudio.playDoorUnlock();
            this.engine.inventory.addItem('item_emergency_key');
            this.engine.inventory.addItem('item_patient_records');
            alert("🔓 警報解除！綠燈亮起！\n處方安全審核系統列印出【急診臨床諮詢病歷檔案】，並掉落【急診諮詢室金屬鑰匙】！\n團隊成功開啟大門，進入密室三：急診藥事諮詢室！");
            this.engine.goToRoom(3);
        } else {
            this.engine.refreshView();
        }
    }
    // 分支線索 3-1：階梯滴定與維持劑量定位
    openClue3_1() {
        this.activeClueId = '3_1';
        const modal = document.getElementById('puzzle-modal');
        modal.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="term-title">📈 終端 3-1：階梯滴定與維持劑量定位盤</div>
                    <button class="btn-term-close" onclick="puzzleManager.closeModal()">✖</button>
                </div>
                <div class="terminal-body">
                    <p class="term-desc">急診臨床語音審查：請解答猛健樂階梯劑量遞增時間表與最大劑量限制：</p>
                    <div class="question-block">
                        <label class="q-label">(1) 猛健樂建議的起始劑量與持續週數為何？2.5 mg 是否可以作為長期的維持劑量？</label>
                        <div class="q-inputs-row" style="flex-wrap:wrap; gap:8px;">
                            <span>起始每週一次</span>
                            <input type="number" step="0.5" inputmode="decimal" id="q3_1_start" class="term-input-short" placeholder="mg">
                            <span>mg，持續</span>
                            <input type="number" inputmode="numeric" id="q3_1_weeks" class="term-input-short" placeholder="週數">
                            <span>週。能否作為長期維持劑量？</span>
                            <select id="q3_1_is_maint" class="term-select" style="width:auto;">
                                <option value="">-- 請選擇 --</option>
                                <option value="no">否（不適合作為維持劑量）</option>
                                <option value="yes">是（可以永久維持）</option>
                            </select>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(2) 後續若需逐次調升劑量，每次調升的單位是多少？在當前劑量至少需維持滿多久？每週最大劑量上限是多少？</label>
                        <div class="q-inputs-row" style="flex-wrap:wrap; gap:8px;">
                            <span>每次調升</span>
                            <input type="number" step="0.5" inputmode="decimal" id="q3_1_step" class="term-input-short" placeholder="mg">
                            <span>mg；當前劑量至少維持</span>
                            <input type="number" inputmode="numeric" id="q3_1_stay_weeks" class="term-input-short" placeholder="週數">
                            <span>週；每週最大劑量上限為</span>
                            <input type="number" inputmode="numeric" id="q3_1_max" class="term-input-short" placeholder="mg">
                            <span>mg。</span>
                        </div>
                    </div>
                    <div class="term-actions">
                        <button class="btn-tech-action" onclick="puzzleManager.verifyClue3_1()">⚡ 傳輸滴定時間軸</button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    verifyClue3_1() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        const start = parseFloat(document.getElementById('q3_1_start').value);
        const w1 = parseInt(document.getElementById('q3_1_weeks').value, 10);
        const isMaint = document.getElementById('q3_1_is_maint').value;
        const step = parseFloat(document.getElementById('q3_1_step').value);
        const stayW = parseInt(document.getElementById('q3_1_stay_weeks').value, 10);
        const maxDose = parseInt(document.getElementById('q3_1_max').value, 10);

        if (Math.abs(start - 2.5) < 0.1 && w1 === 4 && isMaint === 'no' &&
            Math.abs(step - 2.5) < 0.1 && stayW === 4 && maxDose === 15) {
            if (window.hospitalAudio) window.hospitalAudio.playCardScan();
            this.engine.gameState.solved_3_1 = true;
            alert("✅【線索 3-1 審查通過！】\n起始 2.5mg 維持 4 週且不可作維持劑量；每次調升 2.5mg 且需維持滿 4 週；最大上限為 15mg！");
            this.closeModal();
            this.checkRoom3Status();
        } else {
            if (window.hospitalAudio) window.hospitalAudio.playAlarm();
            alert("❌【滴定參數錯誤！】\n提示：起始 2.5mg 持續 4 週（非維持量），每次遞增 2.5mg（每階至少4週），上限為 15mg！");
        }
    }

    // 分支線索 3-2：錯過劑量與改期應變時間軸
    openClue3_2() {
        this.activeClueId = '3_2';
        const modal = document.getElementById('puzzle-modal');
        modal.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="term-title">⏱️ 終端 3-2：錯過劑量與改期應變時間軸</div>
                    <button class="btn-term-close" onclick="puzzleManager.closeModal()">✖</button>
                </div>
                <div class="terminal-body">
                    <p class="term-desc">急診電話響起！病患詢問漏打猛健樂與更改施打星期的應變處置：</p>
                    <div class="question-block">
                        <label class="q-label">(1) 若病人忘記打針，在漏打後最長幾天（幾小時）內應儘快補打？若已超過該時間應如何處置？</label>
                        <div class="q-inputs-row" style="flex-wrap:wrap; gap:8px;">
                            <span>最長於漏打後</span>
                            <input type="number" inputmode="numeric" id="q3_2_miss_days" class="term-input-short" placeholder="天數">
                            <span>天（</span>
                            <input type="number" inputmode="numeric" id="q3_2_miss_hrs" class="term-input-short" placeholder="小時">
                            <span>小時）內補打；若超過則應：</span>
                            <select id="q3_2_miss_action" class="term-select">
                                <option value="">-- 請選擇逾期處置 --</option>
                                <option value="double">下次施打時給予雙倍劑量補回</option>
                                <option value="skip">跳過錯過的劑量，於原本預定日期給予下一劑</option>
                            </select>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(2) 若要更改每週固定給藥日期，兩劑之間的時間間隔至少須為幾天（幾小時）？</label>
                        <div class="q-inputs-row" style="flex-wrap:wrap; gap:8px;">
                            <span>兩劑間隔至少須為</span>
                            <input type="number" inputmode="numeric" id="q3_2_resched_days" class="term-input-short" placeholder="天數">
                            <span>天（</span>
                            <input type="number" inputmode="numeric" id="q3_2_resched_hrs" class="term-input-short" placeholder="小時">
                            <span>小時）。</span>
                        </div>
                    </div>
                    <div class="term-actions">
                        <button class="btn-tech-action" onclick="puzzleManager.verifyClue3_2()">⚡ 確認應變時間軸</button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    verifyClue3_2() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        const d1 = parseInt(document.getElementById('q3_2_miss_days').value, 10);
        const h1 = parseInt(document.getElementById('q3_2_miss_hrs').value, 10);
        const act = document.getElementById('q3_2_miss_action').value;
        const d2 = parseInt(document.getElementById('q3_2_resched_days').value, 10);
        const h2 = parseInt(document.getElementById('q3_2_resched_hrs').value, 10);

        if (d1 === 4 && h1 === 96 && act === 'skip' && d2 === 3 && h2 === 72) {
            if (window.hospitalAudio) window.hospitalAudio.playCardScan();
            this.engine.gameState.solved_3_2 = true;
            alert("✅【線索 3-2 應變時間軸校準正確！】\n漏打在 4天 (96小時) 內儘快補打，逾期跳過；改期最小間隔為 3天 (72小時)！");
            this.closeModal();
            this.checkRoom3Status();
        } else {
            if (window.hospitalAudio) window.hospitalAudio.playAlarm();
            alert("❌【時間軸判定錯誤！】\n提示：補打窗口是 4 天（96 小時），超過跳過（切勿雙倍）；改期最小間隔是 3 天（72 小時）！");
        }
    }

    // 分支線索 3-3：跨藥物交互作用與雙重給藥防線
    openClue3_3() {
        this.activeClueId = '3_3';
        const modal = document.getElementById('puzzle-modal');
        modal.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="term-title">🛡️ 終端 3-3：跨藥物交互作用與雙重給藥防線</div>
                    <button class="btn-term-close" onclick="puzzleManager.closeModal()">✖</button>
                </div>
                <div class="terminal-body">
                    <p class="term-desc">終極語音閘門：請完成口服避孕藥與胰島素併用的臨床給藥與藥理審查：</p>
                    <div class="question-block">
                        <label class="q-label">(1) 對於同時使用口服荷爾蒙避孕藥之女性，開始猛健樂或調升劑量後應如何指導？其藥理機制為何？</label>
                        <div class="q-options">
                            <select id="q3_3_contraception" class="term-select">
                                <option value="">-- 請選擇避孕指導與機制 --</option>
                                <option value="no_effect">兩者完全無交互作用，照常口服即可</option>
                                <option value="delayed_gastric">猛健樂延遲胃排空降低口服藥吸收；建議改用非口服避孕，或於開始及每次加量後增加屏障避孕法 4 週！</option>
                            </select>
                        </div>
                    </div>
                    <div class="question-block">
                        <label class="q-label">(2) 當猛健樂與胰島素併用時有何風險？兩藥在注射方式與注射位置上有何嚴格規範？</label>
                        <div class="q-options">
                            <select id="q3_3_insulin" class="term-select">
                                <option value="">-- 請選擇胰島素併用規範 --</option>
                                <option value="mix_same">會增加高血糖風險；兩藥可混合於同一注射針筒內同時施打</option>
                                <option value="separate_strict">會增加低血糖風險；兩藥必須分開給予切勿混用；可打於同一部位（如腹部），但注射位置不可緊鄰！</option>
                            </select>
                        </div>
                    </div>
                    <div class="term-actions">
                        <button class="btn-tech-action" onclick="puzzleManager.verifyClue3_3()">⚡ 提交終極藥事防線審核</button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    verifyClue3_3() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        const a1 = document.getElementById('q3_3_contraception').value;
        const a2 = document.getElementById('q3_3_insulin').value;

        if (a1 === 'delayed_gastric' && a2 === 'separate_strict') {
            if (window.hospitalAudio) window.hospitalAudio.playCardScan();
            this.engine.gameState.solved_3_3 = true;
            alert("✅【線索 3-3 審核完全正確！】\n延遲胃排空降低避孕藥療效需增加屏障法 4 週；與胰島素併用分開給藥且位置不可緊鄰！");
            this.closeModal();
            this.checkRoom3Status();
        } else {
            if (window.hospitalAudio) window.hospitalAudio.playAlarm();
            alert("❌【交互作用審核未通過！】\n提示：胃排空延遲需屏障避孕 4 週；與胰島素分開給藥且不可緊鄰！");
        }
    }

    checkRoom3Status() {
        const s = this.engine.gameState;
        if (s.solved_3_1 && s.solved_3_2 && s.solved_3_3 && !s.gameCompleted) {
            s.gameCompleted = true;
            if (window.hospitalAudio) window.hospitalAudio.playVictory();
            this.engine.showVictoryScreen();
        } else {
            this.engine.refreshView();
        }
    }
}

window.HospitalPuzzleManager = HospitalPuzzleManager;