let timer;
let seconds = 0;
let isRunning = false;
let stopTimeInSeconds = null; // Tempo em segundos para parar o cronômetro
let blinkTimeout; // Variável para armazenar o timeout da animação de piscar

const display = document.getElementById('display');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const forwardBtn = document.getElementById('forwardBtn');
const backwardBtn = document.getElementById('backwardBtn');
const setStopBtn = document.getElementById('setStopBtn');
const stopTimeInput = document.getElementById('stopTime');
const stopMessage = document.getElementById('stopMessage');

function formatTime(totalSeconds) {
    // Garante que o tempo nunca seja negativo, mesmo que a operação de retroceder o faça
    const absSeconds = Math.max(0, totalSeconds); 
    
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const remainingSeconds = absSeconds % 60;

    return [hours, minutes, remainingSeconds]
        .map(unit => unit < 10 ? '0' + unit : unit)
        .join(':');
}

function updateDisplay() {
    display.textContent = formatTime(seconds);
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startStopBtn.textContent = 'Parar';
        // Garante que qualquer animação de piscar anterior seja limpa ao iniciar
        clearBlinkAnimation(); 
        timer = setInterval(() => {
            seconds++;
            updateDisplay();
            // Verifica a condição de parada a cada segundo
            if (stopTimeInSeconds !== null && seconds >= stopTimeInSeconds) {
                console.log("Tempo atual (segundos):", seconds, "Tempo de parada definido:", stopTimeInSeconds); // Debugging
                stopTimer(); // Para o cronômetro
                stopMessage.textContent = `Cronômetro parou no tempo definido: ${formatTime(stopTimeInSeconds)}!`;
                
                // === NOVO: Inicia a animação de piscar em vermelho ===
                startBlinkAnimation();
            }
        }, 1000);
        console.log("Cronômetro iniciado. Stop time:", stopTimeInSeconds ? formatTime(stopTimeInSeconds) : "Não definido"); // Debugging
    }
}

function stopTimer() {
    if (isRunning) {
        isRunning = false;
        startStopBtn.textContent = 'Iniciar';
        clearInterval(timer);
        console.log("Cronômetro parado."); // Debugging
    }
    // NOVO: Ao parar manualmente, limpa a animação de piscar
    clearBlinkAnimation(); 
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    stopTimeInSeconds = null;
    stopTimeInput.value = '';
    stopMessage.textContent = '';
    updateDisplay();
    // NOVO: Limpa a animação de piscar ao resetar
    clearBlinkAnimation(); 
    console.log("Cronômetro resetado."); // Debugging
}

function adjustTime(deltaSeconds) {
    seconds += deltaSeconds;
    if (seconds < 0) {
        seconds = 0;
    }
    updateDisplay();
    // NOVO: Se o tempo for ajustado, limpa a animação de piscar
    clearBlinkAnimation(); 
    console.log("Tempo ajustado para:", formatTime(seconds)); // Debugging
}

function setStopTime() {
    const input = stopTimeInput.value.trim(); // Remove espaços em branco
    console.log("Tentando definir tempo de parada com input:", input); // Debugging
    const parts = input.split(':');

    let h = 0;
    let m = 0;
    let s = 0;
    let isValid = true;

    if (parts.length === 1) { // Formato: SS
        s = parseInt(parts[0]);
        if (isNaN(s) || s < 0 || s >= 60) isValid = false;
    } else if (parts.length === 2) { // Formato: MM:SS
        m = parseInt(parts[0]);
        s = parseInt(parts[1]);
        if (isNaN(m) || m < 0 || isNaN(s) || s < 0 || s >= 60) isValid = false;
    } else if (parts.length === 3) { // Formato: HH:MM:SS
        h = parseInt(parts[0]);
        m = parseInt(parts[1]);
        s = parseInt(parts[2]);
        if (isNaN(h) || h < 0 || isNaN(m) || m < 0 || m >= 60 || isNaN(s) || s < 0 || s >= 60) isValid = false;
    } else {
        isValid = false; // Formato de input inválido (mais de 3 ou 0 partes)
    }

    if (isValid) {
        const newStopTimeInSeconds = (h * 3600) + (m * 60) + s;
        
        if (newStopTimeInSeconds >= 0) {
            stopTimeInSeconds = newStopTimeInSeconds;
            stopMessage.textContent = `Cronômetro definido para parar em ${formatTime(newStopTimeInSeconds)}.`;
            console.log("stopTimeInSeconds definido para (total segundos):", stopTimeInSeconds); // Debugging
            
            // Se já estiver correndo e o tempo atual já ultrapassou o tempo de parada
            if (isRunning && seconds >= stopTimeInSeconds) {
                stopTimer();
                stopMessage.textContent = `Cronômetro parou imediatamente no tempo definido: ${formatTime(stopTimeInSeconds)}!`;
                console.log("Parado imediatamente, pois o tempo atual já havia ultrapassado."); // Debugging
                // === NOVO: Inicia a animação de piscar em vermelho se parado imediatamente ===
                startBlinkAnimation();
            }
        } else {
            stopMessage.textContent = "O tempo de parada deve ser positivo.";
            stopTimeInSeconds = null;
            console.log("Erro: Tempo de parada deve ser positivo."); // Debugging
        }
    } else {
        stopMessage.textContent = "Formato de tempo inválido. Use SS, MM:SS ou HH:MM:SS (ex: 30, 01:30, 00:01:30).";
        stopTimeInSeconds = null;
        console.log("Erro: Formato de tempo inválido ou valores fora do range."); // Debugging
    }
}

// === NOVAS FUNÇÕES PARA A ANIMAÇÃO DE PISCAR ===
function startBlinkAnimation() {
    display.classList.add('blink-red');
    // Define um timeout para remover a classe após alguns segundos (ex: 3 segundos)
    blinkTimeout = setTimeout(() => {
        clearBlinkAnimation();
    }, 3000); // Pisca por 3 segundos
}

function clearBlinkAnimation() {
    display.classList.remove('blink-red');
    // Limpa o timeout para evitar que ele remova a classe novamente se já foi removida
    if (blinkTimeout) {
        clearTimeout(blinkTimeout);
        blinkTimeout = null;
    }
}

// Event Listeners
startStopBtn.addEventListener('click', () => {
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', resetTimer);
forwardBtn.addEventListener('click', () => adjustTime(10)); // Avança 10 segundos
backwardBtn.addEventListener('click', () => adjustTime(-10)); // Retrocede 10 segundos
setStopBtn.addEventListener('click', setStopTime);

// Inicializa a exibição
updateDisplay();
console.log("Script carregado e display inicializado."); // Debugging