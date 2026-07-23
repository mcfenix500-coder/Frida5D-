import { loadStripe } from '@stripe/js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

/**
 * Componente para botón de pago con Stripe
 */
export function StripePaymentButton({ 
  petId, 
  serviceType, 
  amount, 
  currency = 'MXN',
  description,
  onSuccess,
  onError
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Crear sesión de pago
      const response = await fetch('/api/payment?action=create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          serviceType,
          amount,
          currency,
          description
        })
      });

      if (!response.ok) {
        throw new Error('Error creando sesión de pago');
      }

      const { sessionId } = await response.json();

      // 2. Redirigir a Stripe Checkout
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({
        sessionId
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMsg = err.message || 'Error procesando pago';
      setError(errorMsg);
      console.error('Error:', err);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-payment-button">
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`btn-pay ${loading ? 'loading' : ''}`}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Procesando...
          </>
        ) : (
          <>
            💳 Pagar ${amount} {currency}
          </>
        )}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

/**
 * Componente para formulario de pago directo
 */
export function DirectPaymentForm({
  petId,
  serviceType,
  amount,
  currency = 'MXN',
  onSuccess,
  onError
}) {
  const [cardElement, setCardElement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const stripe = useRef(null);
  const elements = useRef(null);

  useEffect(() => {
    const initStripe = async () => {
      stripe.current = await stripePromise;
      elements.current = stripe.current.elements();
      const card = elements.current.create('card');
      card.mount('#card-element');
      setCardElement(card);

      card.addEventListener('change', (event) => {
        if (event.error) {
          setError(event.error.message);
        } else {
          setError(null);
        }
      });
    };

    initStripe();

    return () => {
      cardElement?.unmount();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Crear token de tarjeta
      const { token, error: tokenError } = await stripe.current.createToken(cardElement);

      if (tokenError) {
        throw new Error(tokenError.message);
      }

      // Procesar pago
      const response = await fetch('/api/payment?action=process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          serviceType,
          amount,
          currency,
          token: token.id,
          email
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error procesando pago');
      }

      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errorMsg = err.message || 'Error procesando pago';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
      </div>

      <div className="form-group">
        <label>Información de la Tarjeta</label>
        <div id="card-element" className="card-element"></div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        disabled={loading || !email}
        className={`btn-primary ${loading ? 'loading' : ''}`}
      >
        {loading ? 'Procesando...' : `Pagar $${amount} ${currency}`}
      </button>

      <div className="payment-info">
        <p>💳 Tarjeta de prueba: 4242 4242 4242 4242</p>
        <p>📅 Fecha cualquiera (MM/YY futuro)</p>
        <p>🔐 CVC: Cualquier 3 dígitos</p>
      </div>
    </form>
  );
}

/**
 * Componente para página de éxito
 */
export function PaymentSuccess({ sessionId }) {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/payment?action=verify&sessionId=${sessionId}`
        );
        const data = await response.json();
        setPaymentInfo(data);
      } catch (err) {
        console.error('Error verificando pago:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  if (loading) return <div>Verificando pago...</div>;

  return (
    <div className="payment-success">
      <div className="success-icon">✅</div>
      <h2>¡Pago Procesado Exitosamente!</h2>
      
      {paymentInfo && (
        <div className="payment-details">
          <p>Monto: ${paymentInfo.amount} {paymentInfo.currency.toUpperCase()}</p>
          <p>ID de Transacción: {paymentInfo.paymentIntentId}</p>
          <p>Estado: {paymentInfo.status}</p>
        </div>
      )}

      <div className="actions">
        <a href="/dashboard" className="btn-primary">
          Ir al Dashboard
        </a>
        <a href="/" className="btn-secondary">
          Volver al Inicio
        </a>
      </div>
    </div>
  );
}

export default {
  StripePaymentButton,
  DirectPaymentForm,
  PaymentSuccess
};
