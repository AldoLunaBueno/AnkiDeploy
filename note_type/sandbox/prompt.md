Necesito generar el código para una tarjeta de Anki "Gamificada" personalizada.

Esta tarjeta usa una arquitectura especial de 4 campos: **HTML, CSS, JS y Data (JSON)**.

### 1. REGLAS TÉCNICAS (Estrictas)

El código debe respetar este entorno de ejecución (Sandbox):

* **HTML:** Estructura pura. No uses tags `<html>`, `<head>` o `<body>`. Usa IDs descriptivos.
* **CSS:**
  * **Layout "Full Canvas":** El diseño DEBE ocupar el 100% del ancho y alto del sandbox.
  * **Integración Visual:** NO crees un contenedor visual tipo "tarjeta" (nada de `box-shadow`, `border`, `margin: auto` o fondos de contenedor que parezcan una caja flotante). El sandbox ya vive dentro de una tarjeta estilizada.
  * **Estilos:** Aplica estilos modernos y "dark mode friendly" directamente a los elementos interactivos (inputs, botones) y tipografía, pero usa el `:host` o un `div` contenedor transparente de tamaño completo (`width: 100%; height: 100%; display: flex/grid`) para distribuir el contenido.
* **DATA (JSON):** Aquí debe ir TODA la configuración (vocabulario, preguntas, respuestas, textos de la UI, parámetros de dificultad). El objetivo es que la tarjeta sea configurable solo editando este JSON, sin tocar el JS.
* **JAVASCRIPT:**
  * **Contexto:** El script se ejecuta dentro de un `new Function`.
  * **DOM:** La variable `document` que recibes NO es el documento global, es el `ShadowRoot` de la tarjeta. Usa `document.getElementById` con normalidad.
  * **Input de Datos:** Recibes el JSON parseado automáticamente en una variable llamada **`ChallengeData`**. Úsala para poblar la UI.
  ***Condición de Victoria:** Cuando el usuario resuelva el ejercicio correctamente, DEBES ejecutar la función **`challengeSolved()`**. Esto avisa a Anki que la tarjeta fue respondida bien.
  * **Manejo de Errores:** Evita `console.log` excesivos. Usa `try/catch` si hay riesgo de fallo.
  * **Interacción:** Prefiere eventos `oninput` o `onclick` directos sobre `addEventListener` para evitar duplicidad de listeners al renderizar.

### 2. EL OBJETIVO EDUCATIVO

Quiero una tarjeta que cumpla con la siguiente descripción:

TEMA: PORCENTAJES (RESULTADO ENTERO)
Esquema: ¿Cuál es el P% de N?
Instrucciones: Varía P en (10, 20, 25, 50). Varía N entre 10 y 1000. Restricción: N debe ser múltiplo de (100/P) para que el resultado sea un número entero.

### 3. FORMATO DE SALIDA

Por favor, entrégame el código en 4 bloques de código separados y etiquetados claramente:

1. **Data (JSON)**
2. **HTML**
3. **CSS**
4. **JS**
