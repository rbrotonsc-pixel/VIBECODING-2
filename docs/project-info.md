# Información del proyecto

## Qué es
Una página web que muestra el tiempo actual de una ciudad, se actualiza sola cada pocos minutos y dibuja una gráfica con la evolución de la temperatura y la previsión de las próximas horas.

## Para quién
Personas que quieren tener a la vista el tiempo de un sitio concreto sin ir recargando una web de previsión: ver cómo está ahora, cómo ha ido cambiando y qué viene.

## Funciones
- Buscar una ciudad por nombre y elegirla si hay varias coincidencias (p. ej. «Valencia, ES» o «Valencia, VE»).
- Mostrar el tiempo actual: temperatura, sensación térmica, estado del cielo con icono, humedad, viento (km/h) y lluvia si la hay.
- Actualizar los datos automáticamente cada 10 minutos y mostrar la hora de la última actualización.
- Permitir actualizar a mano con un botón.
- Dibujar una gráfica con:
  - las temperaturas registradas desde que se abrió la página, una por actualización;
  - la previsión de temperatura de las próximas 24 horas (en tramos de 3 horas).
- Avisar con un mensaje claro si la ciudad no existe, si falla la conexión o si la clave no es válida, sin perder los últimos datos mostrados.

## Fuera de alcance
- Cuentas de usuario y guardar ciudades favoritas.
- Varias ciudades a la vez.
- Ubicación automática del navegador.
- Avisos o notificaciones cuando cambia el tiempo.
- Guardar el histórico entre sesiones: la gráfica empieza de cero al recargar.
- Mapas, radar y alertas meteorológicas oficiales.
- Previsión de más de 24 horas.
- Despliegue público: de momento se usa en local.

## Tecnología
- Página HTML + JavaScript (sin framework) que se abre en el navegador.
- **Vite** como servidor de desarrollo: hace falta para leer la clave de `.env` desde el navegador.
- Gráfica: se decidirá en su fase. Primero se intentará con SVG propio; si se queda corto, se propondrá una librería (p. ej. Chart.js) antes de instalarla.
- Pruebas unitarias con **Vitest**, junto al código.
- Pruebas de extremo a extremo con **Playwright**, en `e2e/`.
- La lógica (llamadas a la API, conversión de unidades, preparar los datos de la gráfica, temporizador de refresco) va separada de la interfaz para poder probarla sin navegador.

## Cómo se arranca
1. `npm install`
2. `cp .env.example .env` y escribir la clave de OpenWeatherMap.
3. `npm run dev` y abrir la dirección que muestra (por defecto `http://localhost:5173`).

Pruebas: `npm test` (unitarias) y `npm run test:e2e` (Playwright).

## Datos y claves
- **Fuente:** OpenWeatherMap, plan gratuito, en unidades métricas:
  - Geocoding API (`/geo/1.0/direct`): de nombre de ciudad a coordenadas.
  - Current Weather (`/data/2.5/weather`): tiempo actual.
  - 5 day / 3 hour Forecast (`/data/2.5/forecast`): previsión para la gráfica.
- **Clave:** `VITE_OPENWEATHER_API_KEY` en `.env`.
  - ⚠️ Al ser una página sin servidor, la clave viaja al navegador y cualquiera que use la página puede verla. Es aceptable mientras se use en local con una clave gratuita; si algún día se publica, habrá que poner un pequeño servidor intermedio.
- **Límites:** el plan gratuito permite 60 llamadas por minuto y 1.000.000 al mes. Refrescar cada 10 minutos usa muy poco.
- **Datos del usuario:** solo la ciudad que escribe; no se guarda nada.
- Las pruebas automáticas no llaman a la API real: usan respuestas simuladas.

## Cómo se prueba
Con respuestas simuladas de la API:

- **Tiempo actual:** busco «Madrid», la API devuelve `temp: 21.4`, `feels_like: 20.6`, `humidity: 40`, `wind.speed: 5` (m/s) y `weather: "clear sky"` → la página muestra **«Madrid, ES · 21 °C · sensación 21 °C · humedad 40 % · viento 18 km/h · Despejado»**.
- **Ciudad inexistente:** busco «Ciudadquenoexiste», el geocoding devuelve `[]` → la página muestra **«No se ha encontrado esa ciudad»** y no cambia nada más.
- **Refresco automático:** con Madrid cargada, avanzo el reloj 10 minutos y la API devuelve `temp: 22.0` → la temperatura pasa a **22 °C**, la hora de «Última actualización» cambia y la gráfica tiene **2 puntos** registrados.
- **Previsión:** la API de previsión devuelve 8 tramos de 3 horas → la gráfica muestra **8 puntos de previsión**.
- **Fallo de red:** con Madrid cargada, la siguiente actualización falla → se mantiene **21 °C** y aparece **«No se ha podido actualizar. Se reintentará en 10 minutos»**.

---

<details>
<summary>Ejemplo de referencia: calculadora de hipoteca (no es tu proyecto)</summary>

**Qué es:** una página que calcula la cuota mensual de una hipoteca.

**Para quién:** personas que están comparando hipotecas antes de ir al banco.

**Funciones:**
- Pedir importe, interés anual y años.
- Mostrar la cuota mensual.
- Avisar si falta un dato o no es válido.

**Fuera de alcance:** cuentas de usuario, guardar simulaciones y ofertas de bancos reales.

**Tecnología:** una página HTML con JavaScript que se abre en el navegador.

**Datos y claves:** solo los datos que escribe el usuario, que no se guardan. No necesita claves.

**Cómo se prueba:** 200.000 € al 3 % a 30 años = 843 €/mes.

</details>
