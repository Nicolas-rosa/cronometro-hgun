let timer;
let seconds = 0;
let isRunning = false;
let stopTimeInSeconds = null; 
let blinkTimeout; 

// Elementos DOM
const displayBig = document.getElementById('display');
const fullscreenTimer = document.getElementById('fullscreenTimer');
const body = document.body;

const startBtn = document.getElementById('startBtn');
const setStopBtn = document.getElementById('setStopBtn');
const stopTimeInput = document.getElementById('stopTime');
const stopMessage = document.getElementById('stopMessage');
const modeRadios = document.getElementsByName('timerMode');

function formatTime(totalSeconds) {
    const absSeconds = Math.max(0, totalSeconds); 
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const remainingSeconds = absSeconds % 60;

    return [hours, minutes, remainingSeconds]
        .map(unit => unit < 10 ? '0' + unit : unit)
        .join(':');
}

function updateDisplay() {
    displayBig.textContent = formatTime(seconds);
}

// === GERENCIAMENTO DE TELA ===
function enterRunningMode() {
    body.classList.add('running-mode');
    fullscreenTimer.classList.remove('hidden');
    fullscreenTimer.classList.add('active');
}

function exitRunningMode() {
    body.classList.remove('running-mode');
    fullscreenTimer.classList.remove('active');
    fullscreenTimer.classList.add('hidden');
}

// === LÓGICA DO CRONÔMETRO ===

function getMode() {
    for (const radio of modeRadios) {
        if (radio.checked) return radio.value;
    }
    return 'crescent'; // Padrão
}

function startTimer() {
    if (!isRunning) {
        const mode = getMode();
        
        // Validação e Configuração Inicial
        if (mode === 'decrescent') {
            if (stopTimeInSeconds === null || stopTimeInSeconds === 0) {
                stopMessage.textContent = "Defina um tempo para o modo decrescente!";
                stopMessage.style.color = "#c0392b";
                return;
            }
            seconds = stopTimeInSeconds;
        } else {
            // Crescente começa sempre do 0
            seconds = 0; 
        }

        updateDisplay();
        isRunning = true;
        clearBlinkAnimation();
        enterRunningMode();
        
        timer = setInterval(() => {
            if (mode === 'decrescent') {
                seconds--; 
                
                // Chegou a zero?
                if (seconds <= 0) {
                    seconds = 0;
                    stopTimer(false); // Para cronômetro, mantém tela cheia
                    stopMessage.textContent = "Tempo esgotado!";
                    startBlinkAnimation();
                }

            } else {
                // Modo Crescente
                seconds++;
                
                // Atingiu o limite?
                if (stopTimeInSeconds !== null && seconds >= stopTimeInSeconds) {
                    stopTimer(false); 
                    stopMessage.textContent = `Tempo atingido: ${formatTime(stopTimeInSeconds)}`;
                    startBlinkAnimation();
                }
            }
            
            updateDisplay();
            
        }, 1000);
    }
}

function stopTimer(exitFullscreen = true) {
    if (isRunning) {
        isRunning = false;
        clearInterval(timer);
    }

    if (exitFullscreen) {
        exitRunningMode();
        clearBlinkAnimation();
    }
}

function setStopTime() {
    const input = stopTimeInput.value.trim(); 
    const parts = input.split(':');
    let h = 0, m = 0, s = 0;
    let isValid = true;

    // Parser simples de HH:MM:SS, MM:SS ou SS
    if (parts.length === 1) s = parseInt(parts[0]);
    else if (parts.length === 2) { m = parseInt(parts[0]); s = parseInt(parts[1]); }
    else if (parts.length === 3) { h = parseInt(parts[0]); m = parseInt(parts[1]); s = parseInt(parts[2]); }
    else isValid = false;

    if (isNaN(h) || isNaN(m) || isNaN(s)) isValid = false;

    if (isValid) {
        const newTime = (h * 3600) + (m * 60) + s;
        stopTimeInSeconds = newTime;
        stopMessage.textContent = `Tempo definido: ${formatTime(newTime)}`;
        stopMessage.style.color = "var(--main-color)";
    } else {
        stopMessage.textContent = "Formato inválido (Use HH:MM:SS)";
        stopMessage.style.color = "#c0392b";
        stopTimeInSeconds = null;
    }
}

// === ANIMAÇÃO ===
function startBlinkAnimation() {
    displayBig.classList.add('blink-red');
}

function clearBlinkAnimation() {
    displayBig.classList.remove('blink-red');
}

// === EVENTOS ===
startBtn.addEventListener('click', startTimer);
fullscreenTimer.addEventListener('click', () => stopTimer(true));
setStopBtn.addEventListener('click', setStopTime);

// Inicialização
updateDisplay();