/**
 * hospital-data.js - 猛健樂醫院藥事解密密室逃脫任務 核心資料
 * 專為在職藥師與藥學實習生設計，精準還原 3 個關卡與 9 個分支線索
 */

const HOSPITAL_DATA = {
    title: "猛健樂醫院藥事解密任務",
    subtitle: "Mounjaro Hospital Pharmacy Escape Room",

    // 臨床藥師速查手冊 (仿單與指南)
    handbook: [
        {
            id: "guide_storage",
            category: "冷鏈與規格",
            title: "儲存溫控與 KwikPen 規格規範",
            icon: "❄️",
            text: "• 冷藏溫度：未使用的注射筆應儲存於 2°C 至 8°C 冰箱中，切勿結凍！若已結凍切勿使用（直接報廢）。\n• 室溫耐受：攜帶或使用中的筆，最高可在 30°C 室溫下存放長達 30 天。\n• 筆身規格：每支預充填多劑量筆含 4 個固定劑量，每劑固定注射體積為 0.6 mL。\n• 首次排氣：慢慢旋轉旋鈕需聽到 2 聲喀擦聲，劑量視窗顯示「長線條 (─)」；按住至藥液滴出。\n• 給藥確認：拔出針頭時視窗必須顯示「0」才代表成功給予完整 0.6 mL。\n• 安全原則：絕不可連同針頭保存；脫離針頭立即丟棄於防穿刺尖銳物收集桶！"
        },
        {
            id: "guide_safety",
            category: "警語與禁忌",
            title: "黑框警語、腫瘤風險與絕對禁忌",
            icon: "⚠️",
            text: "• 黑框警語：大鼠試驗發現引發甲狀腺 C 細胞腫瘤（含甲狀腺髓質癌 MTC）風險。\n• 衛教警訊：通報頸部腫塊、吞嚥困難、呼吸困難、持續性聲音嘶啞等甲狀腺腫瘤症狀。\n• 絕對禁忌症：(1) 個人或家族有甲狀腺髓質癌 (MTC) 病史者；(2) 第二型多發性內分泌腫瘤綜合症 (MEN 2) 病人。\n• 血糖適應症：改善第二型糖尿病 (T2D) 成人病人之血糖控制（飲食運動輔助）。\n• 體重管理門檻：初始 BMI ≥ 30 kg/m²（肥胖），或 BMI ≥ 27 且 < 30 kg/m² 且至少伴隨一項體重相關共病。"
        },
        {
            id: "guide_clinical",
            category: "滴定與交互作用",
            title: "階梯滴定、錯過劑量與藥物併用",
            icon: "💊",
            text: "• 滴定規劃：起始劑量為每週 2.5 mg 持續 4 週（不適合作為維持劑量）。後續每次調升 2.5 mg，每階至少維持滿 4 週，每週最大劑量上限為 15 mg。\n• 漏打應變：在漏打後 4 天（96 小時）內儘快補打；若超過 4 天則跳過該劑，依照原排程給予下一劑。\n• 改期規範：兩劑之間的時間間隔至少須為 3 天（72 小時）。\n• 口服避孕藥：猛健樂延遲胃排空，可能降低口服避孕藥吸收；應改用非口服避孕或於開始治療及每次調升劑量後增加屏障避孕法 4 週！\n• 胰島素併用：會增加低血糖風險；兩藥必須分開給藥（切勿混於同一針筒），可打於同一部位但不可緊鄰！"
        }
    ],

    // 道具庫
    inventoryItems: {
        item_keycard: {
            id: "item_keycard",
            name: "門禁感應磁卡",
            icon: "💳",
            desc: "醫院藥劑部中央冷鏈控制台吐出的電子門禁磁卡，可刷開門診審核室大門。"
        },
        item_prescriptions: {
            id: "item_prescriptions",
            name: "待審核門診處方箋",
            icon: "📋",
            desc: "包含三位門診病患的處方箋，急需藥師審核排除禁忌症風險。"
        },
        item_emergency_key: {
            id: "item_emergency_key",
            name: "急診諮詢室金屬鑰匙",
            icon: "🗝️",
            desc: "通過處方審核防線後掉落的高級權限金屬鑰匙，能打開急診藥事諮詢室大門。"
        },
        item_patient_records: {
            id: "item_patient_records",
            name: "急診臨床諮詢病歷卷宗",
            icon: "📁",
            desc: "記載複雜跨藥物交互作用、漏打劑量與避孕衛教評估的臨床諮詢病歷。"
        }
    },

    // 門診處方審核資料 (密室二 謎題 2-2)
    prescriptions: [
        {
            rxId: "RX-2026-001",
            patient: "張先生 (58歲)",
            dx: "第二型糖尿病合併肥胖 (BMI 32.4)",
            history: "母親曾罹患甲狀腺髓質癌 (MTC)，病患本人主訴頸部有摸到硬塊感。",
            rx: "Mounjaro KwikPen 2.5 mg/0.6 mL, 1支, 每週一次皮下注射",
            isSafe: false,
            reason: "【嚴重警報：處方攔截！】家族有甲狀腺髓質癌 (MTC) 史，屬於仿單絕對禁忌症！嚴禁調劑給藥！"
        },
        {
            rxId: "RX-2026-002",
            patient: "林女士 (35歲)",
            dx: "體重控制需求 (BMI 28.5，合併高血壓與血脂異常)",
            history: "無甲狀腺癌病史，無 MEN 2 遺傳病史，無胰臟炎病史。",
            rx: "Mounjaro KwikPen 2.5 mg/0.6 mL, 1支, 每週一次皮下注射",
            isSafe: true,
            reason: "【審核通過】符合過重 (BMI 27~30) 且具有一項以上共病之適應症，無禁忌症。"
        },
        {
            rxId: "RX-2026-003",
            patient: "陳先生 (42歲)",
            dx: "第二型糖尿病，代謝症候群",
            history: "基因檢測陽性，確診罹患第二型多發性內分泌腫瘤綜合症 (MEN 2)。",
            rx: "Mounjaro KwikPen 5.0 mg/0.6 mL, 1支, 每週一次皮下注射",
            isSafe: false,
            reason: "【嚴重警報：處方攔截！】確診 MEN 2 綜合症，屬於仿單絕對禁忌症！嚴禁開立調劑！"
        }
    ],

    // 三大密室關卡配置
    rooms: [
        {
            id: 1,
            name: "密室一：中央藥局－冷鏈與裝置控制室",
            background: "images/scenes/hospital_cold_storage.jpg",
            guide: {
                name: "藥劑部冷鏈品管藥師",
                avatar: "images/characters/companion_alchemist.jpg",
                dialog: "「糟了！中央藥局冷鏈門禁系統發生異常鎖死！控制台螢幕要求我們輸入 3 組關於猛健樂冷鏈儲存、KwikPen 規格排氣與廢棄規範的密碼線索，快翻開臨床手冊！」"
            },
            terminals: [
                {
                    id: "term_1_1",
                    title: "線索 1-1：冷鏈溫控極限終端",
                    icon: "❄️",
                    x: "28%",
                    y: "55%",
                    action: "openClue1_1"
                },
                {
                    id: "term_1_2",
                    title: "線索 1-2：KwikPen 規格與排氣檢定台",
                    icon: "⚙️",
                    x: "54%",
                    y: "62%",
                    action: "openClue1_2"
                },
                {
                    id: "term_1_3",
                    title: "線索 1-3：給藥完成與尖銳盒處置台",
                    icon: "🗑️",
                    x: "78%",
                    y: "50%",
                    action: "openClue1_3"
                }
            ]
        },
        {
            id: 2,
            name: "密室二：門診藥局－處方審核與安全防線",
            background: "images/scenes/pharmacy_dispensary.jpg",
            guide: {
                name: "門診調劑督導主任",
                avatar: "images/characters/hero_mentor.jpg",
                dialog: "「紅燈閃爍！處方攔截警報器大作！門診剛開立的一批猛健樂處方中含有潛在致命風險病史！我們必須解開黑框警語、攔截危險禁忌處方，並審核 BMI 門檻！」"
            },
            terminals: [
                {
                    id: "term_2_1",
                    title: "線索 2-1：黑框警語與腫瘤風險分析機",
                    icon: "⚠️",
                    x: "24%",
                    y: "58%",
                    action: "openClue2_1"
                },
                {
                    id: "term_2_2",
                    title: "線索 2-2：絕對禁忌症處方攔截終端",
                    icon: "🚨",
                    x: "52%",
                    y: "48%",
                    action: "openClue2_2"
                },
                {
                    id: "term_2_3",
                    title: "線索 2-3：適應症與適當對象 (BMI) 審核儀",
                    icon: "⚖️",
                    x: "76%",
                    y: "64%",
                    action: "openClue2_3"
                }
            ]
        },
        {
            id: 3,
            name: "密室三：急診藥事諮詢室－Final Mission",
            background: "images/scenes/emergency_room.jpg",
            guide: {
                name: "急診專案臨床藥師",
                avatar: "images/characters/npc_king.jpg",
                dialog: "「來到最後一道大門了！大門上的語音衛教審查閘門正在廣播急診病患的緊急諮詢：包含滴定調整、錯過劑量時間軸與口服避孕藥/胰島素交互作用！全力解開它，順利逃脫！」"
            },
            terminals: [
                {
                    id: "term_3_1",
                    title: "線索 3-1：階梯滴定與維持劑量定位盤",
                    icon: "📈",
                    x: "25%",
                    y: "60%",
                    action: "openClue3_1"
                },
                {
                    id: "term_3_2",
                    title: "線索 3-2：錯過劑量與改期應變時間軸",
                    icon: "⏱️",
                    x: "50%",
                    y: "46%",
                    action: "openClue3_2"
                },
                {
                    id: "term_3_3",
                    title: "線索 3-3：跨藥物交互作用與雙重給藥防線",
                    icon: "🛡️",
                    x: "75%",
                    y: "62%",
                    action: "openClue3_3"
                }
            ]
        }
    ]
};