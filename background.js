/**
 * @copyright 2025 Luiz Dias
 * Todos os direitos reservados. Este código não pode ser copiado, modificado ou redistribuído sem permissão.
 */

let refresherActive = false;
let intervalId; // Armazenar o ID do intervalo para poder limpar mais tarde
let currentTabIndex = 0; // Variável para controlar qual aba será recarregada
let tabsArray = []; // Armazenar todas as abas abertas

// Função para recarregar a aba ativa e mudar para a próxima aba
function refreshTabs(refreshInterval, switchInterval) {
  if (tabsArray.length === 0) return; // Se não há abas abertas, não faz nada

  const tab = tabsArray[currentTabIndex]; // Aba a ser recarregada
  chrome.tabs.reload(tab.id, function() {
    console.log(`Aba ${tab.id} recarregada.`);

    // Agora espera pelo tempo de switchInterval antes de trocar para a próxima aba
    setTimeout(() => {
      // Determina a próxima aba
      currentTabIndex = (currentTabIndex + 1) % tabsArray.length; // Cicla para a próxima aba
      chrome.tabs.update(tabsArray[currentTabIndex].id, { active: true });
    }, switchInterval); // Delay de switchInterval após o refresh
  });
}

// Função para iniciar o refresher
function startRefresher(refreshInterval, switchInterval) {
  if (!refresherActive) {
    refresherActive = true;

    // Obtém todas as abas da janela atual
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      tabsArray = tabs; // Salva todas as abas abertas na variável tabsArray

      // Encontra a aba ativa (a aba que o usuário está usando no momento)
      const activeTab = tabs.find(tab => tab.active);
      
      // Começa pela aba ativa
      currentTabIndex = tabsArray.indexOf(activeTab); // Começa pela aba ativa

      console.log(`Iniciando refresher nas abas. Começando pela aba ${currentTabIndex + 1}.`);
      
      // Inicia o intervalo de troca de abas
      intervalId = setInterval(() => {
        refreshTabs(refreshInterval, switchInterval); // Passa tanto o refreshInterval quanto o switchInterval
      }, refreshInterval); // Intervalo de recarregamento da página
    });
  }
}

// Função para parar o refresher
function stopRefresher() {
  console.log("Parando refresher...");
  refresherActive = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  tabsArray = []; // Limpa as abas armazenadas
  currentTabIndex = 0; // Reinicia o índice
  console.log("Refresher parado.");
}

// Escuta as mensagens enviadas pelo popup.js
chrome.runtime.onMessage.addListener((message) => {
  console.log("Mensagem recebida no background:", message);
  if (message.action === "start") {
    startRefresher(message.refreshInterval, message.switchInterval); // Passa os dois intervalos
  } else if (message.action === "stop") {
    stopRefresher();
  }
});




