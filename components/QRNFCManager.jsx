// Componente para escanear QR
export function QRScanner({ onScan, onError }) {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    const startScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Usar librería jsQR para detectar QR
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const detectQR = () => {
          if (videoRef.current && ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            
            if (code) {
              setScanning(false);
              onScan(code.data);
              stream.getTracks().forEach(track => track.stop());
            }
          }
          
          if (scanning) {
            requestAnimationFrame(detectQR);
          }
        };
        
        detectQR();
      } catch (err) {
        console.error('Error accediendo a la cámara:', err);
        onError('No se pudo acceder a la cámara');
        setScanning(false);
      }
    };

    startScanning();

    return () => {
      setScanning(false);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning, onScan, onError]);

  return (
    <div className="qr-scanner">
      <video
        ref={videoRef}
        width={400}
        height={400}
        style={{
          border: '2px solid #ccc',
          borderRadius: '8px',
          display: scanning ? 'block' : 'none'
        }}
      />
      <button
        onClick={() => setScanning(!scanning)}
        className={`btn-scan ${scanning ? 'scanning' : ''}`}
      >
        {scanning ? 'Escaneando...' : 'Iniciar Escaneo QR'}
      </button>
    </div>
  );
}

// Componente para escanear NFC
export function NFCScanner({ onScan, onError }) {
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // Verificar si el dispositivo soporta NFC
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      onError('NFC no es soportado en este dispositivo');
      return;
    }

    try {
      setScanning(true);
      const ndef = new NDEFReader();
      
      await ndef.scan();
      
      ndef.addEventListener('reading', ({ message }) => {
        for (const record of message.records) {
          if (record.recordType === 'text') {
            const decoder = new TextDecoder();
            const text = decoder.decode(record.data);
            setScanning(false);
            onScan(text);
          }
        }
      });

      ndef.addEventListener('error', () => {
        onError('Error leyendo etiqueta NFC');
        setScanning(false);
      });
    } catch (err) {
      console.error('Error escaneando NFC:', err);
      onError(err.message);
      setScanning(false);
    }
  };

  if (!nfcSupported) {
    return (
      <div className="nfc-not-supported">
        <p>NFC no es soportado en este dispositivo</p>
      </div>
    );
  }

  return (
    <div className="nfc-scanner">
      <button
        onClick={startNFCScan}
        disabled={scanning}
        className={`btn-nfc ${scanning ? 'scanning' : ''}`}
      >
        {scanning ? 'Acercando etiqueta...' : 'Iniciar Escaneo NFC'}
      </button>
    </div>
  );
}

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
      const response = await fetch(`/api/qr-nfc?action=create-tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          serviceType,
          description
        })
      });

      if (!response.ok) throw new Error('Error creando etiqueta');

      const data = await response.json();
      onTagCreated(data.tag);
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
        {loading ? 'Creando...' : 'Crear Etiqueta'}
      </button>
    </div>
  );
}

// Componente para mostrar historial de escaneos
export function ScanHistory({ petId, uniqueCode }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const query = petId ? `petId=${petId}` : `uniqueCode=${uniqueCode}`;
        const response = await fetch(`/api/qr-nfc?action=history&${query}`);
        
        if (!response.ok) throw new Error('Error obteniendo historial');
        
        const data = await response.json();
        setHistory(data.history);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [petId, uniqueCode]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="scan-history">
      <h3>Historial de Escaneos</h3>
      {history.length === 0 ? (
        <p>No hay escaneos registrados</p>
      ) : (
        <div className="history-list">
          {history.map((scan) => (
            <div key={scan.id} className="history-item">
              <div className="scan-info">
                <span className="type">{scan.type}</span>
                <span className="service">{scan.serviceType}</span>
              </div>
              <div className="scan-details">
                <p>Ubicación: {scan.location}</p>
                <p>Fecha: {new Date(scan.timestamp).toLocaleString()}</p>
                {scan.notes && <p>Notas: {scan.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para mostrar detalles de mascota
export function PetDashboard({ petId }) {
  const [pet, setPet] = useState(null);
  const [stats, setStats] = useState(null);
  const [tags, setTags] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tagsRes, servicesRes] = await Promise.all([
          fetch(`/api/pets?action=pet-stats&petId=${petId}`),
          fetch(`/api/pets?action=pet-tags&petId=${petId}`),
          fetch(`/api/pets?action=pet-services&petId=${petId}`)
        ]);

        if (!statsRes.ok || !tagsRes.ok || !servicesRes.ok) {
          throw new Error('Error obteniendo datos');
        }

        const statsData = await statsRes.json();
        const tagsData = await tagsRes.json();
        const servicesData = await servicesRes.json();

        setStats(statsData.stats);
        setTags(tagsData.tags);
        setServices(servicesData.services);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petId]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pet-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard de Mascota</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Servicios Completados</h4>
          <p className="stat-value">{stats.completedServices}/{stats.totalServices}</p>
        </div>
        <div className="stat-card">
          <h4>Gasto Total</h4>
          <p className="stat-value">${stats.totalSpent.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h4>Etiquetas Activas</h4>
          <p className="stat-value">{stats.activeTags}</p>
        </div>
        <div className="stat-card">
          <h4>Total de Escaneos</h4>
          <p className="stat-value">{stats.totalScans}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Etiquetas Recientes</h3>
        {tags.length === 0 ? (
          <p>No hay etiquetas</p>
        ) : (
          <div className="tags-list">
            {tags.slice(0, 5).map(tag => (
              <div key={tag.id} className="tag-item">
                <span className="tag-code">{tag.uniqueCode}</span>
                <span className="tag-type">{tag.serviceType}</span>
                <span className="tag-status">{tag.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h3>Servicios Recientes</h3>
        {services.length === 0 ? (
          <p>No hay servicios</p>
        ) : (
          <div className="services-list">
            {services.slice(0, 5).map(service => (
              <div key={service.id} className="service-item">
                <span className="service-type">{service.serviceType}</span>
                <span className="service-amount">${service.amount}</span>
                <span className={`service-status ${service.status.toLowerCase()}`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
