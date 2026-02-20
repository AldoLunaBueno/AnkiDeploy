// entry.js

// 1. Importamos el Tablero Core
import { Chessboard } from "cm-chessboard";
// Como COLOR, INPUT_EVENT_TYPE, etc. sí aparecían en los imports de ChessboardView en tu snippet,
// probablemente estén disponibles. Si fallan, revisaremos ChessboardView.js.

// 2. Importamos las Extensiones Y sus Constantes
// OJO AQUÍ: Importamos explícitamente MARKER_TYPE y ARROW_TYPE
import { Markers, MARKER_TYPE } from "cm-chessboard/src/extensions/markers/Markers.js";
import { Arrows, ARROW_TYPE } from "cm-chessboard/src/extensions/arrows/Arrows.js";
import { PromotionDialog } from "cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js";

// 3. Importamos la Lógica de Ajedrez
import { Chess } from "chess.js";

// 3. Exportamos todo bajo el namespace global "AnkiChess"
window.AnkiChess = {
    Chess,          // <--- El cerebro (entiende SAN)
    Chessboard,     // <--- Los ojos
    Markers,
    MARKER_TYPE,    // Ahora sí estará disponible
    Arrows,
    ARROW_TYPE,     // ¡Esto es lo que nos faltaba antes!
    PromotionDialog
};

console.log("AnkiChess Bundle con Lógica (SAN) cargado v3.0");