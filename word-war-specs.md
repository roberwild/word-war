### Detalle funcional - Word War

#### Juego
- **Niveles y dificultad**
  - Niveles: `PRINCIPIANTE (easy)`, `INTERMEDIO (middle)`, `AVANZADO (advanced)`.
  - Dificultad reducida al 50% (más accesible):
    - `spawnRates`: easy 2000 ms, middle 1400 ms, advanced 800 ms.
    - `speedRates`: easy 20, middle 35, advanced 50.

- **Generación de palabras**
  - Mazo barajado por nivel para maximizar variedad y reducir repeticiones.
  - Evita escoger palabras ya activas en pantalla.
  - Cálculo de posición X segura según ancho disponible y longitud estimada de la palabra.

- **Entrada de texto**
  - Búsqueda y eliminación de múltiples palabras con un único buffer de entrada.
  - En móvil/tablet se ignoran tildes al comparar; en escritorio se respetan.

- **Audio**
  - Efectos: disparo, explosión, impacto, gran explosión.
  - Desbloqueo iOS al primer gesto (pointer/touch/click/keydown) con beep inaudible; intro y juego incluyen listeners.

- **HUD y puntuación**
  - HUD con Puntos y WPM.
  - +10 puntos por palabra; fin de partida al perder los edificios.
  - Persistencia de puntuaciones en `localStorage` y navegación a ranking.

#### Interfaz y pantallas
- **Intro**
  - `gameArt` con palabras que caen, cañón que dispara rayos y explosiones.
  - Música/FX al primer gesto del usuario.

- **Selección de nivel**
  - Tarjeta centrada, botones responsivos y compactos en móvil.
  - Altura basada en `--vh` y respeto de `safe-area`.

- **Juego**
  - Área `gameArea` sin scroll horizontal, bordes verdes siempre visibles.
  - Altura: `height: calc(var(--vh) * X)` (actualizado con `visualViewport`).
  - Alineado a `safe-area` para iOS; contenedor seguro envuelve el área para evitar desbordes.
  - Palabras limitadas por ancho; `ellipsis` por seguridad visual.

- **Ranking**
  - Lista con `max-height` y `overflowY: auto` en móvil.
  - Créditos no se superponen (posición estática y centrada en móvil).

#### Compatibilidad móvil/tablet
- **Viewport**
  - Uso de `--vh` con `visualViewport` para altura real (teclado/barras).
  - `viewport-fit=cover` y `env(safe-area-inset-*)` para notch y zonas de gesto.
- **Audio iOS**
  - Desbloqueo explícito con interacción; listeners en intro y juego.

#### Datos y contenido
- Listas de palabras por nivel: `data/words-easy.json`, `data/words-middle.json`, `data/words-advanced.json`.
- Fácil ampliación agregando términos.

#### Notas
- Puntuaciones en `localStorage` (cliente).
- En iOS puede requerirse un toque inicial para activar audio en cada sesión.

