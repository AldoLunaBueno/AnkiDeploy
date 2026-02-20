Necesito crear una tarjeta Anki de ajedrez. Estoy usando la librería cm-chessboard.js y tengo los siguientes campos en la tarjeta:

- Front: La pregunta o el enunciado del problema.
- FEN: La posición del tablero en formato FEN.
- Arrows: Una lista de flechas para dibujar en el tablero, cada una con un color específico.
- Markers: Una lista de marcadores para dibujar en el tablero, cada uno con un color específico.

Usa este lenguaje visual:

- Rojo (Danger/Frame-Danger): Úsalo para marcar la pieza que está colgada o la casilla donde recibirás mate.
- Verde (Success/Filled): Úsalo para la "Solución" del problema táctico.
- Azul (Info): Úsalo para explicar el "¿Por qué?". Por ejemplo: "El alfil controla esta diagonal (flecha azul)".
- Puntos (Dots): Son muy elegantes para mostrar "todas las casillas a las que puede saltar este caballo" sin ensuciar el tablero con círculos grandes.
- warning -> naranja, default -> gris, secondary -> morado

Ejemplo:

Front:
Analiza la siguiente posición
FEN:
r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4

Arrows:
[
  { "from": "e2", "to": "e4", "type": "success" },
  { "from": "g8", "to": "f6", "type": "default" },
  { "from": "f7", "to": "f5", "type": "danger" },
  { "from": "b1", "to": "c3", "type": "info" },
  { "from": "d8", "to": "h4", "type": "warning" },
  { "from": "a2", "to": "a4", "type": "secondary" }
]

Markers:
[
  { "sq": "e4", "type": "circle-success-filled" },
  { "sq": "e5", "type": "frame-success" },
  { "sq": "d4", "type": "circle-info" },
  { "sq": "d5", "type": "frame-info" },
  { "sq": "f5", "type": "circle-danger-filled" },
  { "sq": "g5", "type": "frame-danger" },
  { "sq": "c3", "type": "circle-warning" },
  { "sq": "b4", "type": "frame-warning" },
  { "sq": "h1", "type": "square" },
  { "sq": "h3", "type": "dot" },
  { "sq": "h3", "type": "bevel" },
  { "sq": "a1", "type": "frame-primary" },
  { "sq": "a8", "type": "circle" }
]