/* _anki_vocabulary_reference_v7.js */

setTimeout(function () {
  var wordDiv = document.getElementById("data-word");
  var jsonDiv = document.getElementById("data-json");
  var refFront = document.getElementById("render-ref-front");
  var refBack = document.getElementById("render-ref-back");
  var hiddenMainImagesDiv = document.getElementById("hidden-main-images");
  var hiddenSourceDiv = document.getElementById("hidden-image-source");
  
  if (!wordDiv || !jsonDiv) return;

  var myWord = wordDiv.textContent.trim();
  var rawJson = jsonDiv.textContent
    .trim()
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ");

  // (Nota: Ya no necesitamos cleanSvgCode aquí porque lo hace la librería externa)

  try {
    var data = JSON.parse(rawJson);
    var myWordLower = myWord.toLowerCase();

    // --- MAPA DE IMÁGENES SECUNDARIAS (Contexto) ---
    var imageMap = {};
    if (hiddenSourceDiv) {
      var sourceFields = hiddenSourceDiv.getElementsByClassName("field-source");
      for (var i = 0; i < sourceFields.length; i++) {
        var field = sourceFields[i];
        var imgTag = field.querySelector("img");
        if (imgTag) {
          var textContent = field.textContent.trim().toLowerCase();
          if (textContent) imageMap[textContent] = imgTag.outerHTML;
        }
      }
    }

    var item = data.items.find(function (i) {
      return i.word.toLowerCase() === myWordLower;
    });

    if (!item) throw new Error("Palabra no encontrada");

    // --- RENDER ANVERSO ---
    if (refFront && refFront.innerHTML === "") {
      var htmlFront = "";
      var genNotion = data.general_notion;
      if (genNotion) {
        var text = Array.isArray(genNotion)
          ? genNotion[Math.floor(Math.random() * genNotion.length)]
          : genNotion;
        htmlFront +=
          "<div class='general-ref-box'><span style='opacity:0.6; font-size:0.8em; text-transform:uppercase;'>¿Cómo se llama?</span><br><strong>" +
          text +
          "</strong></div>";
      }
      if (item.particular_notion) {
        htmlFront += "<ul class='particular-ref-list'>";
        item.particular_notion.forEach(function (ref) {
          htmlFront += "<li>" + ref + "</li>";
        });
        htmlFront += "</ul>";
      }
      refFront.innerHTML = htmlFront;
    }

    // --- RENDER REVERSO ---
    if (refBack) {
      // 1. Construimos la estructura básica del texto
      var backHtml = "<div class='reveal-word'>" + item.word + "</div>";

      // 2. CREAMOS UN CONTENEDOR VACÍO PARA LA IMAGEN
      // Le damos un ID único para encontrarlo después
      var uniqueImageContainerId = "interactive-img-container";
      backHtml += "<div id='" + uniqueImageContainerId + "'></div>";
      backHtml += `<button id="toggle-debug" type="button" style="font-size: 12px; opacity: 0.5; cursor: pointer; margin-bottom: 5px;">Revelar todo</button>`;

      // 3. CONTEXTO SEMÁNTICO
      backHtml +=
        "<div class='context-wrapper'><details class='context-details' open><summary>Contexto Semántico</summary><div class='context-content'>";
      data.items.forEach(function (ctxItem) {
        var isCurrent = ctxItem.word.toLowerCase() === myWordLower;
        backHtml +=
          "<div class='context-item" + (isCurrent ? " is-current" : "") + "'>";
        backHtml +=
          "<div><span class='context-word'>" + ctxItem.word + "</span>";
        if (ctxItem.definition)
          backHtml +=
            "<div class='context-def'>" + ctxItem.definition + "</div>";
        backHtml += "</div>";
        if (imageMap[ctxItem.word.toLowerCase()]) {
          backHtml +=
            "<details class='image-toggle'><summary>Ver imagen</summary><div class='image-container'>" +
            imageMap[ctxItem.word.toLowerCase()] +
            "</div></details>";
        }
        backHtml += "</div>";
      });
      backHtml += "</div></details></div>";

      // 4. INYECTAMOS EL HTML EN EL DOM
      // (Aquí es donde antes se borraba tu imagen)
      refBack.innerHTML = backHtml;

      var btnDebug = document.getElementById("toggle-debug");

      // 5. AHORA SÍ: INVOCAMOS LA LIBRERÍA DE IMAGEN
      // Buscamos el contenedor vacío que acabamos de crear
      var targetContainer = document.getElementById(uniqueImageContainerId);

      if (
        hiddenMainImagesDiv &&
        hiddenMainImagesDiv.innerHTML.trim() !== "" &&
        targetContainer
      ) {
        var rawContent = hiddenMainImagesDiv.innerHTML;

        // Separar IMG de SVG
        var imgMatch = rawContent.match(/<img[^>]+>/i);
        var imgHTML = imgMatch ? imgMatch[0] : "";
        var svgRaw = rawContent.replace(/<img[^>]+>/i, ""); // El resto es SVG

        // Invocar la magia apuntando al contenedor específico, NO a todo el refBack
        InteractiveImage.init(
          targetContainer, // <--- CAMBIO IMPORTANTE
          imgHTML,
          svgRaw,
          myWord,
          btnDebug
        );
      }
    }
  } catch (e) {
    console.error("Error en tarjeta:", e);
    if (refFront)
      refFront.innerHTML =
        "<div style='color:red'>Error de renderizado. Revisa la consola.</div>";
  }
}, 100);