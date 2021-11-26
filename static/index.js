import { l } from './lib.js';

// generate keyboard
const keyboard = l.div({ className: 'keyboard ' },
    ...['qwertyuiop', 'asdfghjkl', 'zxcvbnm '].map(row =>
        l.div({ className: 'row' }, 
            ...[...row].flatMap(char =>
                char !== ' '
                    ? l.span({ className: 'key' }, char)
                    : Array.from({ length: 4 }, () => l.span())
            ))
    )
);
document.querySelector('main').append(keyboard);

const keyEls = [...keyboard.querySelectorAll('.key')];
const keyMap = new Map(keyEls.map(el => [el.textContent, el]));

const getUrlFromSlug = slug => `https://cdn.discordapp.com/attachments/819826136393580565/${slug}.mp3`;
const soundSets = {
    soft: {
        in: ["873642367045992508/click_soft_in_01", "873642368652423258/click_soft_in_02", "873642370133004308/click_soft_in_03"],
        out: ["873642371525525514/click_soft_out_01", "873642373077413988/click_soft_out_02", "873642374717407302/click_soft_out_03"]
    },

    hard: {
        in: ["873648832901181450/click_hard_in_01", "873648840178286632/click_hard_in_02", "873648841537241148/click_hard_in_03"],
        out: ["873648843223339008/click_hard_out_01", "873648845035302942/click_hard_out_02", "873648846192922664/click_hard_out_03"]
    }
};

const select = document.querySelector('select');
const initAudio = () => Object.values(soundSets[select.value])
    .flatMap(obj => Object.values(obj))
    .map(getUrlFromSlug)
    .forEach(url => new Audio(url));

initAudio();
select.addEventListener('input', initAudio);

let lastIndex = -1;
const playSound = (clickIn = true) => {
    const soundSet = soundSets[select.value][clickIn ? 'in' : 'out'];
    const randIndex = clickIn ? Math.floor(Math.random() * soundSet.length) : lastIndex || 0;
    lastIndex = randIndex;

    const soundLink = getUrlFromSlug(soundSet[randIndex]);
    const sound = new Audio(soundLink);
    sound.volume = .2;
    sound.play();
};

// cleared heatmap every 5 seconds, only local
const keysClicks = new Map();
// main heatmap that gets updated locally and through pulls
let heatMap = new Map();

const incMap = (map, key) => map.set(key, (map.get(key) || 0) + 1);

document.addEventListener('keydown', e => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    const keyEl = keyMap.get(key);
    if (!keyEl) return;

    incMap(keysClicks, key);
    incMap(heatMap, key);
    updateHeatMaps(heatMap);

    keyEl.classList.add('pressed');
    playSound(true);
});
document.addEventListener('keyup', e => {
    const keyEl = keyMap.get(e.key.toLowerCase());
    if (!keyEl) return;
    
    keyEl.classList.remove('pressed');
    playSound(false);
});

// maximum is about 40 clicks a second, we send every 5 seconds
setInterval(async () => {
    if (!keysClicks.size) return;

    // update DB with new clicks
    const data = [...keysClicks.entries()].map(([k,v]) => `${k}${v}`).join('');
    keysClicks.clear();
    const res = await fetch('/emit?keys=' + data);

    // get resulting heatmap which contains ours + all previous
    const json = await res.json();
    heatMap = new Map(json);
    updateHeatMaps(heatMap);
}, 5000);

fetch('/keys')
    .then(res => res.json())
    .then(json => new Map(json))
    .then(hm => {
        heatMap = hm;
        updateHeatMaps(hm);
    });

function updateHeatMaps(heatMap) {
    for (const keyEl of keyEls) {
        const key = keyEl.textContent.toLowerCase();
        const heat = heatMap.get(key) || 0;
        
        keyEl.style.setProperty('--heat', heat);
    }
}
