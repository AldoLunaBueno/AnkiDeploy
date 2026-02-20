/* _anki_image_overlay_lib.js */

const InteractiveImage = {
    /**
     * Inicializa la imagen interactiva
     * @param {HTMLElement} targetDiv - El div donde se renderizará todo
     * @param {string} imgHtml - El HTML de la etiqueta <img>
     * @param {string} svgHtml - El código SVG crudo
     * @param {string} activeId - El ID (palabra) que se debe resaltar
     * @param {HTMLElement|null} toggleBtn - (Opcional) El botón para activar el modo revelar
     */
    init: function(targetDiv, imgHtml, svgHtml, activeId, toggleBtn) {
        if (!targetDiv) return;

        // 1. Limpieza y preparación del SVG
        const cleanSvg = this._cleanSvgCode(svgHtml);
        
        // 2. Construcción del HTML
        // Usamos un wrapper temporal para manipular antes de insertar
        const tempWrapper = document.createElement('div');
        tempWrapper.innerHTML = imgHtml + cleanSvg;
        
        const svgEl = tempWrapper.querySelector('svg');
        if (svgEl) {
            this._setupSvgAttributes(svgEl);
            this._highlightActiveShape(svgEl, activeId);
        }

        // 3. Renderizado final en el DOM
        targetDiv.innerHTML = `<div class="aii-container">${tempWrapper.innerHTML}</div>`;

        // 4. Configurar botón de revelar (si existe)
        if (toggleBtn) {
            const container = targetDiv.querySelector('.aii-container');
            toggleBtn.onclick = () => {
                container.classList.toggle("reveal-mode");
                
                // Generar etiquetas solo la primera vez (Lazy loading)
                if (container.dataset.labelsGenerated !== "true") {
                    this._generateLabels(container.querySelector('svg'));
                    container.dataset.labelsGenerated = "true";
                }
            };
        }
    },

    // --- Helpers Internos ---

    _cleanSvgCode: function(htmlContent) {
        // Tu lógica de limpieza v2, que es excelente
        const tempDiv = document.createElement("div");
        const preCleaned = htmlContent
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<\/div>/gi, " </div>")
            .replace(/<\/p>/gi, " </p>");
        tempDiv.innerHTML = preCleaned;
        const decodedSvg = tempDiv.textContent || tempDiv.innerText || "";
        return decodedSvg.replace(/\s+/g, " ").trim();
    },

    _setupSvgAttributes: function(svgEl) {
        svgEl.setAttribute("viewBox", "0 0 100 100");
        svgEl.setAttribute("preserveAspectRatio", "none");
        svgEl.style.width = "100%";
        svgEl.style.height = "100%";
        svgEl.style.position = "absolute";
        svgEl.style.top = "0";
        svgEl.style.left = "0";
    },

    _highlightActiveShape: function(svgEl, activeId) {
        if (!activeId) return;
        const lowerId = activeId.toLowerCase();
        
        // Búsqueda insensible a mayúsculas/minúsculas
        let target = svgEl.querySelector(`[id="${activeId}"]`);
        if (!target) {
            const shapes = svgEl.querySelectorAll("[id]");
            for (let s of shapes) {
                if (s.id.toLowerCase() === lowerId) {
                    target = s;
                    break;
                }
            }
        }

        if (target) {
            target.classList.add("aii-active-shape");
            // Limpiar estilos inline conflictivos
            target.style.stroke = "";
            target.style.fill = "";
        }
    },

    _generateLabels: function(svgEl) {
        if (!svgEl) return;
        const shapes = svgEl.querySelectorAll("rect[id], polygon[id], path[id], circle[id]");
        
        shapes.forEach(shape => {
            const idText = shape.id;
            try {
                const bbox = shape.getBBox();
                const centerX = bbox.x + bbox.width / 2;
                const centerY = bbox.y + bbox.height / 2;

                const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textEl.textContent = idText;
                textEl.setAttribute("x", centerX);
                textEl.setAttribute("y", centerY);
                textEl.classList.add("aii-label");
                
                svgEl.appendChild(textEl);
            } catch (e) {
                console.warn("No se pudo calcular BBox para", idText);
            }
        });
    }
};