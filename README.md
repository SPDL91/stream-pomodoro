```markdown
# stream‑pomodoro

A small web application that shows a Pomodoro timer intended for OBS Browser Sources.  
It is a single HTML / CSS / JavaScript page—no external libraries or installation required.

---

## Main capabilities

* Fits automatically to any size browser source in OBS.
* Focus, short‑break and long‑break lengths can be set with URL parameters.
* Pause, resume, reset and skip controls are available through the OBS “Interact” window.
* Optional sound cues for each phase (replace the audio files in the `sounds` folder if you like).
* Fully themeable from OBS by pasting Custom CSS—change colours, fonts and layout without editing the files.
* Runs offline after the first load.

---

## Quick start in OBS

1. Add **Browser Source**  
   URL `https://spdl91.github.io/stream-pomodoro/`
2. To change durations, append parameters:  
   https://spdl91.github.io/stream-pomodoro/?pomodoro=50&shortBreak=10&longBreak=20
3. Right‑click the source → **Interact** to control the timer.

---

## URL parameters

| Name         | Default | Purpose                                  |
|--------------|:------:|-------------------------------------------|
| `pomodoro`   | `25`   | Focus period length in minutes            |
| `shortBreak` | `5`    | Short break length in minutes             |
| `longBreak`  | `15`   | Long break length in minutes              |
| `autoStart`  | `true` | If `true`, the next phase starts itself   |
| `volume`     | `1`    | Audio volume from `0` (mute) to `1` (full)|

---

## Styling with Custom CSS in OBS

/* Change font and text colour */
body            { font-family: "Fira Code", monospace; color: #e0e0e0; }

/* Change progress bar colour */
#progress-value { background: #e0e0e0; }

## Local development

git clone https://github.com/your-user/stream-pomodoro.git
cd stream-pomodoro
# serve the folder with any static server
npx serve .

Edit `index.html`, `style.css` or `script.js` and refresh.

---

## Acknowledgement

Forked from original by [njallam](https://github.com/njallam/stream-pomodoro).

---
```