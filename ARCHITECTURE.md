# Frida5D - Arquitectura Modular Escalable

## 🏗️ Estructura de Directorios

```
Frida5D-/
├── api/
│   ├── core/                    # APIs centrales
│   │   ├── pets.js
│   │   ├── payment.js
│   │   └── webhook.js
│   ├── hardware/                # Control de hardware
│   │   ├── lighting.js         # LEDs y cromoterapia
│   │   ├── aromatherapy.js     # Aromaterapia
│   │   ├── audio.js            # Audio binaural
│   │   └── devices.js          # Gestión de dispositivos
│   ├── nfc/                     # Módulos NFC
│   │   ├��─ qr-nfc.js
│   │   ├── pet-tags.js
│   │   ├── service-calls.js    # Llamadas de servicio
│   │   ├── loyalty.js          # Tarjetas de lealtad
│   │   ├── credentials.js      # Credenciales colaboradores
│   │   └── transport-monetization.js
│   └── commerce/                # Sistema de monetización
│       ├── commissions.js
│       ├── cashback.js
│       └── analytics.js
├── lib/
│   ├── modules/                 # Módulos reutilizables
│   │   ├── LightingModule.js
│   │   ├── AromaterapyModule.js
│   │   ├── AudioModule.js
│   │   ├── NFCModule.js
│   │   └── CommissionModule.js
│   ├── database/
│   │   └── airtable-service.js
│   └── utils/
│       ├── qr-nfc-utils.js
│       ├── validators.js
│       └── helpers.js
├── components/
│   ├── premium/
│   │   ├── DarkPremiumLayout.jsx
│   │   ├── PremiumCard.jsx
│   │   └── PremiumNavigation.jsx
│   ├── hardware/
│   │   ├── LightingControl.jsx
│   │   ├── AromaterapyControl.jsx
│   │   ├── AudioPlayer.jsx
│   │   └── DeviceStatus.jsx
│   ├── nfc/
│   │   ├── NFCManager.jsx
│   │   ├── ServiceCallPanel.jsx
│   │   ├── LoyaltyCard.jsx
│   │   └── CredentialReader.jsx
│   └── commerce/
│       ├── CommissionDashboard.jsx
│       ├── CashbackTracker.jsx
│       └── TransportMonetization.jsx
├── pages/
│   ├── dashboard.jsx
│   ├── hardware/
│   │   ├── lighting.jsx
│   │   ├── aromatherapy.jsx
│   │   └── audio.jsx
│   ├── nfc/
│   │   ├── management.jsx
│   │   ├── service-calls.jsx
│   │   └── loyalty.jsx
│   └── commerce/
│       ├── commissions.jsx
│       └── analytics.jsx
├── styles/
│   ├── dark-premium.css
│   ├── variables.css
│   └── components.css
├── config/
│   ├── airtable-schema.js
│   ├── hardware-config.js
│   └── nfc-config.js
└── vercel.json
```

## 🎨 Diseño Dark Premium

### Paleta de Colores
- **Fondo Principal**: #000000 (Negro Puro)
- **Acentos Violeta**: #7C3AED, #A855F7
- **Acentos Dorados**: #F59E0B, #FBBF24
- **Neutrales**: #1F2937, #374151, #D1D5DB
- **Estados**: 
  - Activo: #10B981
  - Alerta: #EF4444
  - Información: #3B82F6

### Tipografía
- **Titulares**: Inter Bold, 28px
- **Subtítulos**: Inter SemiBold, 18px
- **Cuerpo**: Inter Regular, 14px
- **Código**: Courier New, 12px

### Componentes
- Esquinas: radius 12px
- Sombras: 0 20px 25px rgba(0,0,0,0.3)
- Bordes: 1px solid rgba(167, 139, 250, 0.2)
- Transiciones: 300ms ease-in-out

## 📊 Schema Airtable Expandido

### Tablas Nuevas

#### 1. **Dispositivos Hardware**
```
- ID (Autonumeric)
- Nombre (Text)
- Tipo (Select: Luz, Aromaterapia, Audio, NFC)
- Ubicación (Text)
- Estado (Select: Activo, Inactivo, Mantenimiento)
- Zona (Link to Zonas)
- IP (Text)
- Puerto (Number)
- Credenciales API (Long Text)
- Última Sincronización (Date)
- Versión Firmware (Text)
```

