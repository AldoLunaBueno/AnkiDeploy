// ================= UI Y ESTILOS =================

function renderCardStyles(rawTags) {
  const cardElement = document.getElementById("main-card");
  const logoHeader = document.getElementById("logo-header");

  if (!cardElement || !logoHeader) return;

  logoHeader.innerHTML = "";
  const tags = rawTags.toLowerCase();

  Object.keys(TAG_CONFIG).forEach((tag) => {
    if (tags.includes(tag)) {
      const config = TAG_CONFIG[tag];
      if (config.color) cardElement.style.borderColor = config.color;
      if (config.img && !logoHeader.innerHTML.includes(config.img)) {
        logoHeader.innerHTML += `<img src="${config.img}" class="tag-logo">`;
      }
    }
  });
}