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
let currentStep = 0;
let currentBeat = null;

const GENRES = [
"Hip-Hop","Boom Bap","East Coast Hip-Hop","West Coast Hip-Hop","Gangsta Rap","G-Funk","Trap","Drill","Chicago Drill","UK Drill","Jersey Drill","Memphis Rap","Phonk","Drift Phonk","House Phonk","Rare Phonk","Lo-Fi Hip-Hop","Jazz Hop","Conscious Hip-Hop","Horrorcore","Cloud Rap","Alternative Hip-Hop","Old School Hip-Hop",
"Electronic Dance Music (EDM)","House","Deep House","Tech House","Progressive House","Future House","Electro House","Bass House","Tropical House","Organic House","Slap House","Piano House",
"Techno","Detroit Techno","Minimal Techno","Industrial Techno","Melodic Techno","Peak-Time Techno","Hard Techno",
"Trance","Uplifting Trance","Progressive Trance","Psytrance","Goa Trance","Vocal Trance",
"Dubstep","Brostep","Riddim","Melodic Dubstep","Color Bass","Future Riddim",
"Bass Music","Future Bass","Trap EDM","Hybrid Trap","Wave","Hardwave",
"Drum & Bass","Liquid DnB","Jungle","Neurofunk","Dancefloor DnB","Jump Up","Atmospheric DnB","Techstep","Darkstep","Drumfunk","Intelligent DnB",
"Breakbeat","Big Beat","Nu Skool Breaks","Florida Breaks","Electro Breaks",
"UK Genres","UK Garage","2-Step","Speed Garage","Bassline","Grime","UK Funky","Dub","Dub Reggae",
"Hardcore & Hard Dance","Hardstyle","Rawstyle","Euphoric Hardstyle","Hardcore","Gabber","Frenchcore","Happy Hardcore","Hard Trance","Hard Dance",
"Pop","Dance Pop","Electropop","Synthpop","Indie Pop","Dream Pop","Hyperpop","Bedroom Pop",
"Rock-Based","Pop Punk","Punk Rock","Alternative Rock","Indie Rock","Garage Rock","Post-Punk","Grunge","Emo","Shoegaze",
"Metal","Heavy Metal","Thrash Metal","Death Metal","Black Metal","Doom Metal","Metalcore","Deathcore","Nu Metal","Progressive Metal",
"R&B / Soul","Contemporary R&B","Neo Soul","Alternative R&B","Soul","Funk","Disco","Motown Style",
"Jazz","Smooth Jazz","Jazz Fusion","Bebop","Swing","Bossa Nova","Latin Jazz",
"Latin","Reggaeton","Dembow","Latin Trap","Salsa","Bachata","Merengue","Cumbia","Corridos Tumbados","Regional Mexican","Norteño","Mariachi",
"Afro Genres","Afrobeats","Afro House","Amapiano","Afro Swing","Gqom",
"Experimental / Internet Genres","Vaporwave","Synthwave","Retrowave","Chillwave","Dreamwave","Darksynth","Glitch Hop","Glitchcore","Breakcore","HexD","Sigilkore","Weirdcore","Digicore",
"Ambient / Chill","Ambient","Drone","Chillout","Downtempo","Lounge","Meditation","Cinematic","Atmospheric",
"Cinematic / Orchestral","Trailer Music","Epic Orchestral","Hybrid Orchestral","Fantasy","Horror","Sci-Fi","Adventure","Emotional Piano",
"Video Game Inspired","Chiptune","8-Bit","16-Bit","JRPG Style","Retro Arcade","Synth RPG","Boss Battle","RPG Town Theme"
];

const TRACK_NAMES = ["Drums", "Percussion", "Bass", "Chords", "Melody", "FX"];

function rand(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr){
  return arr[rand(0, arr.length - 1)];
}

function chance(amount){
  return Math.random() < amount;
}

GENRES.forEach(genre => {
  const option = document.createElement("option");
  option.value = genre;
  option.textContent = genre;
  genreSelect.appendChild(option);
});

