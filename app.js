const genreSelect = document.getElementById("genreSelect");
const bpmInput = document.getElementById("bpmInput");
const tracksContainer = document.getElementById("tracks");
const statusText = document.getElementById("statusText");

const visualizer = document.getElementById("visualizer");
const visualPlaceholder = document.getElementById("visualPlaceholder");

const generateBtn = document.getElementById("generateBtn");
const randomBtn = document.getElementById("randomBtn");
const playBtn = document.getElementById("playBtn");
const visualBtn = document.getElementById("visualBtn");
const downloadBtn = document.getElementById("downloadBtn");

let audioContext = null;
let playbackTimer = null;
let isPlaying = false;

let currentBeat = null;

const GENRES = [
"Hip-Hop",
"Boom Bap",
"East Coast Hip-Hop",
"West Coast Hip-Hop",
"Gangsta Rap",
"G-Funk",
"Trap",
"Drill",
"Chicago Drill",
"UK Drill",
"Jersey Drill",
"Memphis Rap",
"Phonk",
"Drift Phonk",
"House Phonk",
"Rare Phonk",
"Lo-Fi Hip-Hop",
"Jazz Hop",
"Conscious Hip-Hop",
"Horrorcore",
"Cloud Rap",
"Alternative Hip-Hop",
"Old School Hip-Hop",
"House",
"Deep House",
"Tech House",
"Progressive House",
"Future House",
"Electro House",
"Bass House",
"Tropical House",
"Organic House",
"Slap House",
"Piano House",
"Techno",
"Detroit Techno",
"Minimal Techno",
"Industrial Techno",
"Melodic Techno",
"Peak-Time Techno",
"Hard Techno",
"Trance",
"Psytrance",
"Dubstep",
"Riddim",
"Future Bass",
"Drum & Bass",
"Jungle",
"Breakcore",
"UK Garage",
"Grime",
"Hardstyle",
"Hyperpop",
"Synthwave",
"Vaporwave",
"Ambient",
"Chiptune",
"Reggaeton",
"Amapiano",
"Afrobeats"
];

GENRES.forEach((genre) => {
  const option = document.createElement("option");
  option.value = genre;
  option.textContent = genre;
  genreSelect.appendChild(option);
});

const TRACK_NAMES = [
  "Drums",
  "Percussion",
  "Bass",
  "Chords",
  "Melody",
  "FX"
];

