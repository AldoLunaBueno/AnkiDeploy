// ================= Puente LLM =================

// ================= Motor =================
function copyPrompt(btnElement, templateId = "explicar") {
  // --- Función auxiliar para limpiar el HTML y recuperar caracteres reales ---
  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // 1. RECOLECCIÓN AUTOMÁTICA DE DATOS
  // Buscamos los textarea con la clase "anki-field-raw"
  const fieldElements = document.querySelectorAll("#prompt-data .anki-field-raw");
  const data = {};

  fieldElements.forEach((el) => {
    const key = el.getAttribute("data-key"); // Ej: "Front", "Back"
    
    // Usamos .value porque en un textarea el contenido es texto plano,
    // preservando <anki-mathjax>, <b>, <span>, etc. intactos.
    let value = el.value.trim();

    // Limpieza de basura de Anki (Campos vacíos o nombres de variables residuales)
    if (!value || value === `{{${key}}}`) {
      value = "";
    } else {
      // Que el prompt tenga los símbolos reales 
      // y no las entidades HTML (ej: &quot; -> "), descomenta esto:
      value = decodeHTML(value);
    }

    // Guardamos en el objeto dinámico
    data[key] = value;
  });

  // 2. CARGA DE PLANTILLA
  let prompt = PROMPT_TEMPLATES[templateId];
  if (!prompt) return console.error(`Plantilla '${templateId}' no encontrada`);

  // 3. REEMPLAZO INTELIGENTE (REGEX)
  // Busca cualquier cosa entre {llaves} en el prompt
  prompt = prompt.replace(/{{(\w+)}}/g, (match, key) => {
    // Si la clave existe en nuestros datos recolectados, la pone.
    // Si no existe (o es null), pone cadena vacía.
    return data.hasOwnProperty(key) ? data[key] : "";
  });

  // 4. COPIAR AL PORTAPAPELES
  const el = document.createElement("textarea");
  el.value = prompt;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  try {
        document.execCommand('copy'); 

        // Guardar texto original en memoria (seguro contra clics repetidos)
        if (!btnElement.dataset.originalText) {
            btnElement.dataset.originalText = btnElement.innerText;
        }

        // Cancelar restauración pendiente si el usuario hace "spam" de clics
        clearTimeout(btnElement.timer);

        // Feedback visual inmediato
        btnElement.innerText = "✓ Copiado";
        btnElement.classList.add("copied");

        // Programar restauración limpia
        btnElement.timer = setTimeout(() => {
            btnElement.innerText = btnElement.dataset.originalText;
            btnElement.classList.remove("copied");
        }, 1000);

    } catch (e) {
        console.error(e);
    }
    
    document.body.removeChild(el);
}