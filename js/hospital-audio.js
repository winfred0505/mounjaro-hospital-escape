/**
 * hospital-audio.js - 醫院藥劑部高科技電子音效與懸疑急迫背景音樂合成引擎
 * 特色：
 * 1. 懸疑、緊張、急迫 Procedural BGM 合成器：
 *    - Layer 1: 生理緊張心跳重低音 (Lub-Dub Tachycardia 心跳脈動)
 *    - Layer 2: 倒數秒針急迫滴答聲 (Tense Stopwatch Tick)
 *    - Layer 3: 懸疑推進低音 (D minor 8分音符 Sawtooth 濾波律動)
 *    - Layer 4: 急迫 16分音符電子琶音 (John Carpenter / 密室逃脫驚悚動能)
 *    - Layer 5: 幽暗空靈長音 (醫院走廊神經緊繃氛圍 Drone)
 * 2. 隨關卡逐步升級緊張感與節奏：
 *    - 密室一（冷鏈控制室）：120 BPM（沉浸懸疑、冷靜探索）
 *    - 密室二（門診藥局）：126 BPM（處方警報、危機迫近）
 *    - 密室三（急診諮詢室 Final Mission）：134 BPM（生死時速、極限決戰）
 * 3. 完整 Web Audio API 合成，零外部依賴、首擊自動解鎖、無延遲、支援手機/平板/電腦！
 */

