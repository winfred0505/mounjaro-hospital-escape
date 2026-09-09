/**
 * main.js - 醫院藥事解密密室逃脫 主進入點
 */

document.addEventListener("DOMContentLoaded", () => {
    window.engine = new HospitalEscapeEngine();

    const unlockAudio = () => {
        if (window.hospitalAudio) window.hospitalAudio.init();
        document.removeEventListener("click", unlockAudio);
    };
    document.addEventListener("click", unlockAudio);

    window.engine.init();
    console.log("🏥【猛健樂醫院藥事解密任務】已就緒！");
});