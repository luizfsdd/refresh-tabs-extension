document.addEventListener("DOMContentLoaded", () => {
    const intervalInput = document.getElementById("interval");
    const switchDelayInput = document.getElementById("switchDelay"); 
    const toggleButton = document.getElementById("toggle");
    const toggleSwitch = document.getElementById("toggleSwitch");
    const statusText = document.getElementById("status");

    // Recupera os dados armazenados
    chrome.storage.local.get(["enabled", "switchInterval", "switchDelay", "refresh"], (data) => {
        intervalInput.value = data.switchInterval || 6;
        switchDelayInput.value = data.switchDelay || 3.5; 
        toggleSwitch.checked = data.refresh ?? true;
     

        updateUI(data.enabled ?? false, data.switchInterval);
    });

    toggleButton.addEventListener("click", () => {
        const switchInterval = parseInt(intervalInput.value, 10) * 1000 || 6000;
        const switchDelay = parseFloat(switchDelayInput.value) * 1000 || 3500; 
        const refresh = toggleSwitch.checked;
        const newState = toggleButton.textContent === "Ativar";

        chrome.storage.local.set({ enabled: newState, switchInterval: switchInterval / 1000, switchDelay: switchDelay / 1000, refresh }, () => {
            updateUI(newState, switchInterval / 1000);
            chrome.runtime.sendMessage(newState ? { action: "start", switchInterval, switchDelay, refresh } : { action: "stop" });
        });
    });

    toggleSwitch.addEventListener("change", () => {
        chrome.storage.local.set({ refresh: toggleSwitch.checked });
    });

    function updateUI(isEnabled, switchInterval) {
        toggleButton.textContent = isEnabled ? "Desativar" : "Ativar";
        statusText.textContent = isEnabled ? `Ativado (${switchInterval}s)` : "Desativado";
        statusText.classList.toggle("ativo", isEnabled);
        statusText.classList.toggle("inativo", !isEnabled);
    }
});

