/* _anki_vocabulary_cloze_v7.js */

setTimeout(function() { 
    
    var wordDiv = document.getElementById("data-word");
    var jsonDiv = document.getElementById("data-json");
    var frontCloze = document.getElementById("render-front-cloze");
    var refBack = document.getElementById("render-back"); 

    if (!wordDiv || !jsonDiv || !frontCloze) return;

    var myWord = wordDiv.textContent.trim(); 
    var rawJson = jsonDiv.textContent.trim().replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');

    // Variable global para controlar el bucle de animación
    var hintInterval = null;

    try {
        var data = JSON.parse(rawJson);
        var myWordLower = myWord.toLowerCase();
        var sessionKey = "anki_cloze_v7_" + myWordLower; 

        var correctItem = data.items.find(function(i) {
            return i.word.toLowerCase() === myWordLower;
        });
        
        if (!correctItem) throw new Error("Palabra no encontrada en JSON");

        // --- 1. EXCLUSIÓN ---
        var exclusionMap = {};
        if (data.inflections && Array.isArray(data.inflections)) {
            data.inflections.forEach(function(dimensionGroup) {
                dimensionGroup.forEach(function(tag) {
                    exclusionMap[tag] = dimensionGroup.filter(function(t) { return t !== tag; });
                });
            });
        }

        function parseTags(str) {
            if (!str) return [];
            return str.toLowerCase().split('.').filter(Boolean);
        }

        // --- 2. RESOLUCIÓN ---
        function resolveInflectedForm(item, requiredTagsStr, contextTagsStr) {
            if (!item.inflections || Object.keys(item.inflections).length === 0) return item.word;

            var reqTags = parseTags(requiredTagsStr);
            var ctxTags = parseTags(contextTagsStr);
            var bestMatch = null;
            var bestScore = -1;

            for (var formKey in item.inflections) {
                var formVal = item.inflections[formKey];
                var formTags = parseTags(formKey);
                var isCandidate = true;
                var score = 0;

                for (var i = 0; i < reqTags.length; i++) {
                    if (!formTags.includes(reqTags[i])) { isCandidate = false; break; }
                }
                if (!isCandidate) continue;

                for (var j = 0; j < ctxTags.length; j++) {
                    var ctxTag = ctxTags[j];
                    var forbiddenTags = exclusionMap[ctxTag] || [];
                    for (var k = 0; k < formTags.length; k++) {
                        if (forbiddenTags.includes(formTags[k])) { isCandidate = false; break; }
                    }
                    if (!isCandidate) break;
                }
                if (!isCandidate) continue;

                score += 1; 
                ctxTags.forEach(function(t) { if (formTags.includes(t)) score += 1; });

                if (score > bestScore) { bestScore = score; bestMatch = formVal; }
            }
            return bestMatch; 
        }

        // --- GESTIÓN DE ESTADO ---
        var savedState = null;
        try {
            var stored = sessionStorage.getItem(sessionKey);
            if (stored) savedState = JSON.parse(stored);
        } catch(e) {}

        var viewData = {}; 
        if (savedState) {
            viewData = savedState;
        } else {
            if (!correctItem.sentences || correctItem.sentences.length === 0) throw new Error("No sentences");
            var randomSentenceObj = correctItem.sentences[Math.floor(Math.random() * correctItem.sentences.length)];
            var tmpl = randomSentenceObj.template;
            var regex = /\{([^}]*)\}/; 
            var match = tmpl.match(regex);
            var tagStr = ""; 
            var availableHoles = {}; 
            var staticPrefix = tmpl;
            var staticSuffix = "";
            
            if (match) {
                tagStr = match[1]; 
                var fullMatch = match[0]; 
                var idx = tmpl.indexOf(fullMatch);
                staticPrefix = tmpl.substring(0, idx);
                staticSuffix = tmpl.substring(idx + fullMatch.length);
                if (randomSentenceObj.holes) availableHoles = randomSentenceObj.holes;
            } else {
                staticPrefix = tmpl + " "; 
            }

            viewData.staticPrefix = staticPrefix;
            viewData.staticSuffix = staticSuffix;
            viewData.tagStr = tagStr;       
            viewData.availableHoles = availableHoles;
            viewData.correctWordLemma = correctItem.word;

            var allOtherItems = data.items.filter(function(i) { return i.word.toLowerCase() !== myWordLower; });
            allOtherItems.sort(function() { return 0.5 - Math.random(); });
            var distractorItems = allOtherItems.slice(0, 2);
            var optionsList = [];
            var rawItems = [correctItem].concat(distractorItems);

            rawItems.forEach(function(itm) {
                var bestDisplayText = itm.word; 
                var foundMatch = false;
                var holeKeys = Object.keys(viewData.availableHoles);
                holeKeys.sort(function() { return 0.5 - Math.random(); });

                for (var i = 0; i < holeKeys.length; i++) {
                    var hKey = holeKeys[i];
                    var hTmpl = viewData.availableHoles[hKey];
                    var inflected = resolveInflectedForm(itm, viewData.tagStr, hKey);
                    if (inflected) {
                        bestDisplayText = hTmpl.replace("_", inflected);
                        foundMatch = true;
                        break; 
                    }
                }
                optionsList.push({
                    displayText: bestDisplayText,
                    isCorrect: (itm.word === correctItem.word)
                });
            });
            optionsList.sort(function() { return 0.5 - Math.random(); });
            viewData.options = optionsList;
            sessionStorage.setItem(sessionKey, JSON.stringify(viewData));
        }

        // --- RENDERIZADO (DOM) ---
        frontCloze.innerHTML = "";

        var sentenceBox = document.createElement("div");
        sentenceBox.className = "sentence-box";
        
        // Creamos nodos de texto y el span dinámico
        var spanPrefix = document.createElement("span");
        spanPrefix.innerHTML = viewData.staticPrefix;
        
        var spanBlank = document.createElement("span");
        spanBlank.className = "cloze-blank cloze-hint"; // Agregamos clase para estilo
        spanBlank.innerText = ""; // Valor por defecto
        
        var spanSuffix = document.createElement("span");
        spanSuffix.innerHTML = viewData.staticSuffix;

        sentenceBox.appendChild(spanPrefix);
        sentenceBox.appendChild(spanBlank);
        sentenceBox.appendChild(spanSuffix);
        
        frontCloze.appendChild(sentenceBox);
        
        // Fijamos altura para evitar saltos bruscos
        // (Nota: Esperamos un frame para que renderice y tenga altura, si es crítico se puede forzar)
        requestAnimationFrame(function(){
            if(sentenceBox.offsetHeight > 0) {
                 sentenceBox.style.height = sentenceBox.offsetHeight + "px";
            }
        });

        var btnContainer = document.createElement("div");
        btnContainer.className = "options-container";

        var isBackSide = (refBack !== null);
        if (isBackSide) btnContainer.classList.add("answered");

        // --- LÓGICA DEL CARRUSEL DE HUECOS (Loop) ---
        // Obtenemos los valores de los huecos (ej: "los _ se ven vacíos", "las _ se ven vacías")
        var holeValues = viewData.availableHoles ? Object.values(viewData.availableHoles) : [];
        
        function stopHintLoop() {
            if (hintInterval) clearInterval(hintInterval);
            spanBlank.classList.remove("hint-anim"); // Quitar animación
            spanBlank.classList.add("solved"); // Marcar como resuelto (opacity 1)
        }

        if (!isBackSide && holeValues.length > 0) {
            var loopIndex = 0;
            
            // Función para actualizar texto y reiniciar animación CSS
            function updateHint() {
                spanBlank.innerText = holeValues[loopIndex];
                
                // Reiniciar animación CSS (truco de reflow)
                spanBlank.classList.remove("hint-anim");
                void spanBlank.offsetWidth; // Trigger reflow
                spanBlank.classList.add("hint-anim");
                
                loopIndex = (loopIndex + 1) % holeValues.length;
            }

            // Ejecutar inmediatamente la primera vez
            updateHint();
            
            // Intervalo de 1 segundo
            hintInterval = setInterval(updateHint, 1000);
        } else if (isBackSide) {
             // Si estamos en el Back, detenemos cualquier loop y preparamos para mostrar respuesta
             stopHintLoop();
        }

        // Renderizado de Botones
        viewData.options.forEach(function(opt) {
            var btn = document.createElement("div");
            btn.className = "option-btn";
            btn.innerText = opt.displayText;

            // Función auxiliar para revelar respuesta
            function revealAnswer(text, color) {
                stopHintLoop(); // IMPORTANTE: Detener el bucle
                spanBlank.innerText = text;
                spanBlank.style.color = color;
                spanBlank.style.fontWeight = "bold";
                spanBlank.style.borderBottom = "none";
            }

            if (isBackSide && opt.isCorrect) {
                btn.classList.add("correct");
                revealAnswer(opt.displayText, "#27ae60");
            }

            btn.onclick = function() {
                if (btnContainer.classList.contains("answered")) return;
                btnContainer.classList.add("answered");
                
                if (opt.isCorrect) {
                    btn.classList.add("correct");
                    revealAnswer(opt.displayText, "#27ae60");
                    if (typeof pycmd !== "undefined") pycmd("ans"); 
                } else {
                    btn.classList.add("incorrect");
                    stopHintLoop(); // Detenemos el bucle aunque sea incorrecto para no distraer
                    // Mostramos la respuesta correcta en la frase
                    var correctOpt = viewData.options.find(function(o){ return o.isCorrect; });
                    if(correctOpt) revealAnswer(correctOpt.displayText, "#27ae60");

                    Array.from(btnContainer.children).forEach(function(b, idx) {
                        if (viewData.options[idx].isCorrect) {
                            b.classList.add("missed-correct");
                        }
                    });
                }
            };
            btnContainer.appendChild(btn);
        });

        // --- LÓGICA DEL TOGGLE ---
        if (!isBackSide) {
            btnContainer.style.display = "none";
            var toggleLink = document.createElement("div");
            toggleLink.innerText = "▶ Ver alternativas";
            toggleLink.className = "toggle-text"; 
            
            toggleLink.onclick = function() {
                toggleLink.style.display = "none";
                btnContainer.style.display = "flex"; 
                btnContainer.style.opacity = 0;
                requestAnimationFrame(function(){
                    btnContainer.style.transition = "opacity 0.3s ease";
                    btnContainer.style.opacity = 1;
                });
            };
            
            frontCloze.appendChild(toggleLink);
            frontCloze.appendChild(btnContainer);
        } else {
            frontCloze.appendChild(btnContainer);
        }

        // --- REVERSO (Contexto) ---
        if (refBack && refBack.innerHTML === "") {
            var backHtml = "";
            backHtml += "<div class='context-wrapper'>";
            backHtml += "<details class='context-details' open>"; 
            backHtml += "<summary>Contexto y Definiciones</summary>"; 
            backHtml += "<div class='context-content'>";

            if (data.items && data.items.length > 0) {
                data.items.forEach(function(ctxItem) {
                    var isCurrent = (ctxItem.word.toLowerCase() === myWordLower);
                    var activeClass = isCurrent ? " is-current" : "";
                    var def = ctxItem.definition || ctxItem.formal_definition || "";
                    backHtml += "<div class='context-item" + activeClass + "'>";
                    backHtml += "<span class='context-word'>" + ctxItem.word + "</span>";
                    if(def) backHtml += "<div class='context-def'>" + def + "</div>";
                    backHtml += "</div>";
                });
            }
            backHtml += "</div></details></div>";
            refBack.innerHTML = backHtml;
        }

    } catch (e) {
        frontCloze.innerHTML = "<div style='color:red; padding:10px;'>Error JS: " + e.message + "</div>";
        console.error(e);
    }

}, 100);