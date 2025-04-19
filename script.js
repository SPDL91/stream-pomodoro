/* ───────────── Helper ───────────── */
function qs(name, def){
  const v = new URLSearchParams(location.search).get(name);
  return v === null ? def : v;
}
function $(id){return document.getElementById(id);}

/* ───────────── Parameters ───────────── */
let sessionLen = +qs("pomodoro"   , 25);   // minutes
let shortLen   = +qs("shortBreak" ,  5);
let longLen    = +qs("longBreak"  , 15);

const hideCtrls = qs("controls" , "1") === "0";
const autoStart = qs("autoStart", hideCtrls ? "1" : "0") === "1";  
// → if controls are hidden and no autoStart given, default to autoplay

if (hideCtrls) document.body.classList.add("hide-controls");

/* ───────────── State ───────────── */
let mode        = "Focus";          // Focus | Short | Long
let secondsLeft = sessionLen * 60;
let cycle       = 0;                // counts completed focus sessions
let timerId     = null;
const beep      = $("beep");

/* ───────────── DOM refs ───────────── */
const tLeft     = $("time-left");
const tLabel    = $("timer-label");
const progress  = $("progress-value");

$("session-length").value      = sessionLen;
$("short-break-length").value  = shortLen;
$("long-break-length").value   = longLen;

/* ───────────── Rendering ───────────── */
function fmt(sec){
  const m = String(Math.floor(sec/60)).padStart(2,"0");
  const s = String(sec%60).padStart(2,"0");
  return `${m}:${s}`;
}
function paint(){
  tLeft.textContent = fmt(secondsLeft);
  tLabel.textContent =
    mode === "Focus" ? "Focus Time" :
    mode === "Short" ? "Short Break" : "Long Break";

  const total =
    mode === "Focus" ? sessionLen*60 :
    mode === "Short" ? shortLen*60   : longLen*60;
  progress.style.width = `${100 * (1 - secondsLeft/total)}%`;
}

/* ───────────── Core logic ───────────── */
function switchMode(){
  if (mode === "Focus"){
    mode = (++cycle % 4 === 0) ? "Long" : "Short";
  } else {
    mode = "Focus";
  }
  secondsLeft =
    mode === "Focus" ? sessionLen*60 :
    mode === "Short" ? shortLen*60   : longLen*60;
  paint();
}
function tick(){
  if (--secondsLeft < 0){
    beep.play();
    switchMode();
  }
  paint();
}
function start(){
  if (!timerId) timerId = setInterval(tick, 1000);
}
function stop(){
  clearInterval(timerId);
  timerId = null;
}

/* ───────────── Controls ───────────── */
$("start_stop").onclick = () => (timerId ? stop() : start());

$("reset").onclick = () =>{
  stop();
  cycle = 0;
  mode  = "Focus";
  sessionLen = +$("session-length").value;
  shortLen   = +$("short-break-length").value;
  longLen    = +$("long-break-length").value;
  secondsLeft = sessionLen*60;
  paint();
};

/* ───────────── Init ───────────── */
paint();
if (autoStart) start();