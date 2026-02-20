# 📚 Anki Renderizado Dinámico Robusto

## Problema Original

Al sincronizar tarjetas Anki desde PC a AnkiDroid (móvil), el renderizado de librerías **faltaba o se veía incorrectamente**:

- **Mermaid**: Errores de sintaxis (el contenido llegaba con HTML sucio: `<br>`, `<div>`).
- **Prism**: El código colapsaba en una sola línea, sin resaltado de colores.
- **KaTeX**: Solo se renderizaban fórmulas inline (`$...$`), no las de bloque (`$$...$$`).

En PC funcionaba perfectamente, lo que indicaba que **AnkiDroid modificaba el DOM después de insertar el HTML**, "aplanando" el contenido.

---

## Soluciones Implementadas

### 1. **Enganche Temprano (DOMContentLoaded)**

```javascript
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', smartRender);
  } else {
    smartRender();
  }
})();
```

**¿Por qué?** Garantiza que `smartRender()` se ejecute apenas el DOM esté listo, antes de que AnkiDroid tenga oportunidad de modificarlo.

---

### 2. **Limpieza de HTML Sucio (getCleanText)**

La función `getCleanText()` convierte el HTML de Anki en texto plano:

```javascript
function getCleanText(element) {
    let html = element.innerHTML;
    html = html.replace(/<br\s*\/?>/gi, '\n');        // <br> → \n
    html = html.replace(/<div\s*>/gi, '\n');          // <div> → \n
    html = html.replace(/<\/div>/gi, '');              // </div> → (vacío)
    html = html.replace(/&nbsp;/g, ' ');              // &nbsp; → espacio
    html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return html.trim();
}
```

- **Mermaid**: Usa `getCleanText()` para extraer código limpio antes de renderizar.
- **KaTeX**: Se beneficia indirectamente de delimitadores alternativos (\[...\], \(...\)).

---

### 3. **Re-aplicación Automática de Prism (MutationObserver)**

El reto específico de Prism es que AnkiDroid convierte saltos de línea en `<br>` o los elimina completamente. La solución:

```javascript
function applyPrismToCodeElements() {
  document.querySelectorAll('pre code').forEach((codeElement) => {
    // Guardar contenido original la primera vez
    if (!codeElement.dataset.originalContent) {
      codeElement.dataset.originalContent = getCleanText(codeElement);
      codeElement.dataset.prismAttempts = "0";
    }

    // Limitar reintentos (máx. 5 intentos por bloque)
    const attempts = parseInt(codeElement.dataset.prismAttempts || "0", 10);
    if (attempts >= 5) return;

    // Restaurar contenido limpio y resaltar
    codeElement.textContent = codeElement.dataset.originalContent;
    Prism.highlightElement(codeElement);
    codeElement.dataset.prismAttempts = (attempts + 1).toString();
  });
}

// Observador que re-aplica Prism si el DOM cambia
const observer = new MutationObserver(() => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    if (typeof Prism !== 'undefined') applyPrismToCodeElements();
  }, 150); // Debounce: espera 150ms para evitar spam
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });
```

**¿Cómo funciona?**
- Aplica Prism **inmediatamente** tras cargar la librería.
- Si AnkiDroid modifica el DOM (lo que causa `MutationEvent`), re-aplica automáticamente.
- Limita intentos a 5 para evitar bucles infinitos.
- Usa debounce para no procesarspam de eventos.

---

### 4. **Delimitadores Alternativos para KaTeX**

En Anki, cuando usas delimitadores como `\[...\]` o `\(...\)`, Anki Desktop los convierte automáticamente a etiquetas especiales (`<anki-mathjax>`), que **sobreviven intactas** en AnkiDroid y son renderizadas correctamente.

**Recomendación:**
- **Fórmulas de bloque (display)**: Usa `\[...\]`
- **Fórmulas inline**: Usa `\(...\)`

Ejemplo:

```
\[
Replicas_{deseadas} = \lceil Replicas_{actuales} \cdot \frac{Metrica_{actual}}{Metrica_{objetivo}} \rceil
\]
```

---

## Cómo Funciona Ahora

