// ================= Herramientas de renderizado =================

function renderMermaid() {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            // Desactivamos el ancho máximo automático
            flowchart: { useMaxWidth: false }, 
            er: { useMaxWidth: false },
            sequence: { useMaxWidth: false }
        });

        const nodes = document.querySelectorAll('.mermaid');
        if (nodes.length > 0) {
            mermaid.init(undefined, nodes);
        }
    }
}

function highlightCode() {
    if (typeof Prism === 'undefined') return;

    // Buscamos todos los bloques de código
    document.querySelectorAll('pre code').forEach((codeElement) => {
        const preElement = codeElement.parentElement;

        // --- PASO A: LIMPIEZA TOTAL ---
        // 1. Eliminamos cualquier fila de números previa para evitar duplicados
        const existingRows = preElement.querySelector('.line-numbers-rows');
        if (existingRows) existingRows.remove();

        // 2. Quitamos clases que Prism añade automáticamente y que pueden causar conflictos
        preElement.classList.remove('code-toolbar'); 

        // --- PASO B: FORMATEO ---
        // Limpiamos espacios en blanco de Anki
        if (!codeElement.dataset.originalContent) {
            // Guardamos el contenido original para poder re-renderizar sin perder texto
            codeElement.dataset.originalContent = codeElement.textContent.trim();
        }
        codeElement.textContent = codeElement.dataset.originalContent;

        // --- PASO C: RESALTADO ---
        Prism.highlightElement(codeElement);
    });
}
// --- CONFIGURACIÓN DE ASSETS ---
// Solo gestionamos JS. El CSS ya está en la plantilla.
const engines = {
    prism:  { js: '_prism.js',  selector: 'pre code' },
    mermaid:{ js: '_mermaid.js',selector: '.mermaid' }
};

// --- CARGADOR DE SCRIPTS (Promesa simple) ---
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Si ya está cargado, resolver inmediatamente
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// --- LIMPIADOR DE TEXTO (CRÍTICO PARA ANKI) ---
// Convierte el HTML basura de Anki (<br>, <div>) en texto limpio para las librerías
function getCleanText(element) {
    // 1. Reemplazar <br> y <div> por saltos de línea
    let html = element.innerHTML;
    html = html.replace(/<br\s*\/?>/gi, '\n');
    html = html.replace(/<div\s*>/gi, '\n');
    html = html.replace(/<\/div>/gi, '');
    html = html.replace(/&nbsp;/g, ' '); // Espacios duros a normales
    html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return html.trim();
}

// --- ORQUESTADOR PRINCIPAL ---
async function smartRender() {

    // 1. MERMAID (Solución al Syntax Error)
    if (document.querySelector(engines.mermaid.selector)) {
      try {
        await loadScript('_mermaid.js');
        if (typeof mermaid !== 'undefined') {
          mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
          const nodes = document.querySelectorAll(engines.mermaid.selector);
          for (const node of nodes) {
            if (node.getAttribute('data-processed')) continue;
            const cleanCode = getCleanText(node);
            node.textContent = cleanCode;
            node.removeAttribute('data-processed');
            await mermaid.run({ nodes: [node] });
            node.setAttribute('data-rendered', 'true'); // Mostrar cuando está renderizado
          }
        }
      } catch (e) { console.error("Error Mermaid", e); }
    }

    // 2. PRISM (Código)
    if (document.querySelector(engines.prism.selector)) {
      try {
        await loadScript('_prism.js');

        // --- FUNCIONES AUXILIARES PARA PRISM ---
        function applyPrismToCodeElements() {
          document.querySelectorAll('pre code').forEach((codeElement) => {
            // Guardar contenido "limpio" original si no existe
            if (!codeElement.dataset.originalContent) {
              codeElement.dataset.originalContent = getCleanText(codeElement);
              codeElement.dataset.prismAttempts = "0";
            }

            // Si excedimos intentos, no reintentar
            const attempts = parseInt(codeElement.dataset.prismAttempts || "0", 10);
            if (attempts >= 5) return;

            // Restaurar texto con saltos de línea reales antes del resaltado
            codeElement.textContent = codeElement.dataset.originalContent;

            // Resaltar
            try {
              Prism.highlightElement(codeElement);
              codeElement.setAttribute('data-rendered', 'true'); // Mostrar cuando está renderizado
              codeElement.dataset.prismAttempts = (attempts + 1).toString();
            } catch (err) {
              console.error("Prism highlight error", err);
            }
          });
        }

        // Aplica inmediatamente si Prism ya está disponible
        if (
           Prism !== 'undefined') {
          applyPrismToCodeElements();
        }

        // Observador: re-aplica Prism si Anki modifica el DOM (debounce)
        (function initPrismObserver() {
          if (window._prismObserverInitialized) return;
          window._prismObserverInitialized = true;

          let debounce;
          const observer = new MutationObserver(() => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
              if (typeof Prism !== 'undefined') applyPrismToCodeElements();
            }, 150);
          });

          observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        })();

      } catch (e) { console.error("Error Prism", e); }
    }
    
}