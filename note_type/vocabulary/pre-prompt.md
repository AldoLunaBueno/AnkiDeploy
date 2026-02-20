# Pre-prompt

Cambiar al formato de imagen de la web (webp), reducir la calidad y cambiar las dimensiones a un ancho estándar:

```sh
ffmpeg -i input.png -vf scale=1024:-1 -q:v 70 output.webp
```
