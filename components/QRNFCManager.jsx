// Componente para crear etiqueta
export function TagCreator({ petId, onTagCreated }) {
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateTag = async () => {
    if (!serviceType) {
      setError('Selecciona un tipo de servicio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://hooks.zapier.com/hooks/catch/TU_WEBHOOK_AQUI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          serviceType,
          description
        })
      });

      if (!response.ok) throw new Error('Error creando etiqueta');

      const data = await response.json().catch(() => ({}));
      onTagCreated(data.tag || { serviceType, description });
      setServiceType('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tag-creator">
      <h3>Crear Nueva Etiqueta</h3>
      
      <select
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value)}
        className="input"
      >
        <option value="">Selecciona tipo de servicio</option>
        <option value="Vacunación">Vacunación</option>
        <option value="Desparasitación">Desparasitación</option>
        <option value="Baño">Baño</option>
        <option value="Corte">Corte</option>
        <option value="Veterinario">Consulta Veterinaria</option>
        <option value="Cirugía">Cirugía</option>
        <option value="Bienestar">Bienestar</option>
        <option value="Otro">Otro</option>
      </select>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        className="input"
      />

      {error && <div className="error">{error}</div>}

      <button
        onClick={handleCreateTag}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Enviando...' : 'Crear Etiqueta'}
      </button>
    </div>
  );
}