function getGenreFamily(genre){
  const g = genre.toLowerCase();

  if(g.includes("jungle") || g.includes("drum & bass") || g.includes("dnb") || g.includes("breakcore")) return "breaks";
  if(g.includes("trap") || g.includes("drill") || g.includes("phonk") || g.includes("memphis")) return "trap";
  if(g.includes("house") || g.includes("techno") || g.includes("trance") || g.includes("hardstyle") || g.includes("gabber")) return "four";
  if(g.includes("reggaeton") || g.includes("dembow") || g.includes("latin") || g.includes("salsa") || g.includes("bachata") || g.includes("cumbia")) return "latin";
  if(g.includes("metal") || g.includes("punk") || g.includes("rock") || g.includes("grunge") || g.includes("emo")) return "rock";
  if(g.includes("ambient") || g.includes("drone") || g.includes("cinematic") || g.includes("orchestral")) return "ambient";
  if(g.includes("chiptune") || g.includes("8-bit") || g.includes("16-bit") || g.includes("rpg")) return "chip";
  if(g.includes("jazz") || g.includes("soul") || g.includes("funk") || g.includes("r&b")) return "soul";

  return "hiphop";
}

function getBpmRange(family){
  const ranges = {
    hiphop:[78,105],
    trap:[130,160],
    four:[120,155],
    breaks:[160,210],
    latin:[88,120],
    rock:[120,185],
    ambient:[60,95],
    chip:[110,180],
    soul:[75,115]
  };

  return ranges[family] || [90,140];
}

function generatePattern(track, family){
  const p = Array(16).fill(0);

  if(track === "Drums"){
    if(family === "four"){
      [0,4,8,12].forEach(i => p[i] = 1);
    } else if(family === "breaks"){
      [0,3,6,8,11,14].forEach(i => p[i] = 1);
    } else if(family === "trap"){
      [0,7,10,14].forEach(i => p[i] = 1);
    } else if(family === "latin"){
      [0,3,6,10,12].forEach(i => p[i] = 1);
    } else if(family === "ambient"){
      [0,8].forEach(i => p[i] = 1);
    } else {
      [0,4,10].forEach(i => p[i] = 1);
    }
  }

  if(track === "Percussion"){
    for(let i = 0; i < 16; i++){
      if(family === "breaks") p[i] = chance(.7) ? 1 : 0;
      else if(family === "trap") p[i] = [2,4,6,8,11,13,15].includes(i) || chance(.25) ? 1 : 0;
      else if(family === "four") p[i] = [2,6,10,14].includes(i) ? 1 : 0;
      else if(family === "latin") p[i] = [2,5,7,11,14].includes(i) ? 1 : 0;
      else p[i] = chance(.35) ? 1 : 0;
    }
  }

  if(track === "Bass"){
    for(let i = 0; i < 16; i++){
      if([0,4,8,12].includes(i) || chance(.28)) p[i] = 1;
    }
  }

  if(track === "Chords"){
    for(let i = 0; i < 16; i++){
      if([0,8].includes(i) || chance(.15)) p[i] = 1;
    }
  }

  if(track === "Melody"){
    for(let i = 0; i < 16; i++){
      if(chance(family === "ambient" ? .18 : .38)) p[i] = 1;
    }
  }

  if(track === "FX"){
    for(let i = 0; i < 16; i++){
      if(chance(.12)) p[i] = 1;
    }
  }

  return p;
}