#### 2. **Zonas Bienestar**
```
- ID (Autonumeric)
- Nombre (Text)
- Descripción (Long Text)
- Tipo (Select: Spa, Duchas, Sauna, Relajación)
- Dispositivos (Link to Dispositivos Hardware)
- Configuración Presets (Long Text - JSON)
- Capacidad (Number)
- Horario Operativo (Text)
- Responsable (Link to Usuarios)
```

#### 3. **Experiencias Bienestar**
```
- ID (Autonumeric)
- Nombre (Text)
- Descripción (Long Text)
- Duración (Number - minutos)
- Tipo (Select: Cromoterapia, Aromaterapia, Audio, Combinada)
- Zona Requerida (Link to Zonas Bienestar)
- Configuración Luz (JSON)
- Aromas Usados (Link to Aromas)
- Audio (Link to Audios Binaurales)
- Precio (Currency)
- Activo (Checkbox)
```

#### 4. **NFC Multifuncional**
```
- ID (Autonumeric)
- Código Único (Text)
- Tipo (Select: Mascota, Lealtad, Llamada Servicio, Credencial, Transporte)
- Subtipo (Text)
- Propietario (Link to Usuarios/Mascotas)
- Datos Asociados (Long Text - JSON)
- Resistencia Agua (Select: No, IP67, IP68)
- Ubicación Actual (Text)
- Estado (Select: Activo, Inactivo, Usado)
- Fecha Creación (Date)
- Última Actividad (Date)
```

#### 5. **Llamadas de Servicio**
```
- ID (Autonumeric)
- NFC Tag (Link to NFC Multifuncional)
- Ubicación (Text - Número mesa)
- Cliente (Text)
- Tipo (Select: Mesero, Limpieza, Recepción)
- Estado (Select: Pendiente, Atendido, Cancelado)
- Personal Asignado (Link to Personal)
- Timestamp (Date)
- Tiempo Respuesta (Duration)
```

#### 6. **Tarjetas Lealtad**
```
- ID (Autonumeric)
- NFC Tag (Link to NFC Multifuncional)
- Cliente (Link to Clientes)
- Puntos (Number)
- Nivel (Select: Bronce, Plata, Oro, Platino)
- Beneficios (Long Text)
- Fecha Vigencia (Date)
- Visitas Acumuladas (Number)
```

#### 7. **Credenciales Personal**
```
- ID (Autonumeric)
- NFC Tag (Link to NFC Multifuncional)
- Empleado (Link to Personal)
- Rol (Select: Admin, Supervisor, Staff, Limpieza)
- Permisos (Long Text - JSON)
- Calificación Promedio (Number)
- Servicios Realizados (Number)
- Cashback Acumulado (Currency)
- Activo (Checkbox)
```

#### 8. **Monetización Transporte**
```
- ID (Autonumeric)
- Van ID (Text)
- NFC Stickers (Link to NFC Multifuncional)
- Ubicación (Geo)
- Viajes Totales (Number)
- Ingresos Generados (Currency)
- Comisión Acumulada (Currency)
- Cashback Disponible (Currency)
- Operador (Link to Personal)
- Ruta (Text)
- Estado (Select: Activo, Inactivo)
```

#### 9. **Comisiones y Cashback**
```
- ID (Autonumeric)
- Tipo (Select: Comisión, Cashback, Bonificación)
- Usuario (Link to Personal)
- Monto (Currency)
- Concepto (Text)
- Referencia (Text - ID transacción)
- Estado (Select: Pendiente, Procesado, Pagado)
- Fecha (Date)
- Notas (Long Text)
```

#### 10. **Audios Binaurales**
```
- ID (Autonumeric)
- Título (Text)
- Descripción (Long Text)
- Archivo (Attachment)
- Duración (Number - segundos)
- Frecuencia (Text: 40Hz, 7.83Hz, etc.)
- Beneficio (Select: Relajación, Enfoque, Sueño, Energía)
- Categoría (Select)
- Url CDN (Text)
- Activo (Checkbox)
```

#### 11. **Aromas**
```
- ID (Autonumeric)
- Nombre (Text)
- Descripción (Long Text)
- Beneficio (Select: Relajación, Energía, Salud, Bienestar)
- Concentración (Select: Baja, Media, Alta)
- Volumen Disponible (Number)
- Proveedor (Text)
- Costo (Currency)
- Disponible (Checkbox)
```

## 🔌 APIs Modulares

