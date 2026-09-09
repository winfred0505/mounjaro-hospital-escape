/**
 * hospital-audio.js - 醫院藥劑部高科技電子音效合成引擎
 * 支援終端按鍵嗶聲、門禁刷卡、紅燈警報、KwikPen機械雙喀擦聲、電話答錄與大門開啟音效
 */

class HospitalSoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
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
        return this.enabled;
    }

    // 終端機按鍵短音
    playBeep(freq = 900, duration = 0.04) {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // 門禁刷卡成功聲 (嗶——)
    playCardScan() {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1480, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    // 處方攔截緊急警報
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

            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.17);
        }
    }

    // KwikPen 旋轉雙喀擦聲 (Click-Click)
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

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.03);
        });
    }

    // 門禁大門解鎖成功音
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

            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    // 急診諮詢電話雙聲
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

                gain.gain.setValueAtTime(0.08, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.15);
            });
        });
    }

    // 成功通關大合奏
    playVictory() {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.12;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.5);
        });
    }
}

window.hospitalAudio = new HospitalSoundEngine();