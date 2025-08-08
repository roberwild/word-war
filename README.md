# Word War

Aplicación de práctica de mecanografía inspirada en el clásico "Missile Command" de Atari.

## Instalación

```bash
npm install
npm run dev
```

## Cómo jugar

1. Introduce tu nombre y pulsa **Empezar**.
2. Selecciona un nivel de dificultad.
3. Teclea las palabras que caen antes de que destruyan los edificios.
4. Cada palabra acertada suma 10 puntos. Si una palabra llega al suelo, pierdes un edificio. Cuando los ocho edificios son destruidos, termina la partida.

## Ranking

Al finalizar la partida, tu puntuación se guarda en `localStorage`. En la pantalla de ranking se muestran todas las puntuaciones ordenadas de mayor a menor.

## Añadir nuevas palabras

Las listas de palabras se encuentran en `data/words-easy.json`, `data/words-middle.json` y `data/words-advanced.json`. Agrega o modifica palabras en estos archivos para personalizar la práctica.
