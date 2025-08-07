// Sistema de música para la pantalla de intro
let audioContext = null;
let masterGain = null;
let introMusicInterval = null;

// Secuencia melódica para la intro (frecuencias en Hz)
const introMelody = [
  { note: 440, duration: 400 },   // A4
  { note: 523, duration: 400 },   // C5
  { note: 659, duration: 400 },   // E5
  { note: 784, duration: 600 },   // G5
  { note: 659, duration: 400 },   // E5
  { note: 523, duration: 400 },   // C5
  { note: 440, duration: 800 },   // A4
  { note: 0, duration: 200 },     // Silencio
  
  { note: 349, duration: 400 },   // F4
  { note: 440, duration: 400 },   // A4
  { note: 523, duration: 400 },   // C5
  { note: 659, duration: 600 },   // E5
  { note: 523, duration: 400 },   // C5
  { note: 440, duration: 400 },   // A4
  { note: 349, duration: 800 },   // F4
  { note: 0, duration: 400 },     // Silencio más largo
];

// Inicializar contexto de audio
export const initIntroAudio = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.value = 0.1; // Volumen bajo para la música de fondo
    } catch (e) {
      console.log('Audio not supported');
      return false;
    }
  }
  return true;
};

// Crear un tono 8-bit con envolvente
const createTone = (frequency, duration, startTime = 0) => {
  if (!audioContext || frequency === 0 || audioContext.state !== 'running') return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    // Configurar oscilador con onda cuadrada para sonido 8-bit
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    
    // Filtro pasa-bajos para suavizar un poco
    filter.type = 'lowpass';
    filter.frequency.value = frequency * 2;
    
    // Envolvente ADSR simplificada
    const now = audioContext.currentTime;
    const actualStartTime = Math.max(now + 0.01, now + Math.max(0, startTime)); // Asegurar tiempo positivo
    const attack = 0.01;
    const decay = 0.1;
    const sustain = 0.6;
    const release = 0.2;
    const durationInSeconds = Math.max(0.1, duration / 1000); // Duración mínima
    
    // Programar envolvente con tiempos seguros
    const startGain = actualStartTime;
    const attackEnd = startGain + attack;
    const decayEnd = attackEnd + decay;
    const releaseStart = Math.max(decayEnd, startGain + durationInSeconds - release);
    const noteEnd = startGain + durationInSeconds;
    
    gainNode.gain.setValueAtTime(0, startGain);
    gainNode.gain.linearRampToValueAtTime(0.3, attackEnd);
    gainNode.gain.linearRampToValueAtTime(sustain * 0.3, decayEnd);
    gainNode.gain.setValueAtTime(sustain * 0.3, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0, noteEnd);
    
    // Conectar nodos
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);
    
    // Programar inicio y fin
    oscillator.start(startGain);
    oscillator.stop(noteEnd);
  } catch (e) {
    console.log('Error creating tone:', e);
  }
};

// Reproducir la melodía completa
const playIntroMelody = () => {
  if (!audioContext) return;
  
  let currentTime = 0;
  
  introMelody.forEach((noteData) => {
    createTone(noteData.note, noteData.duration, currentTime / 1000);
    currentTime += noteData.duration;
  });
  
  return currentTime; // Duración total de la melodía
};

// Agregar efectos de sonido ambientales
const playAmbientSounds = () => {
  if (!audioContext) return;
  
  // Sonido de misiles cayendo cada tanto
  const playMissileSound = () => {
    const frequency = 200 + Math.random() * 100;
    createTone(frequency, 300);
    
    setTimeout(() => {
      createTone(frequency * 0.5, 150); // Explosión
    }, 300);
  };
  
  // Sonido de disparo de torreta
  const playTurretSound = () => {
    createTone(800, 50);
    setTimeout(() => createTone(600, 50), 50);
    setTimeout(() => createTone(400, 100), 100);
  };
  
  // Programar sonidos ambientales aleatorios
  const scheduleRandomSounds = () => {
    setTimeout(() => {
      if (Math.random() > 0.7) playMissileSound();
      scheduleRandomSounds();
    }, 2000 + Math.random() * 3000);
  };
  
  const scheduleTurretSounds = () => {
    setTimeout(() => {
      if (Math.random() > 0.6) playTurretSound();
      scheduleTurretSounds();
    }, 3000 + Math.random() * 4000);
  };
  
  scheduleRandomSounds();
  scheduleTurretSounds();
};

// Iniciar música de intro
export const startIntroMusic = () => {
  if (!initIntroAudio()) return;
  
  // Función para iniciar cuando el usuario interactúe
  const startAudio = async () => {
    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Reproducir melodía principal
      const melodyDuration = playIntroMelody();
      
      // Repetir melodía en loop
      if (!introMusicInterval) {
        introMusicInterval = setInterval(() => {
          playIntroMelody();
        }, melodyDuration + 1000);
      }
      
      // Iniciar sonidos ambientales
      setTimeout(() => {
        playAmbientSounds();
      }, 2000);
    } catch (e) {
      console.log('Error starting audio:', e);
    }
  };
  
  // Intentar iniciar inmediatamente o esperar interacción del usuario
  if (audioContext.state === 'running') {
    startAudio();
  } else {
    // Agregar listener para la primera interacción del usuario
    const handleFirstInteraction = () => {
      startAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
  }
};

// Detener música de intro
export const stopIntroMusic = () => {
  if (introMusicInterval) {
    clearInterval(introMusicInterval);
    introMusicInterval = null;
  }
  
  if (masterGain) {
    masterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
  }
};

// Reproducir sonido de botón
export const playButtonSound = async () => {
  if (!audioContext) return;
  
  try {
    // Asegurar que el contexto esté activo
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    if (audioContext.state === 'running') {
      createTone(800, 100, 0);
      setTimeout(() => createTone(1000, 150, 0), 100);
    }
  } catch (e) {
    console.log('Error playing button sound:', e);
  }
};
