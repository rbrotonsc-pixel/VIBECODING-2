# Plan

El agente trabaja una fase cada vez y marca las casillas al cerrarla.

Todas las pruebas automáticas usan respuestas simuladas de OpenWeatherMap: nunca llaman a la API real.

## Fase 0 · Esqueleto

**Objetivo:** el proyecto arranca y se puede probar.

**Tareas:**
- [ ] Crear el proyecto con Vite, Vitest, Playwright y ESLint.
- [ ] Mostrar una primera pantalla con el nombre de la app («Tiempo en directo»).
- [ ] Quitar `GEMINI_API_KEY` de `.env.example` y poner `VITE_OPENWEATHER_API_KEY`.
- [ ] Añadir los scripts `dev`, `test`, `test:e2e` y `lint`.

**Pruebas:**
- Una prueba e2e comprueba que la app se abre y muestra su nombre.
- `npm run lint` pasa sin errores ni avisos.

**Hecho cuando:** `npm run dev` abre la página con el nombre de la app, `.env.example` ya no contiene `GEMINI_API_KEY`, y `npm test`, `npm run test:e2e` y `npm run lint` pasan sin errores ni avisos.

## Fase 1 · Temperatura de una ciudad

**Objetivo:** escribir una ciudad y ver su temperatura actual. Nada más.

**Tareas:**
- [ ] Añadir un campo de texto y un botón «Buscar».
- [ ] Buscar la ciudad en el geocoding y usar la primera coincidencia.
- [ ] Pedir el tiempo actual con esas coordenadas (`units=metric`).
- [ ] Mostrar «Ciudad, PAÍS · NN °C».

**Pruebas:**
- Unitaria: con `temp: 21.4` se muestra «21 °C».
- Unitaria: la petición lleva la clave y `units=metric`.
- E2e con la API simulada: escribo «Madrid», pulso Buscar y veo «Madrid, ES · 21 °C».

**Hecho cuando:** las pruebas pasan y, con tu clave real, buscas una ciudad y ves su temperatura.

## Fase 2 · Errores

**Objetivo:** avisar con un mensaje claro cuando algo falla.

**Tareas:**
- [ ] Ciudad inexistente → «No se ha encontrado esa ciudad».
- [ ] Clave no válida (401) → «La clave de OpenWeatherMap no es válida».
- [ ] Fallo de red → «No se ha podido conectar».
- [ ] Con el campo vacío no se hace ninguna petición.
- [ ] Si una búsqueda falla, se sigue viendo la ciudad que había antes.

**Pruebas:**
- Una prueba unitaria y una e2e por cada caso.

**Hecho cuando:** cada error muestra su mensaje, los datos anteriores no se pierden y todas las pruebas pasan.

## Fase 3 · Tiempo actual completo

**Objetivo:** mostrar todos los datos del tiempo actual.

**Tareas:**
- [ ] Sensación térmica.
- [ ] Estado del cielo en español con su icono.
- [ ] Humedad.
- [ ] Viento en km/h.
- [ ] Lluvia, si la hay.

**Pruebas:**
- Unitaria de las conversiones (5 m/s = 18 km/h) y de las traducciones del estado del cielo.
- E2e: con `feels_like: 20.6`, `humidity: 40`, `wind.speed: 5` y `clear sky`, se muestra «sensación 21 °C · humedad 40 % · viento 18 km/h · Despejado».

**Hecho cuando:** se ven todos los datos con sus unidades correctas y las pruebas pasan.

## Fase 4 · Elegir entre coincidencias

**Objetivo:** cuando varias ciudades se llaman igual, poder elegir la correcta.

**Tareas:**
- [ ] Si el geocoding devuelve varias ciudades, mostrar una lista para elegir («Valencia, ES», «Valencia, VE»).
- [ ] Si devuelve una sola, cargarla directamente.

**Pruebas:**
- E2e: busco «Valencia», elijo «Valencia, VE» y se pide el tiempo con las coordenadas de esa ciudad.

**Hecho cuando:** se puede elegir entre ciudades con el mismo nombre y las pruebas pasan.

## Fase 5 · Refresco automático

**Objetivo:** que los datos se actualicen solos.

**Tareas:**
- [ ] Actualizar cada 10 minutos y mostrar «Última actualización: HH:MM».
- [ ] Botón «Actualizar» para refrescar a mano.
- [ ] Si una actualización falla, mantener los datos y mostrar «No se ha podido actualizar. Se reintentará en 10 minutos».
- [ ] Al buscar otra ciudad, el temporizador vuelve a empezar.

**Pruebas:**
- Unitaria con el reloj simulado: avanzo 10 minutos y se pasa de 21 °C a 22 °C.
- Unitarias del fallo de actualización y del botón «Actualizar».

**Hecho cuando:** los datos se refrescan solos y a mano, un fallo no borra lo que se ve y las pruebas pasan.

## Fase 6 · Gráfica de la sesión

**Objetivo:** ver cómo ha cambiado la temperatura desde que se abrió la página.

**Tareas:**
- [ ] Decidir contigo si la gráfica se dibuja sin librería o con Chart.js.
- [ ] Cada actualización añade un punto a la gráfica.
- [ ] Al cambiar de ciudad, la gráfica empieza de cero.

**Pruebas:**
- Unitaria de la función que prepara los puntos.
- E2e: tras 2 actualizaciones la gráfica tiene 2 puntos.

**Hecho cuando:** la gráfica crece con cada actualización y las pruebas pasan.

## Fase 7 · Previsión de 24 horas

**Objetivo:** añadir la previsión a la gráfica.

**Tareas:**
- [ ] Pedir la previsión de 5 días / 3 horas y quedarse con los 8 primeros tramos.
- [ ] Dibujarlos en otro color y separados de los datos medidos.
- [ ] Refrescar la previsión a la vez que el tiempo actual.

**Pruebas:**
- Unitaria: de una previsión simulada de 40 tramos se toman solo los 8 primeros, con la hora correcta de cada uno.
- E2e: la gráfica muestra los 8 puntos de previsión.

**Hecho cuando:** la gráfica muestra datos medidos y previsión diferenciados y las pruebas pasan.
