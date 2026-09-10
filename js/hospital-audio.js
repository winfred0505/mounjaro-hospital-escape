/**
 * hospital-audio.js - 醫院藥劑部高科技電子音效與高臨場感懸疑急迫背景音樂合成引擎
 * 
 * 核心特色：
 * 1. 音量與頻響全面強化（Audibility Enhanced）：
 *    - 針對電腦喇叭、耳機與手機揚聲器頻響特性（300Hz~3500Hz 最敏感頻段）進行音色調校。
 *    - 低音加入泛音八度雙震盪（D2+D3），小喇叭也能清晰感受低頻暗湧律動。
 *    - 主旋律琶音調升至 4~5 八度（D4~D5），通透清澈、緊張急迫、絕不含糊！
 *    - 生理性心跳衝擊（Heartbeat）加入 160Hz 拳拳到肉的瞬態敲擊感。
 *    - BGM 主增益由 0.24 提升至 0.75，響度充足，緊張感立體撲面而來！
 * 2. 隨關卡逐步升級緊張感與節奏：
 *    - 密室一（冷鏈控制室）：120 BPM（沉浸懸疑、冷靜探索）
 *    - 密室二（門診藥局）：126 BPM（處方警報、危機迫近）
 *    - 密室三（急診諮詢室 Final Mission）：134 BPM（生死時速、極限決戰）
 * 3. 純原生 Web Audio API，零外部音檔延遲，首擊互動秒播！
 */

const NOTE_FREQS = {
    'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
};

class HospitalSoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.isInitialized = false;

        // BGM 狀態
        this.bgmPlaying = false;
        this.bgmTempo = 120; // BPM
        this.currentRoomId = 1;
        this.stepIndex = 0;
        this.nextStepTime = 0;
        this.schedulerInterval = null;
        this.isVictory = false;

        // 混音節點
        this.masterGain = null;
        this.bgmGain = null;
        this.sfxGain = null;

        // 64 拍 (4 小節) 16 分音符高清晰琶音序列 (D4~D5 人耳最敏感頻段)
        this.arpSequence = [
            // Bar 1: D minor 懸疑暗湧
            'D4', 'F4', 'A4', 'D5',  'F4', 'A4', 'D5', 'F5',  'D4', 'F4', 'A4', 'D5',  'F4', 'E4', 'D4', 'C4',
            // Bar 2: Bb Major 神秘轉折
            'Bb3', 'D4', 'F4', 'Bb4',  'D4', 'F4', 'Bb4', 'D5',  'Bb3', 'D4', 'F4', 'Bb4',  'A4', 'G4', 'F4', 'E4',
            // Bar 3: G minor / A7 危機迫近
            'G3', 'Bb3', 'D4', 'G4',  'Bb3', 'D4', 'G4', 'Bb4',  'A3', 'C#4', 'E4', 'A4',  'C#4', 'E4', 'G4', 'E4',
            // Bar 4: D minor 緊迫高潮與半音下行
            'D4', 'F4', 'A4', 'D5',  'C#5', 'D5', 'E5', 'D5',  'Bb4', 'A4', 'G4', 'F4',  'E4', 'F4', 'E4', 'C#4'
        ];

        // 低音八分音符律動 (含高泛音)
        this.bassSequence = [
            // Bar 1: D2
            'D2', null, 'D2', null, 'D2', null, 'D2', null, 'D2', null, 'D2', null, 'D2', null, 'F2', null,
            // Bar 2: Bb2 -> C3
            'Bb2', null, 'Bb2', null, 'Bb2', null, 'Bb2', null, 'Bb2', null, 'Bb2', null, 'C3', null, 'C3', null,
            // Bar 3: G2 -> A2
            'G2', null, 'G2', null, 'G2', null, 'G2', null, 'A2', null, 'A2', null, 'A2', null, 'A2', null,
            // Bar 4: D2 -> Eb2 危機半音
            'D2', null, 'D2', null, 'Eb2', null, 'Eb2', null, 'D2', null, 'D2', null, 'C#2', null, 'C#2', null
        ];
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // 建立動態壓縮器防破音並建立主控節點
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.setValueAtTime(-6, this.ctx.currentTime);
            this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
            this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
            this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
            this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
            this.compressor.connect(this.ctx.destination);

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
            this.masterGain.connect(this.compressor);

            // BGM 懸疑音樂總增益節點直接拉升至 2.5
            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.setValueAtTime(2.5, this.ctx.currentTime);
            this.bgmGain.connect(this.masterGain);

            // 音效音量
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    async ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
            } catch (e) {
                console.warn('AudioContext resume failed:', e);
            }
        }
    }

    toggleMute() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopBgm();
            if (this.masterGain) {
                this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
            }
        } else {
            if (this.masterGain) {
                this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
            }
            if (!this.isVictory) {
                this.startBgm();
            }
        }
        return this.enabled;
    }

    // ==========================================
    // 懸疑、緊張、急迫 Procedural BGM 排程與合成器
    // ==========================================

    async startBgm() {
        if (!this.enabled || this.isVictory) return;
        await this.ensureContext();
        if (!this.ctx) return;
        if (this.bgmPlaying) return;

        this.bgmPlaying = true;
        this.nextStepTime = this.ctx.currentTime + 0.05;
        this.stepIndex = 0;

        if (this.bgmGain) {
            this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.bgmGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            this.bgmGain.gain.linearRampToValueAtTime(2.5, this.ctx.currentTime + 0.5);
        }

        if (this.schedulerInterval) clearInterval(this.schedulerInterval);
        this.schedulerInterval = setInterval(() => this.scheduleLoop(), 35);
    }

    stopBgm() {
        this.bgmPlaying = false;
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
        if (this.bgmGain && this.ctx) {
            this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
            this.bgmGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        }
    }

    setRoomTheme(roomId) {
        this.currentRoomId = roomId;
        // 隨密室深入加速節奏，加劇壓迫感！
        if (roomId === 1) {
            this.bgmTempo = 120; // 密室一：冷靜懸疑
        } else if (roomId === 2) {
            this.bgmTempo = 126; // 密室二：處方警報緊迫
        } else if (roomId === 3) {
            this.bgmTempo = 134; // 密室三：急診時速極限倒數
        }
    }

    scheduleLoop() {
        if (!this.bgmPlaying || !this.ctx || !this.enabled) return;

        const lookAheadTime = 0.15; // 預先排程 150ms
        const stepDuration = (60 / this.bgmTempo) / 4; // 16 分音符時長

        while (this.nextStepTime < this.ctx.currentTime + lookAheadTime) {
            this.renderStep(this.stepIndex, this.nextStepTime, stepDuration);
            this.nextStepTime += stepDuration;
            this.stepIndex = (this.stepIndex + 1) % 64;
        }
    }

    renderStep(step, time, stepDur) {
        const barStep = step % 16;

        // 1. 生理性心跳重低音 (Lub-Dub Heartbeat)
        if (barStep === 0) {
            // 第 1 拍 Lub：拳拳到肉的有力心跳
            this.synthHeartbeat(time, 160, 52, 0.18, 1.0);
        } else if (barStep === 2) {
            // 第 1.5 拍 Dub：回彈心跳
            this.synthHeartbeat(time, 130, 46, 0.14, 0.75);
        } else if (barStep === 8) {
            // 第 3 拍 Lub
            this.synthHeartbeat(time, 155, 50, 0.17, 0.95);
        } else if (barStep === 10) {
            // 第 3.5 拍 Dub
            this.synthHeartbeat(time, 125, 44, 0.13, 0.70);
        }

        // 2. 倒數秒針急迫滴答聲 (Tense Stopwatch Tick)
        if (barStep === 4 || barStep === 12) {
            this.synthClockTick(time, true);
        } else if (step % 2 === 0) {
            this.synthClockTick(time, false);
        }

        // 3. 懸疑暗湧低音 (Suspense Saw Bassline - 雙八度強化)
        const bassNote = this.bassSequence[step];
        if (bassNote && NOTE_FREQS[bassNote]) {
            this.synthBass(NOTE_FREQS[bassNote], time, stepDur * 1.7);
        }

        // 4. 急迫 16 分音符電子琶音 (Urgent Synth Arp - 響亮通透)
        const arpNote = this.arpSequence[step];
        if (arpNote && NOTE_FREQS[arpNote]) {
            this.synthArp(NOTE_FREQS[arpNote], time, stepDur * 0.92, step);
        }

        // 5. 每小節鋪底懸疑氛圍音 (Dark Hospital Drone)
        if (step === 0) {
            this.synthDrone(NOTE_FREQS['D3'], NOTE_FREQS['A3'], time, stepDur * 16);
        } else if (step === 16) {
            this.synthDrone(NOTE_FREQS['Bb2'], NOTE_FREQS['F3'], time, stepDur * 16);
        } else if (step === 32) {
            this.synthDrone(NOTE_FREQS['G2'], NOTE_FREQS['D3'], time, stepDur * 16);
        } else if (step === 48) {
            this.synthDrone(NOTE_FREQS['A2'], NOTE_FREQS['E3'], time, stepDur * 16);
        }
    }

    // --- BGM 音色合成器原語 ---

    // 生理緊張心跳 (Lub-Dub)
    synthHeartbeat(time, startFreq, endFreq, dur, intensity) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // 採用正弦波 + 快速俯衝，在一般電腦小喇叭上也有震撼點擊感
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + dur);

        const vol = 0.55 * intensity;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + dur);
    }

    // 倒數急迫秒針 (Stopwatch Tick)
    synthClockTick(time, isAccent) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isAccent ? 3200 : 2400, time);
        osc.frequency.exponentialRampToValueAtTime(1000, time + 0.025);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(isAccent ? 1400 : 1800, time);

        const vol = isAccent ? 0.16 : 0.08;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + 0.03);
    }

    // 懸疑低音 (雙震盪鋸齒波，確保電腦小喇叭聽得見泛音)
    synthBass(freq, time, dur) {
        // 主音
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, time);

        // 高八度泛音震盪（提供穿透力）
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(580, time);
        filter.frequency.exponentialRampToValueAtTime(200, time + dur);
        filter.Q.value = 3.0;

        gain.gain.setValueAtTime(0.40, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + dur);
        osc2.stop(time + dur);
    }

    // 急迫 16 分音符電子琶音 (通透鋸齒波，富含懸疑緊繃感)
    synthArp(freq, time, dur, step) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        // 隨小節位置動態開闔截止頻率，創造呼吸感
        const dynamicCutoff = 1600 + 700 * Math.sin((step / 16) * Math.PI);
        filter.frequency.setValueAtTime(dynamicCutoff, time);
        filter.frequency.exponentialRampToValueAtTime(600, time + dur);
        filter.Q.value = 2.2;

        gain.gain.setValueAtTime(0.38, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + dur);
    }

    // 幽暗空靈長音 (氛圍 Pad)
    synthDrone(f1, f2, time, dur) {
        [f1, f2].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq + (i === 1 ? 1.2 : 0), time);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, time);

            gain.gain.setValueAtTime(0.001, time);
            gain.gain.linearRampToValueAtTime(0.12, time + dur * 0.25);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain);
            osc.start(time);
            osc.stop(time + dur);
        });
    }

    // ==========================================
    // 遊戲互動音效 (SFX)
    // ==========================================

    playBeep(freq = 900, duration = 0.04) {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.20, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain || this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playCardScan() {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1480, now);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playAlarm() {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const t = now + i * 0.18;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.linearRampToValueAtTime(880, t + 0.08);
            osc.frequency.linearRampToValueAtTime(600, t + 0.16);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);

            osc.connect(gain);
            gain.connect(this.sfxGain || this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.17);
        }
    }

    playDoubleClicks() {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [0, 0.12].forEach(delay => {
            const t = now + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(480, t);
            osc.frequency.exponentialRampToValueAtTime(120, t + 0.03);

            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

            osc.connect(gain);
            gain.connect(this.sfxGain || this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.03);
        });
    }

    playDoorUnlock() {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [587.33, 739.99, 880.00, 1174.66].forEach((freq, idx) => {
            const t = now + idx * 0.09;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain || this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    playPhoneRing() {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [0, 0.2].forEach(d => {
            const t = now + d;
            [440, 480].forEach(f => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, t);

                gain.gain.setValueAtTime(0.12, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

                osc.connect(gain);
                gain.connect(this.sfxGain || this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.15);
            });
        });
    }

    playVictory() {
        this.isVictory = true;
        this.stopBgm();
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chords = [
            [261.63, 329.63, 392.00],
            [293.66, 369.99, 440.00],
            [329.63, 415.30, 493.88],
            [523.25, 659.25, 783.99, 1046.50]
        ];

        chords.forEach((chord, i) => {
            const time = now + i * 0.32;
            chord.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time);

                gain.gain.setValueAtTime(0.16, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

                osc.connect(gain);
                gain.connect(this.sfxGain || this.ctx.destination);
                osc.start(time);
                osc.stop(time + 0.7);
            });
        });
    }
}

window.hospitalAudio = new HospitalSoundEngine();

// 監聽首次點擊或觸控，自動解鎖音訊上下文並啟動懸疑 BGM
['click', 'touchstart', 'pointerdown'].forEach(evtType => {
    document.addEventListener(evtType, () => {
        if (window.hospitalAudio && window.hospitalAudio.enabled && !window.hospitalAudio.bgmPlaying && !window.hospitalAudio.isVictory) {
            window.hospitalAudio.startBgm();
        }
    }, { once: false, passive: true });
});