function random(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

function randomChance(chance){
  return Math.random() < chance;
}

function createPattern(density){
  const pattern = [];

  for(let i=0;i<16;i++){
    pattern.push(randomChance(density) ? 1 : 0);
  }

  return pattern;
}

function genreDefaults(genre){

  const g = genre.toLowerCase();

  if(g.includes("phonk")){
    return { bpm: random(135,160), density:.55 };
  }

  if(g.includes("trap") || g.includes("drill")){
    return { bpm: random(130,155), density:.50 };
  }

  if(g.includes("house")){
    return { bpm: random(120,130), density:.65 };
  }

  if(g.includes("techno")){
    return { bpm: random(125,145), density:.70 };
  }

  if(g.includes("trance")){
    return { bpm: random(132,145), density:.75 };
  }

  if(g.includes("dubstep")){
    return { bpm: random(140,150), density:.55 };
  }

  if(g.includes("drum")){
    return { bpm: random(160,180), density:.85 };
  }

  if(g.includes("jungle")){
    return { bpm: random(165,180), density:.90 };
  }

  if(g.includes("breakcore")){
    return { bpm: random(180,220), density:.95 };
  }

  if(g.includes("garage")){
    return { bpm: random(128,138), density:.65 };
  }

  if(g.includes("hyperpop")){
    return { bpm: random(140,180), density:.80 };
  }

  if(g.includes("ambient")){
    return { bpm: random(60,90), density:.25 };
  }

  return { bpm: random(80,140), density:.45 };
}

function generateBeat(randomGenre=false){

  const genre = randomGenre
    ? GENRES[random(0,GENRES.length-1)]
    : genreSelect.value;

  genreSelect.value = genre;

  const defaults = genreDefaults(genre);

  bpmInput.value = defaults.bpm;

  currentBeat = {
    genre,
    bpm: defaults.bpm,
    muted:{},
    tracks:{}
  };

  TRACK_NAMES.forEach(track => {

    currentBeat.muted[track] = false;

    currentBeat.tracks[track] =
      createPattern(defaults.density);

  });

  renderTracks();

  statusText.textContent =
  `Generated ${genre} beat at ${defaults.bpm} BPM`;
}

function renderTracks(){

  tracksContainer.innerHTML = "";

  TRACK_NAMES.forEach(track => {

    const row = document.createElement("div");
    row.className = "track-row";

    const name = document.createElement("div");
    name.className = "track-name";
    name.textContent = track;

    const steps = document.createElement("div");
    steps.className = "track-steps";

    currentBeat.tracks[track].forEach(value => {

      const step = document.createElement("div");
      step.className = value
        ? "step active"
        : "step";

      steps.appendChild(step);

    });

    const mute = document.createElement("button");
    mute.className = "mute-btn";
    mute.textContent = "MUTE";

    mute.addEventListener("click", () => {

      currentBeat.muted[track] =
      !currentBeat.muted[track];

      mute.classList.toggle(
        "active",
        currentBeat.muted[track]
      );

    });

    row.appendChild(name);
    row.appendChild(steps);
    row.appendChild(mute);

    tracksContainer.appendChild(row);

  });

}

function ensureAudio(){

  if(audioContext) return;

  audioContext =
    new(window.AudioContext ||
      window.webkitAudioContext)();

}

function playClick(freq,time,length,type="sine"){

  const osc =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.value = .1;

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(time);
  osc.stop(time + length);

}

function playStep(){

  const now = audioContext.currentTime;

  if(!currentBeat) return;

  TRACK_NAMES.forEach(track => {

    if(currentBeat.muted[track]) return;

    const pattern =
      currentBeat.tracks[track];

    const active =
      pattern[random(0,15)];

    if(!active) return;

    switch(track){

      case "Drums":
        playClick(80,now,.12,"square");
        break;

      case "Percussion":
        playClick(220,now,.08,"triangle");
        break;

      case "Bass":
        playClick(60,now,.2,"sawtooth");
        break;

      case "Chords":
        playClick(250,now,.25,"triangle");
        break;

      case "Melody":
        playClick(
          random(400,800),
          now,
          .18,
          "sine"
        );
        break;

      case "FX":
        playClick(
          random(900,1200),
          now,
          .12,
          "square"
        );
        break;
    }

  });

}

function togglePlay(){

  ensureAudio();

  if(isPlaying){

    clearInterval(playbackTimer);

    isPlaying = false;

    playBtn.textContent = "PLAY";

    return;
  }

  const bpm =
    Number(bpmInput.value);

  const interval =
    (60000 / bpm) / 4;

  playbackTimer =
    setInterval(playStep, interval);

  isPlaying = true;

  playBtn.textContent = "PAUSE";

}

function toggleVisualizer(){

  visualizer.classList.toggle("hidden");

  visualPlaceholder.classList.toggle("hidden");

}

function downloadMidi(){

  if(!currentBeat){

    alert("Generate a beat first.");

    return;
  }

  const text =
JSON.stringify(currentBeat,null,2);

  const blob =
new Blob([text],{
type:"application/json"
});

  const url =
URL.createObjectURL(blob);

  const a =
document.createElement("a");

  a.href = url;

  a.download =
`MIDI-GEN-${currentBeat.genre}.json`;

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

  URL.revokeObjectURL(url);

  statusText.textContent =
  "Downloaded beat data.";
}

generateBtn.addEventListener(
  "click",
  () => generateBeat(false)
);

randomBtn.addEventListener(
  "click",
  () => generateBeat(true)
);

playBtn.addEventListener(
  "click",
  togglePlay
);

visualBtn.addEventListener(
  "click",
  toggleVisualizer
);

downloadBtn.addEventListener(
  "click",
  downloadMidi
);

generateBeat();
