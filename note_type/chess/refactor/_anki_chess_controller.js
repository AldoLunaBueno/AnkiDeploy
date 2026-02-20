/* _anki_chess_controller.js */

window.AnkiChessController = (function () {
  // Función auxiliar para inyectar Sprites (Singleton)
  function injectSprite(base64String, uniqueId) {
    if (document.getElementById(uniqueId)) return;
    try {
      var base64 = base64String.split(",")[1] || base64String;
      var decoded = atob(base64);
      var div = document.createElement("div");
      div.id = uniqueId;
      div.style.display = "none";
      div.innerHTML = decoded;
      document.body.appendChild(div);
    } catch (e) {
      console.error("Error inyectando sprite:", uniqueId, e);
    }
  }

  // Función de parseo robusto (Tu lógica original)
  function parseJson(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return null; // Si no existe el div, devolvemos null
    
    var htmlContent = el.innerHTML;
    
    var temp = htmlContent
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/div>/gi, " ")
      .replace(/<div>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<p>/gi, " ")
      .replace(/<[^>]+>/g, ""); // Eliminar etiquetas
    
    var txt = document.createElement("textarea");
    txt.innerHTML = temp;
    var cleanText = txt.value
      .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .trim();

    if (cleanText === "") return null;
    try {
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Error JSON en element " + elementId + ":", e);
      return null;
    }
  }

 // --- CLASE PRINCIPAL ---
  function ChessInstance(config) {
    this.wrapper = document.getElementById(config.wrapperId);
    if (!this.wrapper) return;

    // 1. Parsear Datos
    var boardData = parseJson(config.dataIds.board);
    var sequenceData = parseJson(config.dataIds.sequence);

    // Si no hay datos de tablero (FEN), abortamos, aunque el template ya debería haber prevenido esto.
    if (!boardData || !boardData.fen) {
        console.warn("No se encontró FEN válido en el campo Board.");
        return;
    }

    this.fen = boardData.fen;
    this.markersData = boardData.markers || [];
    this.arrowsData = boardData.arrows || [];
    this.sequenceData = sequenceData || []; // Puede estar vacío

    // 2. Referencias DOM
    this.container = this.wrapper.querySelector(".board-container-inner");
    this.controlBar = this.wrapper.querySelector(".control-bar"); // Referencia a la barra entera
    this.btnPlay = this.wrapper.querySelector(".play-btn");
    this.iconPlay = this.wrapper.querySelector(".icon-play");
    this.iconPause = this.wrapper.querySelector(".icon-pause");

    this.isPlaying = false;
    this.activeAnnotations = { markers: [], arrows: [] };
    this.board = null;
    this.game = null;

    this.init();
  }

  ChessInstance.prototype.init = function () {
    if (!window.AnkiChessAssets) {
      console.error("Error: _anki_chess_sprites.js no cargado");
      return;
    }

    // Inyectar Assets
    injectSprite(window.AnkiChessAssets.standard, "anki-chess-pieces");
    injectSprite(window.AnkiChessAssets.arrows, "anki-chess-arrows");
    injectSprite(window.AnkiChessAssets.markers, "anki-chess-markers");

    // Inicializar Tablero
    try {
      this.board = new AnkiChess.Chessboard(this.container, {
        position: this.fen,
        assetsUrl: "",
        style: { aspectRatio: 1, borderType: "thin", cssClass: "pink-ivory" },
        sprite: { url: "" },
        extensions: [
          { class: AnkiChess.Arrows, sprite: { url: "" } },
          { class: AnkiChess.Markers, sprite: { url: "" } },
          { class: AnkiChess.PromotionDialog },
        ],
      });
    } catch (e) {
      console.error("Error init board:", e);
      return;
    }

    // Dibujado inicial
    var self = this;
    setTimeout(function () {
      self.drawStaticAnnotations();
    }, 50);

    // --- Lógica condicional de controles de la película ---
    // Si NO hay secuencia, ocultamos toda la barra de controles
    if (!this.sequenceData || this.sequenceData.length === 0) {
        if (this.controlBar) this.controlBar.style.display = "none";
    } else {
        // Si hay secuencia, inicializamos la lógica de reproducción
        this.game = new AnkiChess.Chess(this.fen);
        this.btnPlay.onclick = this.handlePlayClick.bind(this);
    }
  };

  ChessInstance.prototype.drawStaticAnnotations = function () {
    var self = this;
    this.markersData.forEach(function (m) {
      var config = { class: "marker-" + m.type, slice: "markerCircle" };
      if (m.type.includes("frame")) config.slice = "markerFrame";
      else if (m.type.includes("square")) config.slice = "markerSquare";
      else if (m.type.includes("dot")) config.slice = "markerDot";
      self.board.addMarker(config, m.sq);
    });

    this.arrowsData.forEach(function (a) {
      var typeKey = a.type || "default";
      var config = AnkiChess.ARROW_TYPE[typeKey] || { class: "arrow-" + typeKey, slice: "arrow" };
      self.board.addArrow(config, a.from, a.to);
    });
  };

  ChessInstance.prototype.cleanAnnotations = function () {
    var self = this;
    this.activeAnnotations.markers.forEach(function (i) { try { self.board.removeMarker(i); } catch (e) {} });
    this.activeAnnotations.markers = [];
    this.activeAnnotations.arrows.forEach(function (i) { try { self.board.removeArrow(i); } catch (e) {} });
    this.activeAnnotations.arrows = [];
  };

  ChessInstance.prototype.setPlayState = function (playing) {
    if (playing) {
      this.btnPlay.classList.add("active");
      this.iconPlay.style.display = "none";
      this.iconPause.style.display = "block";
    } else {
      this.btnPlay.classList.remove("active");
      this.iconPlay.style.display = "block";
      this.iconPause.style.display = "none";
    }
  };

  ChessInstance.prototype.wait = function(ms) { return new Promise(r => setTimeout(r, ms)); };

  ChessInstance.prototype.handlePlayClick = function () {
    if (this.isPlaying) return;
    var self = this;
    this.setPlayState(true);
    this.game = new AnkiChess.Chess(this.fen); // Reset Logic
    this.isPlaying = true;

    this.board.setPosition(this.fen, false)
      .then(function() {
        self.cleanAnnotations();
        return self.wait(500);
      })
      .then(function() {
        self.playSequence(0);
      });
  };

  ChessInstance.prototype.playSequence = function (index) {
    if (index >= this.sequenceData.length || !this.isPlaying) {
      this.isPlaying = false;
      this.setPlayState(false);
      return;
    }

    var self = this;
    var step = this.sequenceData[index];
    var moveSan = (step.move || "").trim();
    var moveSuccessful = false;

    if (moveSan) {
      try {
        if (self.game.move(moveSan)) moveSuccessful = true;
      } catch (e) { console.error("Move error:", e); }
    }

    var animPromise = moveSuccessful 
      ? self.board.setPosition(self.game.fen(), true) 
      : Promise.resolve();

    animPromise.then(function () {
      self.cleanAnnotations();

      // Dibujar anotaciones dinámicas
      if (step.markers) {
        step.markers.forEach(function (m) {
          var config = { class: "marker-" + m.type, slice: "markerCircle" }; // Simplificado para demo
          if (m.type.includes("square")) config.slice = "markerSquare";
          var inst = self.board.addMarker(config, m.sq);
          if(inst) self.activeAnnotations.markers.push(inst);
        });
      }
      if (step.arrows) {
        step.arrows.forEach(function (a) {
          var typeKey = a.type || "default";
          var config = AnkiChess.ARROW_TYPE[typeKey] || { class: "arrow-" + typeKey, slice: "arrow" };
          var inst = self.board.addArrow(config, a.from, a.to);
          if(inst) self.activeAnnotations.arrows.push(inst);
        });
      }
      return self.wait(1000); // Ritmo de reproducción
    }).then(function () {
      self.playSequence(index + 1);
    }).catch(function(e) {
       console.error(e);
       self.isPlaying = false;
       self.setPlayState(false);
    });
  };

  return {
    init: function(config) { return new ChessInstance(config); }
  };
})();