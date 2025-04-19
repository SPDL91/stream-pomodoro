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

/* ───────────── DOM refs ───────────── */
const tLeft     = $("time-left");
const tLabel    = $("timer-label");
const progress  = $("progress-value");
const workSound = $("work-sound");
const breakSound = $("break-sound");

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
}

function tick(){
  if (--secondsLeft < 0){
    // --- Sound Logic ---
    // Play sound based on the mode that just FINISHED
    if (mode === "Focus") {
        // Focus session ended, play break sound
        breakSound.currentTime = 0; // Rewind to start
        breakSound.play().catch(e => console.error("Error playing break sound:", e)); // Play with error handling
    } else {
        // Break session ended, play work sound
        workSound.currentTime = 0; // Rewind to start
        workSound.play().catch(e => console.error("Error playing work sound:", e)); // Play with error handling
    }
    // --- End Sound Logic ---

    // Switch to the next mode
    switchMode();
  }
  // Update visuals every tick regardless
  paint();
}

function start(){
  if (!timerId) {
      paint(); // Ensure UI is up-to-date when starting
      timerId = setInterval(tick, 1000);
  }
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
  // Re-read values from inputs in case they changed
  sessionLen = +$("session-length").value;
  shortLen   = +$("short-break-length").value;
  longLen    = +$("long-break-length").value;
  secondsLeft = sessionLen*60;
  paint(); // Update display immediately on reset
};

/* ───────────── Init ───────────── */
paint(); // Initial paint on load
if (autoStart) start();