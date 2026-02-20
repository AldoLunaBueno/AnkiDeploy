    (function() {
        var instrumento = 0; // 0=Piano, 40=Violin, 73=Flauta

        function log(msg, err) {
            var el = document.getElementById('status');
            if(el && err) el.innerHTML = msg; // Solo mostramos errores graves al usuario
        }

        function getCleanABC() {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = `{{Front_ABC_Code}}`;
            
            // Limpieza agresiva para AnkiDroid
            var html = tmp.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?div>/gi, "\n");
            tmp.innerHTML = html;
            var rawText = (tmp.innerText || tmp.textContent || "").trim();
            
            if (rawText.indexOf("%%MIDI program") === -1) {
                return "%%MIDI program " + instrumento + "\n" + rawText;
            }
            return rawText;
        }

        // --- Recorte Inteligente (Restaurado) ---
        function safeTrim(divId) {
            var svg = document.querySelector("#" + divId + " svg");
            if (!svg) return;
            try {
                var testBox = svg.getBBox();
                if (testBox.width === 0) return; // Protección móvil

                var originalWidth = svg.viewBox.baseVal.width || parseInt(svg.getAttribute("width"));
                var allElements = svg.querySelectorAll("path, text");
                var maxRight = 0;

                for (var i = 0; i < allElements.length; i++) {
                    try { // Heurística para ignorar pentagrama vacío
                        var box = allElements[i].getBBox();
                        if (box.width < (originalWidth * 0.90)) {
                            var rightEdge = box.x + box.width;
                            if (rightEdge > maxRight) maxRight = rightEdge;
                        }
                    } catch(e) {}
                }

                if (maxRight > 50) {
                    var vb = svg.getAttribute("viewBox").split(" ");
                    // Dejamos 20px de aire a la derecha
                    var newViewBox = [vb[0], vb[1], maxRight + 20, vb[3]].join(" ");
                    svg.setAttribute("viewBox", newViewBox);
                    svg.removeAttribute("width"); svg.removeAttribute("height");
                    svg.style.width = "100%"; svg.style.height = "auto";
                }
            } catch (e) { console.warn("Trim error", e); }
        }

        var initCard = function() {
            if (typeof ABCJS === 'undefined') return;

            var abcString = getCleanABC();

            // Renderizado Responsive (Volvemos a lo bonito)
            var visualObj = ABCJS.renderAbc("paper", abcString, { 
                responsive: "resize",
                scale: 1,
                paddingtop: 15, paddingbottom: 160, paddingleft: 10, paddingright: 10
            });

            // Intentar recorte tras un respiro (para que el móvil haya dibujado)
            setTimeout(function() { safeTrim("paper"); }, 600);

            if (ABCJS.synth && ABCJS.synth.supportsAudio()) {
                var synthControl = new ABCJS.synth.SynthController();
                synthControl.load("#audio", null, { displayPlay: true, displayProgress: true, displayWarp: true });
                var midiBuffer = new ABCJS.synth.CreateSynth();
                midiBuffer.init({ 
                    visualObj: visualObj[0],
                    soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/"
                }).then(function () {
                    return synthControl.setTune(visualObj[0], false, { chordsOff: false });
                }).catch(function (e) { log("Audio offline", true); });
            }
        };

        // Polling de seguridad
        var attempts = 0;
        var checker = setInterval(function() {
            if (typeof ABCJS !== 'undefined') {
                clearInterval(checker);
                // Pequeño delay inicial para asegurar estabilidad DOM en móvil
                setTimeout(initCard, 100);
            } else if (attempts++ > 20) clearInterval(checker);
        }, 100);
    })();