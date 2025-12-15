let timer;
let seconds = 0;
let isRunning = false;
let targetSeconds = 0; 
let yellowBlinkTimeout;

// Elementos DOM
const displayBig = document.getElementById('display');
const fullscreenTimer = document.getElementById('fullscreenTimer');
const fullscreenMsg = document.getElementById('fullscreenMsg'); 
const body = document.body;

const startBtn = document.getElementById('startBtn');
const stopMessage = document.getElementById('stopMessage');
const modeRadios = document.getElementsByName('timerMode');

const inHours = document.getElementById('inHours');
const inMinutes = document.getElementById('inMinutes');
const inSeconds = document.getElementById('inSeconds');

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

function calculateInputTime() {
    const h = parseInt(inHours.value) || 0;
    const m = parseInt(inMinutes.value) || 0;
    const s = parseInt(inSeconds.value) || 0;
    return (h * 3600) + (m * 60) + s;
}

// === GERENCIAMENTO DE TELA ===
function enterRunningMode() {
    body.classList.add('running-mode');
    fullscreenTimer.classList.remove('hidden');
    fullscreenTimer.classList.add('active');
    fullscreenMsg.textContent = ""; 
}

function exitRunningMode() {
    body.classList.remove('running-mode');
    fullscreenTimer.classList.remove('active');
    fullscreenTimer.classList.add('hidden');
    clearAnimations();
}

// === LÓGICA DE ALERTA (5 MINUTOS) ===
function triggerYellowBlink(mode) {
    // Se já estiver piscando vermelho (fim), ignora o amarelo
    if (displayBig.classList.contains('blink-red')) return;

    // Cálculo do tempo que falta
    let remainingTimeText = "";
    
    if (mode === 'decrescent') {
        // No decrescente, o próprio cronômetro é o que falta
        remainingTimeText = formatTime(seconds);
    } else {
        // No crescente, subtraímos o alvo do tempo atual
        if (targetSeconds > 0) {
            const diff = targetSeconds - seconds;
            remainingTimeText = formatTime(diff);
        } else {
            // Caso raro: crescente infinito (sem alvo)
            // Nesse caso não "falta" nada, mas mostramos o tempo atual como marco
            remainingTimeText = formatTime(seconds) + " (decorridos)";
        }
    }

    displayBig.classList.add('blink-yellow');
    fullscreenMsg.textContent = `Falta exatamente: ${remainingTimeText}`; 

    // Remove após 5 segundos
    clearTimeout(yellowBlinkTimeout);
    yellowBlinkTimeout = setTimeout(() => {
        displayBig.classList.remove('blink-yellow');
        // Só limpa o texto se o timer ainda estiver rodando (não acabou)
        if(isRunning) {
            fullscreenMsg.textContent = ""; 
        }
    }, 5000);
}

// === LÓGICA DO CRONÔMETRO ===
function getMode() {
    for (const radio of modeRadios) {
        if (radio.checked) return radio.value;
    }
    return 'crescent'; 
}

function startTimer() {
    if (!isRunning) {
        const mode = getMode();
        targetSeconds = calculateInputTime();

        if (mode === 'decrescent' && targetSeconds === 0) {
            stopMessage.textContent = "Defina um tempo para a contagem regressiva!";
            stopMessage.style.color = "#c0392b";
            return;
        }

        stopMessage.textContent = "";
        
        if (mode === 'decrescent') {
            seconds = targetSeconds;
        } else {
            seconds = 0; 
        }

        updateDisplay();
        clearAnimations();
        enterRunningMode();
        isRunning = true;
        
        timer = setInterval(() => {
            let shouldStop = false;
            let finishedText = "";

            if (mode === 'decrescent') {
                seconds--; 
                
                // Verifica intervalo de 5 minutos (300s)
                if (seconds > 0 && seconds % 300 === 0) {
                    triggerYellowBlink(mode);
                }

                if (seconds <= 0) {
                    seconds = 0;
                    shouldStop = true;
                    finishedText = "Tempo esgotado!";
                }

            } else {
                // Modo Crescente
                seconds++;
                
                // Verifica intervalo de 5 minutos (300s)
                if (seconds > 0 && seconds % 300 === 0) {
                   triggerYellowBlink(mode);
                }

                // Se atingiu o alvo
                if (targetSeconds > 0 && seconds >= targetSeconds) {
                    shouldStop = true;
                    finishedText = `Tempo atingido: ${formatTime(targetSeconds)}`;
                }
            }
            
            updateDisplay();

            if (shouldStop) {
                stopTimer(false); 
                fullscreenMsg.textContent = finishedText; 
                stopMessage.textContent = finishedText;   
                startRedAnimation();
            }
            
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
    }
}

// === ANIMAÇÕES ===
function startRedAnimation() {
    displayBig.classList.remove('blink-yellow'); // Vermelho tem prioridade
    displayBig.classList.add('blink-red');
}

function clearAnimations() {
    displayBig.classList.remove('blink-red');
    displayBig.classList.remove('blink-yellow');
    clearTimeout(yellowBlinkTimeout);
}

// === EVENTOS ===
startBtn.addEventListener('click', startTimer);
fullscreenTimer.addEventListener('click', () => stopTimer(true));

// Inicialização
updateDisplay();