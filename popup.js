/**
 * @copyright 2025 Luiz Dias
 * Todos os direitos reservados. Este código não pode ser copiado, modificado ou redistribuído sem permissão.
 */


document.addEventListener("DOMContentLoaded", () => {
    const intervalInput = document.getElementById("interval");
    const toggleButton = document.getElementById("toggle");
    const statusText = document.getElementById("status");
  
    // Recupera os dados armazenados em chrome.storage
    chrome.storage.local.get(["enabled", "interval", "switchInterval"], (data) => {
        console.log("Dados recuperados de chrome.storage:", data);
        intervalInput.value = data.switchInterval || 6; // Aqui vamos usar o switchInterval
        if (data.enabled) {
            toggleButton.textContent = "Desativar";
            statusText.textContent = `Status: Ativado (${data.switchInterval}s)`;
            statusText.classList.add("ativo");
            statusText.classList.remove("inativo");
        } else {
            toggleButton.textContent = "Ativar";
            statusText.textContent = "Status: Desativado";
            statusText.classList.add("inativo");
            statusText.classList.remove("ativo");
        }
    });
  
    // Evento de clique no botão de alternância
    toggleButton.addEventListener("click", () => {
        const switchInterval = parseInt(intervalInput.value, 10) * 1000 || 6000; // Converte o intervalo de troca de abas para milissegundos
        const refreshInterval = 6000; // O intervalo de recarregamento permanece fixo
  
        if (toggleButton.textContent === "Ativar") {
            console.log("Enviando mensagem para ativar com switchInterval:", switchInterval);
            // Envia a mensagem para o background.js com o switchInterval
            chrome.runtime.sendMessage({ action: "start", switchInterval, refreshInterval });
  
            // Armazena o estado de ativação e o switchInterval em chrome.storage
            chrome.storage.local.set({ enabled: true, switchInterval: switchInterval / 1000 }, () => {
                console.log("Estado de ativação armazenado.");
            });
  
            toggleButton.textContent = "Desativar";
            statusText.textContent = `Status: Ativado (${switchInterval / 1000}s)`;
            statusText.classList.add("ativo");
            statusText.classList.remove("inativo");
        } else {
            console.log("Enviando mensagem para desativar.");
            // Envia a mensagem para desativar o refresher
            chrome.runtime.sendMessage({ action: "stop" });
  
            // Armazena o estado de desativação
            chrome.storage.local.set({ enabled: false }, () => {
                console.log("Estado de desativação armazenado.");
            });
  
            toggleButton.textContent = "Ativar";
            statusText.textContent = "Status: Desativado";
            statusText.classList.add("inativo");
            statusText.classList.remove("ativo");
        }
    });
  });
  
  