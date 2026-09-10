/**
 * hospital-engine.js - 醫院藥事解密遊戲引擎
 */

class HospitalInventory {
    constructor(engine) {
        this.engine = engine;
        this.items = [];
        this.selectedItem = null;
    }

    addItem(itemId) {
        if (!this.items.includes(itemId)) {
            this.items.push(itemId);
            if (window.hospitalAudio) window.hospitalAudio.playCardScan();
            this.render();
        }
    }

    has(itemId) {
        return this.items.includes(itemId);
    }

    selectItem(itemId) {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        this.selectedItem = (this.selectedItem === itemId) ? null : itemId;
        this.render();
    }

    inspectItem(itemId) {
        const item = HOSPITAL_DATA.inventoryItems[itemId];
        if (!item) return;
        alert(`💼【臨床公事包：${item.name}】\n${item.desc}`);
    }

    render() {
        const container = document.getElementById("inventory-slots");
        if (!container) return;
        container.innerHTML = "";

        if (this.items.length === 0) {
            container.innerHTML = `<div class="empty-bag-hint">（臨床公事包尚無文件與鑰匙）</div>`;
            return;
        }

        this.items.forEach(id => {
            const item = HOSPITAL_DATA.inventoryItems[id];
            if (!item) return;
            const isSel = (this.selectedItem === id);
            const slot = document.createElement("div");
            slot.className = `bag-slot ${isSel ? 'selected' : ''}`;
            slot.innerHTML = `
                <div class="slot-icon">${item.icon}</div>
                <div class="slot-name">${item.name}</div>
                <button class="slot-inspect" onclick="event.stopPropagation(); engine.inventory.inspectItem('${id}')" title="檢視細節">🔍</button>
            `;
            slot.onclick = () => this.selectItem(id);
            container.appendChild(slot);
        });
    }
}
class HospitalEscapeEngine {
    constructor() {
        this.currentRoomId = 1;
        this.inventory = new HospitalInventory(this);
        this.puzzleManager = new HospitalPuzzleManager(this);
        window.puzzleManager = this.puzzleManager;

        this.gameState = {
            // 密室一
            solved_1_1: false,
            solved_1_2: false,
            solved_1_3: false,
            room1Unlocked: false,

            // 密室二
            solved_2_1: false,
            solved_2_2: false,
            solved_2_3: false,
            room2Unlocked: false,

            // 密室三
            solved_3_1: false,
            solved_3_2: false,
            solved_3_3: false,
            gameCompleted: false,

            startTime: Date.now()
        };
    }

    init() {
        this.loadRoom(1);
        this.inventory.render();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById("btn-toggle-audio")?.addEventListener("click", () => {
            const isMuted = !window.hospitalAudio.toggleMute();
            document.getElementById("btn-toggle-audio").innerText = isMuted ? "🔇 靜音" : "🎵 音效";
        });

        document.getElementById("btn-handbook")?.addEventListener("click", () => {
            this.openHandbook();
        });

        document.getElementById("btn-hint")?.addEventListener("click", () => {
            this.giveHint();
        });
    }

    loadRoom(roomId) {
        this.currentRoomId = roomId;
        const room = HOSPITAL_DATA.rooms.find(r => r.id === roomId);
        if (!room) return;

        document.getElementById("room-name-display").innerText = room.name;
        document.getElementById("room-step-badge").innerText = `第 ${roomId} / 3 關`;

        const vp = document.getElementById("hospital-viewport");
        vp.style.backgroundImage = `url("${room.background}")`;

        // 導引藥師對話
        const guideBox = document.getElementById("guide-message-box");
        if (room.guide) {
            guideBox.style.display = "flex";
            document.getElementById("guide-avatar").src = room.guide.avatar;
            document.getElementById("guide-title").innerText = room.guide.name;
            document.getElementById("guide-dialog").innerText = room.guide.dialog;
        }

        this.renderTerminals(room);
    }

