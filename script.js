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

const shortOnlyParam = qs("shortOnly", "0") === "1"; // New URL parameter: if true, only short breaks automatically

if (hideCtrls) document.body.classList.add("hide-controls");

/* ───────────── State ───────────── */
let mode        = "Focus";          // Focus | Short | Long
let secondsLeft = sessionLen * 60;
let cycle       = 0;                // counts completed focus sessions for determining long breaks
let timerId     = null;

/* ───────────── DOM refs ───────────── */
const tLeft     = $("time-left");
const tLabel    = $("timer-label");
const progress  = $("progress-value");
const workSound = $("work-sound");
const breakSound = $("break-sound");

// New buttons for manual breaks
const triggerShortBreakBtn = $("trigger-short-break");
const triggerLongBreakBtn  = $("trigger-long-break");


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
  // Prevent division by zero if a length is 0 (though inputs have min="1")
  progress.style.width = total > 0 ? `${100 * (1 - secondsLeft/total)}%` : '0%';
}

/* ───────────── Core logic ───────────── */
function switchMode(){
  if (mode === "Focus"){
    // A focus session has just completed
    cycle++; // Increment the count of completed focus sessions
    if (shortOnlyParam) {
      mode = "Short"; // If shortOnly is active, always switch to a short break
    } else {
      // Original logic: Long break after the 5th completed focus session (i.e., the 5th break is long)
      mode = (cycle % 5 === 0) ? "Long" : "Short";
    }
  } else {
    // A break (Short or Long, automatic or manual) has just completed
    mode = "Focus";
    // Do not increment 'cycle' here, as it counts completed *focus* sessions.
  }

  // Update secondsLeft based on the new mode
  // Re-read lengths from inputs in case they were changed during a session,
  // though typically these are set at init/reset.
  // For consistency with reset and manual triggers, we could re-read them here too.
  // However, the original script only reads them at init and reset.
  // We will primarily rely on sessionLen, shortLen, longLen being current.
  // The manual break triggers will specifically update shortLen/longLen.
  secondsLeft =
    mode === "Focus" ? sessionLen*60 :
    mode === "Short" ? shortLen*60   : longLen*60;
  
  paint(); // Update display for the new mode immediately
}

function tick(){
  if (--secondsLeft < 0){
    // --- Sound Logic ---
    // Play sound based on the mode that just FINISHED
    if (mode === "Focus") {
        breakSound.currentTime = 0; 
        breakSound.play().catch(e => console.error("Error playing break sound:", e));
    } else {
        workSound.currentTime = 0; 
        workSound.play().catch(e => console.error("Error playing work sound:", e));
    }
    // --- End Sound Logic ---

    // Switch to the next mode
    switchMode();
    // Note: paint() is called within switchMode() now for immediate update after mode change
  } else {
    // Update visuals every tick if timer is not finished
    paint();
  }
}

function start(){
  if (!timerId) {
      paint(); // Ensure UI is up-to-date when starting/resuming
      timerId = setInterval(tick, 1000);
  }
}
function stop(){
  clearInterval(timerId);
  timerId = null;
}

/* ───────────── Controls ───────────── */
$("start_stop").onclick = () => {
    if (timerId) {
        stop();
    } else {
        // When starting, ensure current session/break lengths are used from potentially changed inputs
        // This is mostly relevant if the timer was stopped, values changed, and then started again.
        // Reset already handles this comprehensively.
        sessionLen = +$("session-length").value;
        shortLen   = +$("short-break-length").value;
        longLen    = +$("long-break-length").value;

        // If current mode is Focus, ensure secondsLeft reflects sessionLen
        // If current mode is a break, it should use its respective length
        // This logic path is for clicking "Start" when paused or at initial state.
        // If paused in a break, it should resume that break.
        // If paused in focus, it should resume focus.
        // If starting from a reset state (mode=Focus, cycle=0), it uses sessionLen.
        // The `secondsLeft` should ideally be preserved if just pausing/resuming.
        // If it's a fresh start after reset, `secondsLeft` is already `sessionLen * 60`.
        // If it's starting after a manual break was set up but not started, `secondsLeft` is correct.
        start();
    }
};

$("reset").onclick = () =>{
  stop();
  cycle = 0;
  mode  = "Focus";
  // Re-read values from inputs as they might have changed
  sessionLen = +$("session-length").value;
  shortLen   = +$("short-break-length").value;
  longLen    = +$("long-break-length").value;
  secondsLeft = sessionLen*60;
  paint(); // Update display immediately on reset
};

// Event listeners for new manual break buttons
triggerShortBreakBtn.onclick = () => {
    stop(); // Stop any current timer
    mode = "Short";
    shortLen = +$("short-break-length").value; // Get current short break length from input
    secondsLeft = shortLen * 60;
    // cycle count is NOT affected by manual breaks
    paint(); // Update display
    start(); // Start the short break timer
};

triggerLongBreakBtn.onclick = () => {
    stop(); // Stop any current timer
    mode = "Long";
    longLen = +$("long-break-length").value; // Get current long break length from input
    secondsLeft = longLen * 60;
    // cycle count is NOT affected by manual breaks
    paint(); // Update display
    start(); // Start the long break timer
};

/* ───────────── Init ───────────── */
paint(); // Initial paint on load
if (autoStart) start();
