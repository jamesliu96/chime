import { Chime } from './chime.js';
import { KirbyBass1, KirbyBass2, KirbySynth1, KirbySynth2, } from './songs/kirby.js';
import { MarioBass1, MarioBass2, MarioSynth1, MarioSynth2, } from './songs/mario.js';
import { MetroidSynth1, MetroidSynth2 } from './songs/metroid.js';
import { ZeldaBass1, ZeldaBass2, ZeldaSynth1, ZeldaSynth2, } from './songs/zelda.js';
const r = [...Array(2 ** 20)].map(() => Math.random() * 2 - 1);
const [width, height] = [600, 300];
let currentContext = null;
let currentAnalysers = [];
let currentGain = null;
const mapper = ({ name, time, duration, velocity, }) => [
    name,
    time,
    duration,
    velocity,
    0,
];
function playNotesSong(context) {
    const analyser = context.createAnalyser();
    Chime.playNotes([
        ['c4', 4],
        ['d4', 4],
        ['e4', 4],
        ['c4', 4],
        ['c4', 4],
        ['d4', 4],
        ['e4', 4],
        ['c4', 4],
        ['e4', 4, 0.5],
        ['f4', 4, 0.5],
        ['g4', 4, 0.5],
        [0, 4],
        ['e4', 4],
        ['f4', 4],
        ['g4', 4],
    ], 80, 'sine', analyser);
    return [analyser];
}
function playDataKirby(context) {
    const analyser = context.createAnalyser();
    const analyser1 = context.createAnalyser();
    const analyser2 = context.createAnalyser();
    const analyser3 = context.createAnalyser();
    const analyser4 = context.createAnalyser();
    analyser1.connect(analyser);
    analyser2.connect(analyser);
    analyser3.connect(analyser);
    analyser4.connect(analyser);
    Chime.playData(KirbyBass1.map(mapper), 'triangle', analyser1);
    Chime.playData(KirbyBass2.map(mapper), context.createPeriodicWave(r, r), analyser2);
    Chime.playData(KirbySynth1.map(mapper), 'square', analyser3);
    Chime.playData(KirbySynth2.map(mapper), 'square', analyser4);
    return [analyser, analyser1, analyser2, analyser3, analyser4];
}
function playDataMario(context) {
    const analyser = context.createAnalyser();
    const analyser1 = context.createAnalyser();
    const analyser2 = context.createAnalyser();
    const analyser3 = context.createAnalyser();
    const analyser4 = context.createAnalyser();
    analyser1.connect(analyser);
    analyser2.connect(analyser);
    analyser3.connect(analyser);
    analyser4.connect(analyser);
    Chime.playData(MarioBass1.map(mapper), 'triangle', analyser1);
    Chime.playData(MarioBass2.map(mapper), context.createPeriodicWave(r, r), analyser2);
    Chime.playData(MarioSynth1.map(mapper), 'square', analyser3);
    Chime.playData(MarioSynth2.map(mapper), 'square', analyser4);
    return [analyser, analyser1, analyser2, analyser3, analyser4];
}
function playDataZelda(context) {
    const analyser = context.createAnalyser();
    const analyser1 = context.createAnalyser();
    const analyser2 = context.createAnalyser();
    const analyser3 = context.createAnalyser();
    const analyser4 = context.createAnalyser();
    analyser1.connect(analyser);
    analyser2.connect(analyser);
    analyser3.connect(analyser);
    analyser4.connect(analyser);
    Chime.playData(ZeldaBass1.map(mapper), 'triangle', analyser1);
    Chime.playData(ZeldaBass2.map((o) => ({ ...o, name: 'C4' })).map(mapper), context.createPeriodicWave(r, r), analyser2);
    Chime.playData(ZeldaSynth1.map(mapper), 'square', analyser3);
    Chime.playData(ZeldaSynth2.map(mapper), 'square', analyser4);
    return [analyser, analyser1, analyser2, analyser3, analyser4];
}
function playDataMetroid(context) {
    const analyser = context.createAnalyser();
    const analyser1 = context.createAnalyser();
    const analyser2 = context.createAnalyser();
    analyser1.connect(analyser);
    analyser2.connect(analyser);
    Chime.playData(MetroidSynth1.map(mapper), 'square', analyser1);
    Chime.playData(MetroidSynth2.map(mapper), 'square', analyser2);
    return [analyser, analyser1, analyser2];
}
const controls = document.getElementById('controls');
const btnStop = document.getElementById('btn-stop');
[
    playNotesSong,
    playDataKirby,
    playDataMario,
    playDataZelda,
    playDataMetroid,
].forEach((fn) => {
    const btn = document.createElement('button');
    btn.id = `btn-${fn.name}`;
    btn.innerText = fn.name;
    btn.addEventListener('click', () => {
        if (currentContext && currentContext.state !== 'closed')
            currentContext.close();
        currentContext = new AudioContext();
        currentGain = currentContext.createGain();
        currentGain.connect(currentContext.destination);
        currentGain.gain.value = parseInt(sliderGain.value) / 100;
        currentAnalysers = fn(currentContext);
        if (currentAnalysers.length) {
            currentAnalysers[0].connect(currentGain);
            const masterAnalyser = currentContext.createAnalyser();
            currentGain.connect(masterAnalyser);
            currentAnalysers[0] = masterAnalyser;
        }
        currentAnalysers.forEach((analyser) => {
            analyser.fftSize = 2 ** parseInt(sliderFFTSize.value);
        });
    });
    controls.insertBefore(btn, btnStop);
});
btnStop.addEventListener('click', () => {
    if (currentContext && currentContext.state !== 'closed')
        currentContext.close();
});
const sliderFFTSize = document.getElementById('sliderFFTSize');
const sliderFFTSizeV = document.getElementById('sliderFFTSizeV');
sliderFFTSize.addEventListener('input', function () {
    const v = 2 ** parseInt(this.value);
    currentAnalysers.forEach((analyser) => {
        analyser.fftSize = v;
    });
    sliderFFTSizeV.innerText = `${v}`;
});
const sliderGain = document.getElementById('sliderGain');
const sliderGainV = document.getElementById('sliderGainV');
sliderGain.addEventListener('input', function () {
    const v = parseInt(this.value) / 100;
    if (currentGain) {
        currentGain.gain.value = v;
    }
    sliderGainV.innerText = `${Math.floor(v * 100)}`;
});
const canvasWidth = width * devicePixelRatio;
const canvasHeight = height * devicePixelRatio;
const canvas = document.getElementById('osc');
canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;
canvas.style.backgroundColor = 'green';
const canvases = document.getElementById('oscs');
canvases.style.width = `${width}px`;
canvases.style.height = `${height}px`;
const ctx2dGroup = [canvas.getContext('2d')];
['teal', 'purple', 'maroon', 'olive'].forEach((color, idx) => {
    const c = document.getElementById(`osc${idx + 1}`);
    c.width = canvasWidth / 2;
    c.height = canvasHeight / 2;
    c.style.width = `${width / 2}px`;
    c.style.height = `${height / 2}px`;
    c.style.backgroundColor = color;
    ctx2dGroup.push(c.getContext('2d'));
});
function draw() {
    ctx2dGroup.forEach((ctx2d, idx) => {
        const [w, h] = idx
            ? [canvasWidth / 2, canvasHeight / 2]
            : [canvasWidth, canvasHeight];
        ctx2d.clearRect(0, 0, w, h);
    });
    if (!currentContext)
        return;
    currentAnalysers.forEach((analyser, idx) => {
        const ctx2d = ctx2dGroup[idx];
        if (ctx2d) {
            const [w, h] = idx
                ? [canvasWidth / 2, canvasHeight / 2]
                : [canvasWidth, canvasHeight];
            const data = new Uint8Array(analyser.fftSize);
            analyser.getByteTimeDomainData(data);
            const rects = [];
            for (let i = 0; i < w; i++) {
                const d = data[~~((i / w) * data.length)];
                const dRate = d / 255;
                const [x, y] = [i, dRate * h];
                rects.push({ x, y });
            }
            ctx2d.strokeStyle = 'white';
            ctx2d.lineJoin = 'round';
            ctx2d.lineWidth = 1 * devicePixelRatio;
            ctx2d.beginPath();
            rects.forEach(({ x, y }, i) => {
                if (i)
                    ctx2d.lineTo(x, y);
                else
                    ctx2d.moveTo(x, y);
            });
            ctx2d.stroke();
            if (!idx) {
                ctx2d.font = `${16 * devicePixelRatio}px monospace`;
                ctx2d.fillStyle = 'white';
                ctx2d.textBaseline = 'hanging';
                ctx2d.fillText(`${currentContext.currentTime.toFixed(3)}s`, 0, 0);
            }
        }
    });
}
function loop() {
    draw();
    requestAnimationFrame(loop);
}
loop();