| Librería | Problema Original | Solución | Resultado |
|----------|------------------|----------|-----------|
| **Mermaid** | HTML sucio aplanaba el diagrama | `getCleanText()` limpia `<br>/<div>` antes de renderizar | ✅ Diagramas renderizados correctamente |
| **Prism** | Saltos de línea se perdían en móvil | MutationObserver re-aplica resaltado en cada cambio del DOM | ✅ Código con colores y saltos de línea |
| **KaTeX** | Solo `$...$` funcionaba | Delimitadores alternativos (`\[...\]`) generan etiquetas especiales | ✅ Fórmulas inline y bloque renderizadas |

---

## Instrucciones de Uso

### Para Código (Prism)

1. **En el editor de Anki**, escribe el código en un bloque:
   ```html
   <pre><code class="language-python">
   def foo():
       return 42
   </code></pre>
   ```

2. **Asegúrate de:**
   - Que el campo sea **texto plano** (no HTML enriquecido).
   - Que haya saltos de línea **reales** (no espacios en blanco).

3. **Resultado:** El código se resaltará automáticamente en PC y móvil, con re-aplicaciones automáticas si el DOM cambia.

### Para Fórmulas (KaTeX)

1. **Usa delimitadores alternativos:**
   ```
   \[ a^2 + b^2 = c^2 \]  (bloque)
   \( e = mc^2 \)         (inline)
   ```

2. **No uses:**
   ```
   $$ a^2 + b^2 = c^2 $$  (puede fallar en móvil)
   ```

3. **Resultado:** Anki convertirá automáticamente a etiquetas `<anki-mathjax>` que funcionan en todos lados.

### Para Diagramas (Mermaid)

1. **Escribe el diagrama en un elemento con clase `mermaid`:**
   ```html
   <div class="mermaid">
   graph TD
       A --> B
       B --> C
   </div>
   ```

2. **Resultado:** Se renderizará automáticamente, incluso si AnkiDroid "aplana" el HTML.

---

## Optimización: Carga Condicional de Librerías

Las librerías se cargan **solo si se detectan** en la tarjeta:

- **Mermaid**: Solo si hay elementos con clase `.mermaid`.
- **Prism**: Solo si hay `<pre><code>`.
- **KaTeX**: Solo si hay delimitadores `$`, `\(`, `\[` en el texto.

Esto reduce el consumo de recursos y mejora la velocidad, especialmente en móvil.

---

## Estructura del Código

El archivo `_anki_lib.js` contiene:

1. **Configuración** (TAG_CONFIG): Colores y logos por etiqueta.
2. **UI** (renderCardStyles): Estilos visuales dinámicos.
3. **Gamificación** (runFrontGamification, runBackGamification): Contador y sonidos.
4. **LLM Bridge** (copyPrompt): Generador de prompts para IA.
5. **Orquestador** (smartRender): Carga y renderiza Mermaid, Prism y KaTeX dinámicamente.

---

## Resolución de Problemas

### El código sigue en una sola línea en móvil

1. Verifica que el campo sea **texto plano**, no "HTML editor".
2. Recarga la tarjeta.
3. Si persiste, prueba escrbiendo el código nuevamente para forzar un guardado sin HTML extra.

### Las fórmulas no se renderizanañ

1. Usa `\[...\]` o `\(...\)` en lugar de `$$...$`.
2. Asegúrate de que los delimitadores estén en una línea separada.

### Mermaid sigue con errores de sintaxis

1. Abre la tarjeta en PC y abre la consola (Tools → Developer Tools).
2. Busca errores de Mermaid en la consola.
3. Verifica que el diagrama sea válido en https://mermaid.live.

---

## Conclusión

El sistema ahora maneja dinámicamente:
- **Carga selectiva** de librerías (solo si se usan).
- **Limpieza automática** del HTML sucio de Anki.
- **Re-aplicación automática** de Prism en caso de cambios del DOM.
- **Delimitadores alternativos** para máxima compatibilidad de KaTeX.

Esto garantiza compatibilidad total en **PC y móvil (AnkiDroid)** sin perder velocidad.

---

Última actualización: 29 de diciembre de 2025