function generateBeat(randomGenre = false){
  const genre = randomGenre ? pick(GENRES) : genreSelect.value;
  genreSelect.value = genre;

  const family = getGenreFamily(genre);
  const [minBpm, maxBpm] = getBpmRange(family);

  const bpm = randomGenre ? rand(minBpm, maxBpm) : Number(bpmInput.value || rand(minBpm, maxBpm));
  bpmInput.value = bpm;

  currentBeat = {
    genre,
    family,
    bpm,
    muted:{},
    tracks:{},
    notes:{
      Drums:[36,38],
      Percussion:[42,46,51],
      Bass:[36,38,41,43,45,48],
      Chords:[48,52,55,59,60,64,67],
      Melody:[60,62,63,65,67,69,70,72,75],
      FX:[76,79,84,88]
    }
  };

  TRACK_NAMES.forEach(track => {
    currentBeat.muted[track] = false;
    currentBeat.tracks[track] = generatePattern(track, family);
  });

  currentStep = 0;
  renderTracks();

  statusText.textContent = `Generated ${genre} beat at ${bpm} BPM.`;
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
      step.className = value ? "step active" : "step";
      steps.appendChild(step);
    });

    const mute = document.createElement("button");
    mute.className = "mute-btn";
    mute.textContent = "MUTE";

    mute.addEventListener("click", () => {
      currentBeat.muted[track] = !currentBeat.muted[track];
      mute.classList.toggle("active", currentBeat.muted[track]);
      mute.textContent = currentBeat.muted[track] ? "OFF" : "MUTE";
    });

    row.appendChild(name);
    row.appendChild(steps);
    row.appendChild(mute);

    tracksContainer.appendChild(row);
  });
}