### 1. Hardware Control API
```bash
POST /api/hardware/lighting?action=set-color
{
  "deviceId": "device123",
  "color": "#A855F7",
  "brightness": 80,
  "effect": "fade"
}

POST /api/hardware/aromatherapy?action=activate
{
  "zoneId": "zone456",
  "aromaId": "aroma789",
  "intensity": "medium",
  "duration": 30
}

POST /api/hardware/audio?action=play
{
  "audioId": "audio123",
  "zoneId": "zone456",
  "volume": 70,
  "repeat": false
}
```

### 2. NFC Multifuncional API
```bash
POST /api/nfc/service-call
{
  "nfcId": "NFC:table-5",
  "tableNumber": 5,
  "serviceType": "mesero",
  "priority": "normal"
}

POST /api/nfc/loyalty-scan
{
  "nfcId": "NFC:loyalty-customer123",
  "transactionAmount": 250,
  "pointsMultiplier": 1.5
}

POST /api/nfc/credential-check
{
  "nfcId": "NFC:cred-emp456",
  "action": "clock_in",
  "location": "zone789"
}
```

### 3. Commerce API
```bash
POST /api/commerce/commission?action=calculate
{
  "userId": "user123",
  "transactionId": "trans456",
  "amount": 500,
  "type": "nfc_transport"
}

POST /api/commerce/cashback?action=add
{
  "userId": "user123",
  "amount": 50,
  "source": "nfc_sticker",
  "vanId": "van789"
}

GET /api/commerce/analytics?userId=user123&period=month
```

## 🧩 Módulos Reutilizables

### LightingModule
```javascript
class LightingModule {
  async setColor(deviceId, color, brightness);
  async setEffect(deviceId, effect, duration);
  async getStatus(deviceId);
  async scheduleAutomation(deviceId, schedule);
  async syncAllDevices();
}
```

### AromaterapyModule
```javascript
class AromaterapyModule {
  async activate(zoneId, aromaId, intensity, duration);
  async stop(zoneId);
  async getInventory(zoneId);
  async refillAlert(aromaId);
  async mixAromas(zoneId, aromas);
}
```

### AudioModule
```javascript
class AudioModule {
  async playBinaural(zoneId, audioId, volume);
  async queue(zoneId, playlist);
  async stop(zoneId);
  async getAvailable(benefit, category);
  async recordSession(zoneId, audioId, duration);
}
```

### NFCModule
```javascript
class NFCModule {
  async createTag(type, subtype, data);
  async readTag(nfcId, context);
  async updateTag(nfcId, data);
  async getHistory(nfcId);
  async validateWaterResistance(nfcId);
}
```

### CommissionModule
```javascript
class CommissionModule {
  async calculateCommission(userId, amount, type);
  async addCashback(userId, amount, source);
  async getPending(userId);
  async processPayout(userId);
  async getAnalytics(userId, period);
}
```

## 🚀 Puntos de Extensión

### Para Nuevos Dispositivos Hardware
1. Crear archivo en `/api/hardware/`
2. Extender clase base en `/lib/modules/`
3. Agregar rutas en `vercel.json`
4. Documentar en tabla de Airtable
5. Agregar componente UI en `/components/hardware/`

### Para Nuevos Tipos NFC
1. Agregar tipo en tabla NFC Multifuncional
2. Crear handler en `/api/nfc/`
3. Extender NFCModule
4. Crear flujo en `/pages/nfc/`

### Para Nuevos Servicios de Monetización
1. Crear módulo en `/lib/modules/Commerce/`
2. Agregar rutas en `/api/commerce/`
3. Actualizar schema Airtable
4. Crear dashboard en `/pages/commerce/`

## 🔐 Seguridad

- ✅ Validación de API Keys por dispositivo
- ✅ Rate limiting por endpoint
- ✅ Cifrado de datos sensibles
- ✅ Logs de auditoría en Airtable
- ✅ RBAC para credenciales NFC
- ✅ Webhook signature verification

## 📱 Responsive & Accessible

- ✅ Dark mode nativo
- ✅ Contraste WCAG AA+
- ✅ Adaptable a tablets y móviles
- ✅ Touch-friendly en 44px mínimo
- ✅ Teclado navegable

## 🧪 Testing

```
tests/
├── unit/
├── integration/
└── hardware/
```

## 📈 Escalabilidad

- ✅ Microservicios independientes
- ✅ Rate limiting por dispositivo
- ✅ Caché en Redis (opcional)
- ✅ Webhooks para eventos async
- ✅ Mensajería para procesos largos
