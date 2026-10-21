# Prompt para preparar el bulk import con una IA

Cómo usarlo:

1. Abre una terminal en la carpeta del proyecto (`sweet-portfolio-web`) y ejecuta `claude`.
2. Haz `git pull` antes, para tener la última versión.
3. Pega el prompt de abajo y cambia `RUTA_DE_LAS_IMAGENES` por la carpeta donde están tus renders.
4. Cuando termine, abre `/admin`, sección **Bulk import**, carga `import/works.json`, revisa la vista previa e importa.

---

```text
Eres mi asistente para preparar el bulk import de mi portfolio (repositorio actual: sweet-portfolio-web).
Tienes acceso a mi PC y a este repositorio. Trabaja de principio a fin sin pedirme confirmaciones
intermedias, salvo si algo bloquea el trabajo.

OBJETIVO
Analizar todas las imágenes de mi showcase de Roblox (builder y modelador 3D) que están en:
  RUTA_DE_LAS_IMAGENES
agruparlas por proyecto, nombrarlas, describirlas, copiarlas al sitio y generarme el JSON listo
para el importador (Admin > Bulk import). Yo revisaré y corregiré todo después desde el admin.

PASOS

1. Inventario
   - Lista todas las imágenes (png, jpg, jpeg, webp, avif, gif), incluidas subcarpetas.
   - Lee docs/bulk-import.md y src/lib/bulk.ts para respetar el formato exacto.
   - Mira qué categorías y obras ya existen en src/data/content.json (y, si hay .env con Supabase,
     tenlas en cuenta también) para reutilizar categorías y no duplicar títulos.

2. Análisis visual (obligatorio, mira de verdad cada imagen)
   - Para ahorrar contexto, genera miniaturas de unos 768 px en una carpeta temporal fuera de
     public/ (con sharp, ImageMagick o lo que haya instalado) y analiza esas miniaturas.
   - Agrupa en UN SOLO proyecto las imágenes que muestren la misma escena, objeto, personaje o
     mapa: mismo estilo, paleta, iluminación, mismos elementos, ángulos distintos, detalles,
     close-ups, wireframes, antes/después. Usa también nombres de archivo numerados, carpetas y
     fechas de modificación como pistas.
   - No crees un proyecto por imagen. Un proyecto de una sola imagen solo si de verdad es único.
   - Dentro de cada proyecto ordena las imágenes: la primera es la portada (la más representativa
     y atractiva), después vistas generales, luego detalles, y al final wireframes o procesos.

3. Metadatos de cada proyecto (en inglés, el sitio es en inglés)
   - title: corto y con carácter (2 a 4 palabras). Nada genérico como "Render 1".
   - description: 1 o 2 frases (máx. 200 caracteres) que describan lo que SE VE: ambiente, estilo,
     elementos, iluminación. Tono profesional y cercano.
   - category: usa una categoría existente si encaja; si no, propón una nueva y corta
     (por ejemplo Environments, Props & Assets, Characters, Architecture).
   - tools: solo si se deduce con claridad (Roblox Studio, Blender...). Si dudas, déjalo vacío.
   - tags: 3 a 6 etiquetas en minúsculas, separadas por comas.
   - published: true.
   - NO inventes datos que no se vean: nada de clientes, fechas, juegos, cifras ni logros.

4. Copiar imágenes al sitio
   - Copia (no muevas ni borres los originales) las imágenes a public/uploads/ con nombres limpios
     en kebab-case: <slug-del-proyecto>-1.<ext>, <slug-del-proyecto>-2.<ext>, etc.
   - Si una imagen pesa más de ~1.5 MB, genera una versión optimizada (WebP, máx. 2000 px de ancho,
     calidad ~85) y usa esa. Conserva la relación de aspecto.
   - Referencia cada imagen en el JSON como "/uploads/<nombre-final>".

5. Generar import/works.json
   - Formato: { "works": [ { "title", "description", "category", "images": [...], "tools", "tags",
     "published" } ] }  (images: lista de rutas "/uploads/...", la primera es la portada).
   - Valida: JSON correcto, cada título único, cada archivo referenciado existe en public/uploads,
     ninguna imagen repetida en dos proyectos, ningún título repetido respecto a lo que ya existe.
   - Ejecuta `npm run build` para comprobar que todo sigue compilando.

6. Informe final (en español, breve)
   - Tabla: proyecto, categoría, nº de imágenes y por qué las agrupaste.
   - Lista aparte "Revisar": agrupaciones dudosas, imágenes que no supiste ubicar, descripciones
     donde tuviste que adivinar. Guarda esa misma lista en import/review.md.
   - Qué archivos creaste y cuánto pesan en total.

7. Publicar los archivos
   - Haz git add public/uploads import/works.json import/review.md, commit con un mensaje claro y
     git push a la rama actual. No toques ningún otro archivo del proyecto.

REGLAS
- No cambies código, estilos ni configuración. Solo añade imágenes en public/uploads/ y los archivos
  de import/.
- No subas ni muestres claves, contraseñas ni datos personales.
- Si una imagen no se puede abrir o está corrupta, sáltala y repórtala.
- Si hay más de ~60 imágenes, trabaja por lotes y mantén un registro del progreso en import/review.md.

AL TERMINAR, dime exactamente qué hacer yo: abrir /admin > Bulk import, elegir import/works.json,
revisar la vista previa e importar. Recuérdame que, para que las imágenes se vean en la web
publicada, hay que desplegar de nuevo el sitio.
```