function ensureAudio(){
  if(!audioContext){
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if(audioContext.state === "suspended"){
    audioContext.resume();
  }
}

function playTone(freq, time, duration, type, volume){
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(time);
  osc.stop(time + duration + 0.03);
}

function playNoise(time, duration, volume){
  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for(let i = 0; i < bufferSize; i++){
    data[i] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();

  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  source.connect(gain);
  gain.connect(audioContext.destination);

  source.start(time);
}

function playTrackSound(track){
  const now = audioContext.currentTime;
  const family = currentBeat.family;

  if(track === "Drums"){
    playTone(family === "trap" ? 48 : 60, now, .18, "sine", .7);
    playNoise(now, .035, .25);
  }

  if(track === "Percussion"){
    playNoise(now, family === "breaks" ? .045 : .07, .18);
    playTone(family === "chip" ? 900 : 220, now, .05, "square", .08);
  }

  if(track === "Bass"){
    const freq = pick([55, 65, 73, 82, 98]);
    playTone(freq, now, family === "trap" ? .35 : .22, family === "trap" ? "sine" : "sawtooth", .35);
  }

  if(track === "Chords"){
    const chord = pick([[220,277,330], [196,247,294], [174,220,261]]);
    chord.forEach(freq => playTone(freq, now, .45, "triangle", .09));
  }

  if(track === "Melody"){
    const freq = pick([392,440,494,523,587,659,698,784]);
    playTone(freq, now, .18, family === "chip" ? "square" : "triangle", .16);
  }

  if(track === "FX"){
    playTone(pick([880,990,1174,1320]), now, .28, "sine", .1);
  }
}

function playStep(){
  if(!currentBeat) return;

  document.querySelectorAll(".step").forEach(step => {
    step.classList.remove("playing");
  });

  document.querySelectorAll(".track-row").forEach((row, trackIndex) => {
    const trackName = TRACK_NAMES[trackIndex];
    const steps = row.querySelectorAll(".step");

    if(steps[currentStep]){
      steps[currentStep].classList.add("playing");
    }

    if(currentBeat.tracks[trackName][currentStep] && !currentBeat.muted[trackName]){
      playTrackSound(trackName);
    }
  });

  currentStep = (currentStep + 1) % 16;
}

function startPlayback(){
  ensureAudio();

  if(!currentBeat){
    generateBeat(false);
  }

  clearInterval(playbackTimer);

  const bpm = Number(bpmInput.value) || currentBeat.bpm || 140;
  const interval = (60000 / bpm) / 4;

  playbackTimer = setInterval(playStep, interval);
  isPlaying = true;
  playBtn.textContent = "PAUSE";
}

function stopPlayback(){
  clearInterval(playbackTimer);
  playbackTimer = null;
  isPlaying = false;
  playBtn.textContent = "PLAY";
}

function togglePlay(){
  if(isPlaying){
    stopPlayback();
  } else {
    startPlayback();
  }
}

function toggleVisualizer(){
  visualizer.classList.toggle("hidden");
  visualPlaceholder.classList.toggle("hidden");
}

function writeVarLen(value){
  let buffer = value & 0x7F;
  const bytes = [];

  while((value >>= 7)){
    buffer <<= 8;
    buffer |= ((value & 0x7F) | 0x80);
  }

  while(true){
    bytes.push(buffer & 0xFF);

    if(buffer & 0x80){
      buffer >>= 8;
    } else {
      break;
    }
  }

  return bytes;
}

function stringBytes(str){
  return Array.from(str).map(char => char.charCodeAt(0));
}

function midiChunk(id, data){
  const length = data.length;

  return [
    ...stringBytes(id),
    (length >> 24) & 255,
    (length >> 16) & 255,
    (length >> 8) & 255,
    length & 255,
    ...data
  ];
}

function downloadMidi(){
  if(!currentBeat){
    alert("Generate a beat first.");
    return;
  }

  const ticksPerQuarter = 96;
  const bpm = Number(bpmInput.value) || currentBeat.bpm || 140;
  const microsecondsPerBeat = Math.floor(60000000 / bpm);

  const tracks = [];

  const tempoTrack = [
    0x00, 0xFF, 0x51, 0x03,
    (microsecondsPerBeat >> 16) & 255,
    (microsecondsPerBeat >> 8) & 255,
    microsecondsPerBeat & 255,
    0x00, 0xFF, 0x2F, 0x00
  ];

  tracks.push(midiChunk("MTrk", tempoTrack));

  TRACK_NAMES.forEach((trackName, index) => {
    if(currentBeat.muted[trackName]) return;

    const channel = trackName === "Drums" || trackName === "Percussion" ? 9 : index;
    const events = [];

    currentBeat.tracks[trackName].forEach((active, stepIndex) => {
      if(!active) return;

      const startTick = stepIndex * 24;
      const duration = 24;
      const velocity = 100;

      let note = 60;

      if(trackName === "Drums"){
        note = stepIndex % 4 === 0 ? 36 : 38;
      } else if(trackName === "Percussion"){
        note = pick(currentBeat.notes.Percussion);
      } else {
        note = pick(currentBeat.notes[trackName]);
      }

      events.push({
        tick:startTick,
        bytes:[0x90 + channel, note, velocity]
      });

      events.push({
        tick:startTick + duration,
        bytes:[0x80 + channel, note, 0]
      });
    });

    events.sort((a,b) => a.tick - b.tick);

    let lastTick = 0;

    const trackNameBytes = stringBytes(trackName);

    const trackData = [
      0x00,
      0xFF,
      0x03,
      trackNameBytes.length,
      ...trackNameBytes
    ];

    events.forEach(event => {
      const delta = event.tick - lastTick;
      trackData.push(...writeVarLen(delta), ...event.bytes);
      lastTick = event.tick;
    });

    trackData.push(0x00, 0xFF, 0x2F, 0x00);

    tracks.push(midiChunk("MTrk", trackData));
  });

  const header = midiChunk("MThd", [
    0x00, 0x01,
    (tracks.length >> 8) & 255,
    tracks.length & 255,
    (ticksPerQuarter >> 8) & 255,
    ticksPerQuarter & 255
  ]);

  const midiData = new Uint8Array([
    ...header,
    ...tracks.flat()
  ]);

  const blob = new Blob([midiData], { type:"audio/midi" });
  const url = URL.createObjectURL(blob);

  const fileName = `MIDI-GEN-${currentBeat.genre.replaceAll(" ","-").replaceAll("/","-")}.mid`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  statusText.textContent = "Downloaded real MIDI file.";
}

generateBtn.addEventListener("click", () => generateBeat(false));
randomBtn.addEventListener("click", () => generateBeat(true));
playBtn.addEventListener("click", togglePlay);
visualBtn.addEventListener("click", toggleVisualizer);
downloadBtn.addEventListener("click", downloadMidi);

bpmInput.addEventListener("change", () => {
  if(currentBeat){
    currentBeat.bpm = Number(bpmInput.value) || currentBeat.bpm;
  }

  if(isPlaying){
    startPlayback();
  }
});

generateBeat(false);
