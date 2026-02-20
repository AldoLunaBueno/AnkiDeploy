/* _anki_tags_dev.js */
// Solo tags de desarrollo de software
// ================= 1. CONFIGURACIÓN =================
const TAG_CONFIG = {
  kubernetes: { color: "#326ce5", img: "_kubernetes.svg" },
  docker: { color: "#2496ed", img: "_docker.svg" },
  terraform: { color: "#844fba", img: "_terraform.svg" },
  linux: { color: "#fcc624", img: "_linux.svg" },
  bash: { color: "#4eaa25", img: "_bash.svg" },
  prometheus: { color: "#e6522c", img: "_prometheus.svg" },
  grafana: { color: "#f46800", img: "_grafana.svg" },
  python: { color: "#3776ab", img: "_python.svg" },
  node: { color: "#339933", img: "_node.svg" },
  flask: { color: "#ffffff", img: "_flask.svg" },
  pytest: { color: "#009fe3", img: "_pytest.svg" },
  nginx: { color: "#009639", img: "_nginx.svg" },
  git: { color: "#f05032", img: "_git.svg" },
  github: { color: "#6e5494", img: "_github.svg" },
};

// ================= Plantillas de prompts ======
// Usa los nombres EXACTOS de 'data-key' del HTML
const PROMPT_TEMPLATES = {
  explicar: `Actúa como un experto. Analiza esta tarjeta de Anki:

[CONTEXTO]: {{Tags}}
[PREGUNTA]: {{Front}}
[RESPUESTA]: {{Back}}
[EXTRAS]: {{Improve}}

--- INSTRUCCIONES ---
Si [EXTRAS] tiene contenido, priorízalo. Si no, explica la tarjeta de forma detallada y clara.`,
};