// ================= CONFIGURACIÓN =================

const TAG_CONFIG = {
  algebra_lineal: { color: "#326ce5", img: "_tag_algebra_lineal.svg" },
  calculo_probabilidades: { color: "#326ce5", img: "_tag_calculo_probabilidades.svg" },
  matematica_discreta: { color: "#326ce5", img: "_tag_matematica_discreta.svg" },
};

const PROMPT_TEMPLATES = {
  explicar: `Analiza esta tarjeta de Anki:

[CONTEXTO]: {{Tags}}
[PREGUNTA]: {{Front}}
[RESPUESTA]: {{Back}}
[PROPUESTA]: {{Improve}}

--- INSTRUCCIONES ---
Si [PROPUESTA] tiene contenido, priorízalo para la explicación.
Si no, explica la tarjeta de forma detallada y clara. 
Asegúrate de ser riguroso matemáticamente.
Para abrir y cerrar cualquier fórmula matemática usa \\( y \\) en lugar de $.
Responde todo en formato html (etiquetas muy simples, jerarquía de headings de h3 a h6, énfasis con <b> o <i> solo en términos clave, sin <p> ni <hr>, sin estilado) dentro de un área de texto plano para copiar.`,
  
  graficar: `Analiza esta tarjeta de Anki:

[CONTEXTO]: {{Tags}}
[PREGUNTA]: {{Front}}
[RESPUESTA]: {{Back}}
[CUESTIÓN]: {{Improve}}

--- INSTRUCCIONES ---
Genera el código de un gráfico en el lenguaje TikZ de Latex.
Si [CUESTIÓN] tiene contenido, guíate de este campo para el código TikZ.
Si no, realiza el código TikZ según la tarjeta.
Puedes usar cuantas librerías y paquetes necesites.
Solo genera lo que necesites entre el header y el footer de mi tipo de nota de Anki:

Header:
\\documentclass[dvisvgm, border=2mm]{standalone}
\\usepackage{tikz}
\\usepackage{tikz-3dplot}
\\usepackage{amsmath, amssymb}
\\usepackage[dvipsnames, svgnames]{xcolor}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18} % Configuración recomendada para pgfplots
\\usepackage{tikz-cd} % Diagramas conmutativos
\\usetikzlibrary{
    % Coordenadas y calculos
    calc, math, positioning, intersections, through, spy,
    % Flechas y formas
    arrows.meta, shapes.geometric, shapes.symbols, shapes.arrows, shapes.multipart, shapes.callouts, shapes.misc, fit,
    % Decoraciones
    decorations.pathmorphing, decorations.pathreplacing, decorations.text, decorations.markings, decorations.footprints, decorations.fractals, decorations.shapes,
    % Estructuras
    matrix, chains, trees, mindmap, automata, petri, circuits.logic.US, circuits.ee.IEC, lindenmayersystems, folding, calendar,
    % Efectos y 3D
    backgrounds, shadows, shadows.blur, patterns, patterns.meta, fadings, shadings, perspective, 3d,
    % Utilidades
    quotes, angles, svg.path
}
\\begin{document}

Footer:
\\end{document}

Puedes usar trazos negros y colores puros o mezclados con blanco. 
Nunca mezcles colores con 'black' o 'gray' porque al invertir los colores pierden saturación.
Si requieres configuración global (ej. \\tdplotsetmaincoords), colócala antes de \\begin{tikzpicture}.
Genera un fragmento de código que contenga el código TikZ completo, incluyendo las etiquetas [latex] y [/latex].
Para esto usa \`\`\`text

Ejemplo:

[latex]
\\begin{tikzpicture} 
  \\draw (0,0) circle (1); 
\\end{tikzpicture}
[/latex]
`,
};