const NOTE_FREQS = {
    'D1': 36.71, 'Eb1': 38.89, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'Bb1': 58.27, 'C2': 65.41,
    'C#2': 69.30, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00
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

        // 64 拍 (4 小節) 16 分音符琶音序列
        this.arpSequence = [
            // Bar 1: D minor 懸疑暗湧
            'D3', 'F3', 'A3', 'D4',  'F3', 'A3', 'D4', 'F4',  'D3', 'F3', 'A3', 'D4',  'F3', 'E3', 'D3', 'C3',
            // Bar 2: Bb Major 神秘轉折
            'Bb2', 'D3', 'F3', 'Bb3',  'D3', 'F3', 'Bb3', 'D4',  'Bb2', 'D3', 'F3', 'Bb3',  'A3', 'G3', 'F3', 'E3',
            // Bar 3: G minor / A7 危機迫近
            'G2', 'Bb2', 'D3', 'G3',  'Bb2', 'D3', 'G3', 'Bb3',  'A2', 'C#3', 'E3', 'A3',  'C#3', 'E3', 'G3', 'E3',
            // Bar 4: D minor 緊迫高潮與半音下行
            'D3', 'F3', 'A3', 'D4',  'C#4', 'D4', 'E4', 'D4',  'Bb3', 'A3', 'G3', 'F3',  'E3', 'F3', 'E3', 'C#3'
        ];

        // 低音八分音符律動
        this.bassSequence = [
            // Bar 1: D2
            'D2', null, 'D2', null, 'D2', null, 'D2', null, 'D2', null, 'D2', null, 'D2', null, 'F2', null,
            // Bar 2: Bb1 -> C2
            'Bb1', null, 'Bb1', null, 'Bb1', null, 'Bb1', null, 'Bb1', null, 'Bb1', null, 'C2', null, 'C2', null,
            // Bar 3: G1 -> A1
            'G1', null, 'G1', null, 'G1', null, 'G1', null, 'A1', null, 'A1', null, 'A1', null, 'A1', null,
            // Bar 4: D2 -> Eb2 危機半音
            'D2', null, 'D2', null, 'Eb2', null, 'Eb2', null, 'D2', null, 'D2', null, 'C#2', null, 'C#2', null
        ];
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // 建立主控與分軌混音節點
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.setValueAtTime(0.24, this.ctx.currentTime); // 懸疑音樂音量
            this.bgmGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime); // 效果音量
            this.sfxGain.connect(this.masterGain);

            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
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

    startBgm() {
        if (!this.enabled || this.isVictory) return;
        this.ensureContext();
        if (!this.ctx) return;
        if (this.bgmPlaying) return;

        this.bgmPlaying = true;
        this.nextStepTime = this.ctx.currentTime + 0.08;
        this.stepIndex = 0;

        if (this.bgmGain) {
            this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.bgmGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
            this.bgmGain.gain.linearRampToValueAtTime(0.24, this.ctx.currentTime + 1.2);
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
            this.bgmGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
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
        // 1. 生理性心跳重低音 (Lub-Dub Heartbeat) - 每小節第 1 拍與第 3 拍
        const barStep = step % 16;
        if (barStep === 0) {
            // 第 1 拍 Lub：強烈心跳收縮
            this.synthHeartbeat(time, 78, 0.16, 1.0);
        } else if (barStep === 2) {
            // 第 1.5 拍 Dub：回彈短促心跳
            this.synthHeartbeat(time, 56, 0.12, 0.65);
        } else if (barStep === 8) {
            // 第 3 拍 Lub
            this.synthHeartbeat(time, 74, 0.15, 0.95);
        } else if (barStep === 10) {
            // 第 3.5 拍 Dub
            this.synthHeartbeat(time, 54, 0.11, 0.6);
        }

        // 2. 倒數秒針急迫滴答聲 (Tense Stopwatch Tick)
        if (barStep === 4 || barStep === 12) {
            this.synthClockTick(time, true);
        } else if (step % 2 === 0) {
            this.synthClockTick(time, false);
        }

        // 3. 懸疑暗湧低音 (Suspense Saw Bassline)
        const bassNote = this.bassSequence[step];
        if (bassNote && NOTE_FREQS[bassNote]) {
            this.synthBass(NOTE_FREQS[bassNote], time, stepDur * 1.8);
        }

        // 4. 急迫 16 分音符電子琶音 (Urgent Synth Arp)
        const arpNote = this.arpSequence[step];
        if (arpNote && NOTE_FREQS[arpNote]) {
            this.synthArp(NOTE_FREQS[arpNote], time, stepDur * 0.95, step);
        }

        // 5. 每小節開頭鋪設幽暗空氣環境長音 (Dark Hospital Atmosphere Drone)
        if (step === 0) {
            this.synthDrone(NOTE_FREQS['D2'], NOTE_FREQS['A2'], time, stepDur * 16);
        } else if (step === 16) {
            this.synthDrone(NOTE_FREQS['Bb1'], NOTE_FREQS['F2'], time, stepDur * 16);
        } else if (step === 32) {
            this.synthDrone(NOTE_FREQS['G1'], NOTE_FREQS['D2'], time, stepDur * 16);
        } else if (step === 48) {
            this.synthDrone(NOTE_FREQS['A1'], NOTE_FREQS['C#2'], time, stepDur * 16);
        }
    }

    // 生理緊張心跳 (Lub-Dub)
    synthHeartbeat(time, startFreq, dur, intensity) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(26, time + dur);

        const vol = 0.38 * intensity;
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
        osc.frequency.setValueAtTime(isAccent ? 3400 : 2600, time);
        osc.frequency.exponentialRampToValueAtTime(900, time + 0.02);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(isAccent ? 1800 : 2200, time);

        const vol = isAccent ? 0.05 : 0.022;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.025);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + 0.025);
    }

    // 懸疑低音 (Filtered Saw Bass)
    synthBass(freq, time, dur) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, time);
        filter.frequency.exponentialRampToValueAtTime(110, time + dur);
        filter.Q.value = 3.5;

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + dur);
    }

    // 急迫 16 分音符電子琶音 (Urgent Synth Arp)
    synthArp(freq, time, dur, step) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'bandpass';
        const dynamicCutoff = 800 + 450 * Math.sin((step / 16) * Math.PI);
        filter.frequency.setValueAtTime(dynamicCutoff, time);
        filter.Q.value = 2.8;

        gain.gain.setValueAtTime(0.10, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + dur);
    }

    // 幽暗空靈環境長音 (Dark Hospital Drone)
    synthDrone(f1, f2, time, dur) {
        [f1, f2].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq + (i === 1 ? 1.5 : 0), time);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(260, time);

            gain.gain.setValueAtTime(0.001, time);
            gain.gain.linearRampToValueAtTime(0.035, time + dur * 0.2);
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

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
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

        gain.gain.setValueAtTime(0.24, now);
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

            gain.gain.setValueAtTime(0.20, t);
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

            gain.gain.setValueAtTime(0.30, t);
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

            gain.gain.setValueAtTime(0.22, t);
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

                gain.gain.setValueAtTime(0.10, t);
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

                gain.gain.setValueAtTime(0.14, time);
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
            window.hospitalAudio.ensureContext();
            window.hospitalAudio.startBgm();
        }
    }, { once: false, passive: true });
});