    renderTerminals(room) {
        const container = document.getElementById("terminals-container");
        container.innerHTML = "";

        room.terminals.forEach(term => {
            // 判斷此線索是否已解開
            let isSolved = false;
            if (term.action === "openClue1_1" && this.gameState.solved_1_1) isSolved = true;
            if (term.action === "openClue1_2" && this.gameState.solved_1_2) isSolved = true;
            if (term.action === "openClue1_3" && this.gameState.solved_1_3) isSolved = true;
            if (term.action === "openClue2_1" && this.gameState.solved_2_1) isSolved = true;
            if (term.action === "openClue2_2" && this.gameState.solved_2_2) isSolved = true;
            if (term.action === "openClue2_3" && this.gameState.solved_2_3) isSolved = true;
            if (term.action === "openClue3_1" && this.gameState.solved_3_1) isSolved = true;
            if (term.action === "openClue3_2" && this.gameState.solved_3_2) isSolved = true;
            if (term.action === "openClue3_3" && this.gameState.solved_3_3) isSolved = true;

            const el = document.createElement("div");
            el.className = `tech-terminal-node ${isSolved ? 'solved' : ''}`;
            el.style.left = term.x;
            el.style.top = term.y;
            el.title = term.title;
            el.innerHTML = `
                <div class="terminal-badge">
                    <span class="term-icon">${isSolved ? '✅' : term.icon}</span>
                    <span class="term-status-dot ${isSolved ? 'green' : 'amber'}"></span>
                </div>
                <div class="terminal-tag">${term.title} ${isSolved ? '(已解鎖)' : ''}</div>
            `;
            el.onclick = () => this.handleTerminalClick(term.action);
            container.appendChild(el);
        });
    }

    handleTerminalClick(action) {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        if (this.puzzleManager[action]) {
            this.puzzleManager[action]();
        }
    }

    goToRoom(roomId) {
        this.loadRoom(roomId);
    }

    refreshView() {
        this.loadRoom(this.currentRoomId);
    }

    openHandbook() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        const modal = document.getElementById("handbook-modal");
        let contentHtml = "";

        HOSPITAL_DATA.handbook.forEach(h => {
            contentHtml += `
                <div class="handbook-section">
                    <div class="handbook-sec-header">
                        <span class="badge-med">${h.category}</span>
                        <h4>${h.icon} ${h.title}</h4>
                    </div>
                    <pre class="handbook-sec-text">${h.text}</pre>
                </div>
            `;
        });

        document.getElementById("handbook-content").innerHTML = contentHtml;
        modal.classList.add("active");
    }

    closeHandbook() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        document.getElementById("handbook-modal")?.classList.remove("active");
    }

    giveHint() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        let hint = "";
        if (this.currentRoomId === 1) {
            hint = "💡【密室一提示】\n• 1-1：冷藏 2~8°C，室溫 30 度對應 30 天，結凍絕不可使用！\n• 1-2：每支 4 劑 0.6 mL，排氣聽到 2 聲喀擦，顯示長線條！\n• 1-3：拔針時必須顯示「0」，針頭不留筆、進防穿刺盒！";
        } else if (this.currentRoomId === 2) {
            hint = "💡【密室二提示】\n• 2-1：黑框警語為甲狀腺 C 細胞瘤 (MTC)，通報頸部腫塊/吞嚥/呼吸困難/嘶啞！\n• 2-2：攔截具有 MTC 與 MEN 2 病史的處方！\n• 2-3：適應症改善第二型糖尿病血糖；BMI 門檻為 30（肥胖）或 27（過重+共病）！";
        } else if (this.currentRoomId === 3) {
            hint = "💡【密室三提示】\n• 3-1：起始 2.5mg 維持 4 週（非維持量），每次調升 2.5mg 維持滿 4 週，上限 15mg！\n• 3-2：漏打 4 天 (96小時) 內補打，超過跳過；改期最小間隔 3 天 (72小時)！\n• 3-3：胃排空延遲需屏障避孕 4 週；與胰島素分開給藥且不可緊鄰！";
        }
        alert(hint);
    }

    showVictoryScreen() {
        // 切換主舞台背景至醫院大樓外觀（走出醫院大門逃脫成功！）
        const vp = document.getElementById("hospital-viewport");
        if (vp) {
            vp.style.backgroundImage = 'url("images/scenes/hospital_exterior.jpg")';
        }
        const sec = Math.floor((Date.now() - this.gameState.startTime) / 1000);
        const mins = Math.floor(sec / 60);
        const remSec = sec % 60;

        document.getElementById("escape-duration").innerText = `${mins} 分 ${remSec} 秒`;
        document.getElementById("victory-modal").classList.add("active");
    }

    restart() {
        if (window.hospitalAudio) window.hospitalAudio.playBeep();
        window.location.reload();
    }
}

window.HospitalEscapeEngine = HospitalEscapeEngine;