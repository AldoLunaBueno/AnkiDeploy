(function () {
  // Verificación de seguridad: si ABCJS no cargó, no hacemos nada para evitar crash
  if (typeof ABCJS === "undefined") {
    console.error("ABCJS no está cargado. Asegúrate de incluir _abc.js antes.");
    return;
  }

  window.AnkiABC = {
    settings: {
      instrument: 0,
      soundfont: "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/",
    },

    cleanABC: function (rawField) {
      var tmp = document.createElement("DIV");
      tmp.innerHTML = rawField;

      // Limpieza de HTML
      var html = tmp.innerHTML
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?div>/gi, "\n");
      tmp.innerHTML = html;

      var rawText = (tmp.innerText || tmp.textContent || "").trim();

      // 1. Inyección de X:1 (Obligatorio por el estándar ABC)
      // Si el texto no empieza con "X:número", lo agregamos al principio.
      if (!/^X:\s*\d+/i.test(rawText)) {
        rawText = "X:1\n" + rawText;
      }

      // 2. Inyección de Instrumento MIDI
      // Se inserta DESPUÉS de X:1, ya que X debe ser siempre la primera línea.
      if (rawText.indexOf("%%MIDI program") === -1) {
        // Buscamos la línea X: y le pegamos el comando MIDI justo debajo
        rawText = rawText.replace(
          /^(X:\s*\d+.*)$/m,
          "$1\n%%MIDI program " + this.settings.instrument
        );
      }

      return rawText;
    },

    safeTrim: function (divId) {
      var svg = document.querySelector("#" + divId + " svg");
      if (!svg) return;
      try {
        var allElements = svg.querySelectorAll("path, text");
        var maxRight = 0;
        for (var i = 0; i < allElements.length; i++) {
          var box = allElements[i].getBBox();
          // Filtro heurístico para ignorar líneas de pentagrama completas
          if (box.width < svg.viewBox.baseVal.width * 0.8) {
            var rightEdge = box.x + box.width;
            if (rightEdge > maxRight) maxRight = rightEdge;
          }
        }
        if (maxRight > 10) {
          var vb = svg.viewBox.baseVal;
          // Ajustamos el viewBox para recortar el espacio vacío a la derecha
          svg.setAttribute("viewBox", `0 0 ${maxRight + 20} ${vb.height}`);
        }
      } catch (e) {
        console.warn("Trim error", e);
      }
    },

    render: function (abcRaw, options) {
      var self = this;
      var abcString = this.cleanABC(abcRaw);

      // 1. Render Visual
      var visualObj = ABCJS.renderAbc("paper", abcString, {
        responsive: "resize",
        add_classes: true, // Útil para CSS avanzado luego
        paddingtop: 0,
        paddingbottom: 0,
        paddingleft: 0,
        paddingright: 0,
      });

      // Recorte visual post-renderizado
      setTimeout(function () {
        self.safeTrim("paper");
      }, 100);

      // 2. Render de Audio
      // OJO: Si options.showAudio es false, esto NUNCA se ejecuta.
      if (
        options &&
        options.showAudio &&
        ABCJS.synth &&
        ABCJS.synth.supportsAudio()
      ) {
        var audioDiv = document.getElementById("audio");
        if (audioDiv) audioDiv.style.display = "block";

        var synthControl = new ABCJS.synth.SynthController();
        synthControl.load("#audio", null, {
          displayPlay: true,
          displayProgress: true,
        });

        var midiBuffer = new ABCJS.synth.CreateSynth();
        midiBuffer
          .init({
            visualObj: visualObj[0],
            soundFontUrl: this.settings.soundfont,
          })
          .then(function () {
            return synthControl.setTune(visualObj[0], false);
          })
          .catch(function (e) {
            console.error("Audio error", e);
          });
      }
    },
  };
})();
