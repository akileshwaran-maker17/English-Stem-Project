let recognition = null;
let isListening = false;

// Check Grammar
async function checkGrammar() {
    const inputText = document.getElementById("inputText").value.trim();
    const originalText = document.getElementById("originalText");
    const correctedText = document.getElementById("correctedText");
    const issuesCount = document.getElementById("issuesCount");

    clearStatus();

    if (!inputText) {
        showStatus("Please enter or speak some text first.", "error");
        return;
    }

    try {
        const response = await fetch("/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: inputText })
        });

        const data = await response.json();

        if (!response.ok) {
            showStatus(data.error || "Grammar checking failed.", "error");
            return;
        }

        // FIXED: removes unwanted \n display issue
        originalText.innerHTML = formatText(data.original);
        correctedText.innerHTML = formatText(data.corrected);
        issuesCount.textContent = data.issues_found || 0;

        showStatus("Grammar checked successfully!", "success");

    } catch (error) {
        showStatus("Server error. Please ensure Flask app is running.", "error");
    }
}

// Save File
async function saveFile() {
    const correctedText = document.getElementById("correctedText").innerText.trim();
    let fileName = document.getElementById("fileName").value.trim();

    clearStatus();

    if (!correctedText || correctedText === "Corrected text will appear here...") {
        showStatus("No corrected text available to save.", "error");
        return;
    }

    if (!fileName) {
        fileName = "corrected.txt";
    }

    try {
        const response = await fetch("/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filename: fileName,
                content: correctedText
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showStatus(data.error || "Failed to save file.", "error");
            return;
        }

        showStatus(`File saved successfully at: ${data.filepath}`, "success");

    } catch (error) {
        showStatus("Server error while saving file.", "error");
    }
}

// Clear All
function clearAll() {
    stopSpeaking();

    document.getElementById("inputText").value = "";
    document.getElementById("originalText").innerHTML = "Your original text will appear here...";
    document.getElementById("correctedText").innerHTML = "Corrected text will appear here...";
    document.getElementById("issuesCount").textContent = "0";
    document.getElementById("voiceStatus").textContent = "Idle";
    document.getElementById("fileName").value = "corrected.txt";

    clearStatus();
}

// Format text (fixes unwanted \n issue safely)
function formatText(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\\n/g, "<br>")
        .replace(/\n/g, "<br>");
}

// Voice Input
function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceStatus = document.getElementById("voiceStatus");
    const inputText = document.getElementById("inputText");

    if (!SpeechRecognition) {
        showStatus("Voice input not supported. Please use Google Chrome.", "error");
        return;
    }

    if (isListening && recognition) {
        recognition.stop();
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
        isListening = true;
        voiceStatus.textContent = "Listening...";
        showStatus("Microphone started. Speak now...", "success");
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;

        if (inputText.value.trim()) {
            inputText.value += " " + transcript;
        } else {
            inputText.value = transcript;
        }

        voiceStatus.textContent = "Completed";
        showStatus("Voice input captured successfully!", "success");
    };

    recognition.onerror = function (event) {
        voiceStatus.textContent = "Error";
        showStatus("Voice input error: " + event.error, "error");
    };

    recognition.onend = function () {
        isListening = false;
        if (voiceStatus.textContent === "Listening...") {
            voiceStatus.textContent = "Stopped";
        }
    };

    recognition.start();
}

// Speak Input Text
function speakInputText() {
    const text = document.getElementById("inputText").value.trim();

    if (!text) {
        showStatus("Please enter or speak input text first.", "error");
        return;
    }

    speakText(text);
}

// Speak Corrected Text
function speakCorrectedText() {
    const text = document.getElementById("correctedText").innerText.trim();

    if (!text || text === "Corrected text will appear here...") {
        showStatus("No corrected text available to speak.", "error");
        return;
    }

    speakText(text);
}

// Common Audio Output Function
function speakText(text) {
    if (!("speechSynthesis" in window)) {
        showStatus("Audio output is not supported in this browser.", "error");
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = function () {
        showStatus("Audio started...", "success");
    };

    utterance.onend = function () {
        showStatus("Audio completed.", "success");
    };

    utterance.onerror = function () {
        showStatus("Audio output failed.", "error");
    };

    window.speechSynthesis.speak(utterance);
}

// Stop Audio
function stopSpeaking() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        showStatus("Audio stopped.", "success");
    }
}

// Status Functions
function showStatus(message, type) {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    statusMessage.className = "status-message";

    if (type === "success") {
        statusMessage.classList.add("success-msg");
    } else {
        statusMessage.classList.add("error-msg");
    }
}

function clearStatus() {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
}