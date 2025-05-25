# BookShop - Magazin Online de Cărți

Un magazin online modern și complet pentru cumpărarea și vânzarea de cărți, construit cu tehnologii web de ultimă generație.

## Caracteristici Principale

### Pentru Utilizatori

- **Experiență unică pentru cititori** - Descoperă lumea fascinantă a cărților
- **6 cărți disponibile** în colecția noastră curatoriată
- **Returnare în 30 de zile** pentru toate produsele
- Browse prin colecția de cărți disponibile
- Vizualizare detaliată a produselor cu imagini și descrieri
- Coș de cumpărături intuitiv
- Sistem de plăți securizat prin PayPal
- Profil utilizator personalizat
- Istoric comenzi

### Pentru Administratori

- Panou de administrare complet
- Gestionarea inventarului de cărți (CRUD operations)
- Administrarea utilizatorilor și permisiunilor
- Monitorizarea comenzilor și statusurilor
- Upload imagini pentru produse
- Statistici și rapoarte

## Stack Tehnologic

### Frontend

- **React** (v19.0.0) - Framework JavaScript pentru interfețe utilizator
- **Bootstrap** (v5.3.3) + **React Bootstrap** (v2.10.9) - Stilizare responsive
- **React Router DOM** (v7.3.0) - Navigare între pagini
- **Axios** (v1.8.2) - Comunicare cu API-ul backend
- **React Toastify** (v11.0.5) - Notificări utilizator
- **React Helmet** (v6.1.0) - Gestionare SEO și meta tags

### Backend

- **Node.js** + **Express** (v4.21.2) - Server și API REST
- **MongoDB** - Baza de date NoSQL
- **Mongoose** (v8.13.1) - ODM (Object Document Mapper) pentru MongoDB
- **JWT** (v9.0.2) - Autentificare și autorizare
- **bcryptjs** (v3.0.2) - Criptarea parolelor
- **Multer** (v1.4.5) - Upload fișiere/imagini
- **dotenv** (v16.4.7) - Gestionarea variabilelor de mediu

### Plăți

- **PayPal** (v8.8.3) - Procesarea plăților online

## Instalare și Configurare

### Prerequisite

- Node.js (versiunea 18+)
- MongoDB Atlas account sau MongoDB local
- PayPal Developer Account

### 1. Clonare Repository

```bash
git clone https://github.com/filippaulescu/BookShop.git
cd BookShop
```

### 2. Configurare Backend

```bash
cd backend
npm install
```

Creează fișierul `.env` în folderul backend și adaugă variabilele necesare (vezi secțiunea Variabile de Mediu).

### 3. Configurare Frontend

```bash
cd ../frontend
npm install
```

### 4. Pornire Aplicație

**Backend** (Port 5000):

```bash
cd backend
npm start
```

**Frontend** (Port 3000):

```bash
cd frontend
npm start
```

Aplicația va fi disponibilă la: `http://localhost:3000`

## Structura Proiectului

```
BookShop/
├── backend/
│   ├── models/
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── orderModel.js
│   │   └── reviewModel.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── seedRoutes.js
│   ├── public/images/
│   ├── server.js
│   ├── data.js
│   └── utils.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── App.js
│   └── public/
└── README.md
```

## API Endpoints

### Autentificare

- `POST /api/users/signin` - Login utilizator
- `POST /api/users/signup` - Înregistrare utilizator
- `PUT /api/users/profile` - Actualizare profil

### Produse

- `GET /api/products` - Lista produse
- `GET /api/products/slug/:slug` - Produs după slug
- `GET /api/products/:id` - Produs după ID
- `POST /api/products` - Adăugare produs (Admin)
- `PUT /api/products/:id` - Actualizare produs (Admin)
- `DELETE /api/products/:id` - Ștergere produs (Admin)

### Comenzi

- `POST /api/orders` - Creare comandă nouă
- `GET /api/orders/:id` - Detalii comandă
- `PUT /api/orders/:id/pay` - Marcare comandă ca plătită
- `GET /api/orders/mine` - Comenzile utilizatorului
- `GET /api/orders` - Toate comenzile (Admin)

### Utilizatori (Admin)

- `GET /api/users` - Lista utilizatori
- `PUT /api/users/:id` - Actualizare utilizator
- `DELETE /api/users/:id` - Ștergere utilizator

## Conturi de Test

### Admin

- **Email:** admin@example.com
- **Parolă:** 123456

### Utilizator Normal

- **Email:** user@example.com
- **Parolă:** 123456

## Funcționalități de Securitate

- Parole criptate cu bcrypt
- Autentificare JWT cu tokens
- Protecție rute admin
- Validare input pe server
- Sanitizare date utilizator

## Funcționalități Principale

### Pentru Utilizatori

- [x] Înregistrare și autentificare
- [x] Vizualizare produse
- [x] Adăugare recenzii
- [x] Adăugare în coș
- [x] Proces de checkout complet
- [x] Plăți PayPal
- [x] Istoric comenzi
- [x] Profil utilizator

### Pentru Administratori

- [x] Panou de administrare
- [x] Gestionare produse (CRUD)
- [x] Gestionare utilizatori
- [x] Monitorizare comenzi
- [x] Upload imagini produse
- [x] Statistici vânzări

## Variabile de Mediu

Creează fișierul `.env` în folderul `backend` cu următoarele variabile:

```env
# Database Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret Key
JWT_SECRET=your_super_secret_jwt_key

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id

# Server Configuration (optional)
PORT=5000
```

## Contribuții

Contribuțiile sunt binevenite! Te rog să urmezi acești pași:

1. Fork repository-ul
2. Creează un branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit modificările (`git commit -m 'Add some AmazingFeature'`)
4. Push pe branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

## 📞 Contact

Filip Paulescu - [GitHub](https://github.com/filippaulescu)

Link Proiect: [https://github.com/filippaulescu/BookShop](https://github.com/filippaulescu/BookShop)

---

⭐ Dacă acest proiect ți-a fost util, te rog să îi dai o stea pe GitHub!
