# QR-Based Event Check-In Platform 🎟️✨

A comprehensive full-stack web application designed for seamless event registration, ticketing, and real-time check-in using secure QR codes. The platform supports a dual-portal experience tailored for **Attendees** and **Event Organizers**.

---

## 🚀 Features

### 👤 For Attendees (Users)
- **Event Discovery:** Browse public events, search, and filter by category or price.
- **One-Click Registration:** Quick registration for published events (respecting venue capacity limits).
- **Secure Ticketing:** Automatically generates a unique, secure ticket (encoded with a UUID-based QR code).
- **Automated Email Delivery:** Receive registration confirmations via email featuring event details and an embedded QR code image.
- **PDF Downloads:** Download a beautifully formatted PDF ticket containing a secure QR code for offline scan verification.
- **Personal Dashboard:** View registration history, ticket check-in status, and easily cancel upcoming bookings.

### 💼 For Organizers
- **Organizer Dashboard:** Visual overview of all created events, total registrations, overall check-in rates, and real-time stats.
- **Event Management:** Create, publish, update, and manage events, including customization of price, location, capacity, tags, and category.
- **Integrated QR Scanner:** In-browser camera-based QR code scanner for check-in verification at the venue.
- **Robust Security Checks:** The scanner automatically validates:
  - Ticket existence in the database.
  - Verification that the ticket matches the scanned event (no cross-event entry).
  - Prevention of duplicate entries (notifies staff if the ticket is already scanned).
  - Validation of active registration status (rejects cancelled tickets).
- **Live Check-in Analytics:** Interactive charts and breakdown counters showing percentage checked-in, pending arrivals, and cancellations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Component Libraries:** Base UI, Shadcn, Tailwind Merge, Tw-Animate-CSS
- **State & Data Fetching:** TanStack React Query & Axios

### Backend
- **Runtime:** Node.js (>=22.0.0)
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for secure password hashing
- **Ticket Generation:** PDFKit (PDF rendering) & QRCode (data matrix encoding)
- **Notification Services:** Nodemailer (SMTP service config)

---

## 📂 Project Structure

```
├── backend/                  # Node/Express API Server
│   ├── config/               # Database connection config
│   ├── controllers/          # Business logic controllers (auth, events, scanner, analytics)
│   ├── middleware/           # Route guards (auth protector, role validators)
│   ├── models/               # Mongoose Schemas (User, Event, Registration)
│   ├── routes/               # API Router endpoints
│   ├── utils/                # Helper utilities (QR generator, PDF generator, email helper)
│   ├── .env                  # Backend Environment variables
│   ├── seed.js               # Database seeder script
│   └── server.js             # API entrypoint
│
└── frontend/                 # React SPA Client (Vite)
    ├── public/               # Public assets
    ├── src/
    │   ├── assets/           # Client-side media assets
    │   ├── components/       # Common reusable components (Layout, UI, etc.)
    │   ├── context/          # React Auth Context state management
    │   ├── lib/              # Client utility libraries (Axios instances, etc.)
    │   ├── pages/            # View Pages (Dashboard, Scanner, Login, Events, etc.)
    │   ├── services/         # API Service functions
    │   ├── App.jsx           # Main routing & app composition
    │   └── main.jsx          # Client entrypoint
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js installed (v22 or higher recommended)
- MongoDB database (local or MongoDB Atlas connection string)
- SMTP Mail Account (e.g., Gmail App Password) for sending ticket emails

### Step 1: Clone and Setup Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and configure the environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_long_secure_jwt_secret_string
   JWT_EXPIRE=7d

   # Email Configuration (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   EMAIL_FROM="QR Events <your_gmail_address@gmail.com>"
   ```

### Step 2: Seed the Database (Optional)
To populate the database with a set of mock events and a default template organizer structure:
```bash
npm run seed
# or: node seed.js
```

### Step 3: Run the Backend Server
Start the API in development mode (using Nodemailer/Nodemon for auto-reloading):
```bash
npm run dev
```
The server will boot up and listen on `http://localhost:5000`.

---

### Step 4: Setup and Run Frontend
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
The web application will run locally, typically at `http://localhost:5173`.

---

## 🔌 API Documentation

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Register a new user |
| `/api/auth/login` | `POST` | Public | Authenticate user & get JWT token |
| `/api/events` | `GET` | Public | Retrieve list of published events |
| `/api/events` | `POST` | Private (Organizer) | Create a new event |
| `/api/registrations/:eventId` | `POST` | Private | Register logged-in user for an event |
| `/api/registrations/my` | `GET` | Private | View registration history for user |
| `/api/registrations/:registrationId/qr` | `GET` | Private | Fetch ticket QR code |
| `/api/registrations/:registrationId/ticket` | `GET` | Private | Download ticket PDF |
| `/api/scanner/checkin` | `POST` | Private (Organizer) | Scan ticket QR Code and check in attendee |
| `/api/scanner/stats/:eventId` | `GET` | Private (Organizer) | Get real-time check-in stats |
| `/api/analytics/dashboard` | `GET` | Private (Organizer) | Get organizer's aggregated dashboard analytics |

---

## 🔒 Verification & Security Logic
- **Authorization Flow:** Protected routes require a valid Bearer JWT. Attendees are restricted from accessing event creation, scanning controls, and analytics endpoints.
- **Double Entry Prevention:** When a check-in is requested, the system performs an atomic check. If `checkedIn` is already `true`, the API returns a `400 Bad Request` containing the original check-in timestamp.
- **Cross-Event Ticket Verification:** The scanner route checks if the event ID on the ticket registration matches the active scanner's event ID, preventing fraud using tickets from other dates/venues.
