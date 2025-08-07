import { useState, useRef, useEffect } from 'react';

export default function TestGame() {
  const [missiles, setMissiles] = useState([
    { id: 1, word: 'gato', x: 10, y: 50 },
    { id: 2, word: 'casa', x: 50, y: 100 },
    { id: 3, word: 'sol', x: 80, y: 150 }
  ]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    let remaining = val;
    let lowerVal = val.toLowerCase();
    let foundAny = false;
    
    console.log('Texto tipeado:', val);
    console.log('Palabras disponibles:', missiles.map(m => m.word));
    
    if (missiles.length > 0 && lowerVal.length) {
      missiles.forEach((m) => {
        const w = m.word.toLowerCase();
        const idx = lowerVal.indexOf(w);
        console.log(`Buscando "${w}" en "${lowerVal}": posición ${idx}`);
        if (idx !== -1) {
          console.log(`¡ENCONTRADO! "${w}" en posición ${idx}`);
          // Eliminar la palabra
          setMissiles(prev => prev.filter(missile => missile.id !== m.id));
          setScore(s => s + 10);
          foundAny = true;
          // quitar la palabra del texto para permitir más coincidencias
          lowerVal = lowerVal.slice(0, idx) + lowerVal.slice(idx + w.length);
          remaining = remaining.slice(0, idx) + remaining.slice(idx + w.length);
        }
      });
    }
    
    // Si se neutralizó alguna palabra, limpiar buffer
    if (foundAny) {
      console.log('Limpiando buffer');
      setTyped('');
    } else {
      setTyped(remaining);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test de Neutralización</h1>
      <div style={{ marginBottom: '20px' }}>
        <strong>Puntuación: {score}</strong>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Palabras disponibles:</strong>
        <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
          {missiles.map(m => (
            <div key={m.id} style={{ 
              padding: '5px 10px', 
              background: '#333', 
              color: 'white', 
              borderRadius: '4px' 
            }}>
              {m.word}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          <strong>Escribe aquí (incluye palabras de arriba):</strong>
          <br />
          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={handleChange}
            style={{ 
              fontSize: '16px', 
              padding: '10px', 
              width: '300px',
              border: '2px solid #333'
            }}
            placeholder="ej: holgatomardcasa"
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Texto actual: "{typed}"</strong>
      </div>

      <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
        <strong>Instrucciones:</strong>
        <ul>
          <li>Escribe cualquier texto que contenga las palabras de arriba</li>
          <li>Ejemplo: "holgatomardcasa" debería neutralizar "gato" y "casa"</li>
          <li>El texto se limpia automáticamente cuando aciertas</li>
        </ul>
      </div>
    </div>
  );
}
