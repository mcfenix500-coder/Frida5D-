// Component to create tag
export function TagCreator({ petId, onTagCreated }) {
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateTag = async () => {
    if (!serviceType) {
      setError('Select a service type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://hooks.zapier.com/hooks/catch/28321665/462k4b2/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          serviceType,
          description
        })
      });

      if (!response.ok) throw new Error('Error creating tag');

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
      <h3>Create New Tag</h3>
      
      <select
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value)}
        className="input"
      >
        <option value="">Select service type</option>
        <option value="Vacunación">Vaccination</option>
        <option value="Desparasitación">Deworming</option>
        <option value="Baño">Bath</option>
        <option value="Corte">Grooming</option>
        <option value="Veterinario">Veterinary Consultation</option>
        <option value="Cirugía">Surgery</option>
        <option value="Bienestar">Wellness</option>
        <option value="Otro">Other</option>
      </select>
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="input"
      />

      {error && <p className="error">{error}</p>}

      <button onClick={handleCreateTag} disabled={loading} className="btn">
        {loading ? 'Creating...' : 'Create Tag'}
      </button>
    </div>
  );
}
