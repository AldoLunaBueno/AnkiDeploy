// ================= GAMIFICACIÓN (FRONT & BACK) =================

// ANVERSO: Detecta Undo y reproduce sonidos
function runFrontGamification(cardIdText) {
  if (!sessionStorage.getItem("revCount")) {
    sessionStorage.setItem("revCount", "0");
    sessionStorage.setItem("revHistory", JSON.stringify([]));
  }

  let count = parseInt(sessionStorage.getItem("revCount"));
  let history = JSON.parse(sessionStorage.getItem("revHistory"));

  // Detectar UNDO
  if (history.length > 0 && cardIdText === history[history.length - 1]) {
    count--;
    history.pop();
    sessionStorage.setItem("revCount", count.toString());
    sessionStorage.setItem("revHistory", JSON.stringify(history));
    return;
  }

  // Sonidos
  if (count > 0) {
    let isMilestone = count % 10 === 0;
    let audioFile = isMilestone ? "_milestone_10.ogg" : "_card_pass.ogg";
    new Audio(audioFile).play().catch((e) => {});
  }
}

// REVERSO: Incrementa contador y guarda historial
function runBackGamification(cardIdText) {
  // 1. Sonido de respuesta
  new Audio("_card_back.ogg").play().catch((e) => {});

  // 2. Lógica de persistencia
  let count = parseInt(sessionStorage.getItem("revCount") || "0");
  let history = JSON.parse(sessionStorage.getItem("revHistory") || "[]");

  if (history.length === 0 || history[history.length - 1] !== cardIdText) {
    count++;
    history.push(cardIdText);
    sessionStorage.setItem("revCount", count.toString());
    sessionStorage.setItem("revHistory", JSON.stringify(history));
  }
}