# ArtColLab - Digital Art Marketplace

## Overview

**ArtColLab** is a full-stack MERN (MongoDB, Express, React, Node.js) web application that serves as a digital art marketplace and community platform. It enables artists to upload, sell, and showcase their artwork while providing buyers with a seamless purchasing experience.

---

## What Is ArtColLab For?

### For Artists
- **Sell Digital Artwork** - Upload and sell paintings, illustrations, 3D art, photography, and more
- **Set Custom Pricing** - Artists set their own prices in ZAR (South African Rand)
- **Earn Royalties** - Configure royalty percentages for resale earnings
- **Commissions** - Accept custom commission requests from buyers
- **Build Community** - Share work, receive feedback, and interact with other artists

### For Buyers
- **Browse Marketplace** - Discover unique digital art across multiple categories
- **Purchase Artwork** - Buy art securely via Stripe payment integration
- **Leave Reviews** - Rate and review purchased artwork
- **Direct Messaging** - Communicate directly with artists
- **Learning** - Purchase and access art courses

### For Administrators
- **Content Moderation** - Review and approve uploaded artwork
- **User Management** - Manage users and roles
- **Analytics** - View platform statistics and insights
- **Platform Control** - Full administrative oversight

---

## Key Features

### 🔐 Authentication & Security
- httpOnly cookie-based JWT authentication
- CSRF protection for state-changing requests
- XSS input sanitization
- Rate limiting on sensitive endpoints
- Role-based access control (User, Artist, Admin)

### 🖼️ Marketplace
- Artwork upload with image processing
- Category filtering (Abstract, Digital, 3D, Generative, Illustration, Photography, Animation, Street)
- Search and filter functionality
- Shopping cart
- Order management

### 💳 Payments
- Stripe integration for secure payments
- Webhook handling for payment confirmation
- Receipt email notifications

### 💬 Communication
- Real-time messaging between users and artists
- Conversation threads
- Message notifications

### 📚 Learning
- Video course hosting
- Course enrollment system
- Progress tracking

### ⚖️ Moderation
- Content reporting system
- Admin approval workflow for artwork
- Review and rating system

### 🎨 VR Gallery
- Virtual reality exhibition space
- Immersive art viewing experience

---

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (httpOnly cookies)
- **Security:** Helmet, CSRF, XSS sanitization, Rate limiting
- **Payments:** Stripe API

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Icons:** Lucide React

### DevOps
- **Containerization:** Docker
- **Process Management:** PM2
- **CI/CD:** GitHub Actions

---

## Project Structure

```
artcollab-app/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration
│   │   └── utils/          # Utilities
│   ├── tests/              # Integration tests
│   ├── Dockerfile          # Container config
│   └── ecosystem.config.js # PM2 config
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API service layer
│   │   ├── context/        # React contexts
│   │   └── layouts/        # Page layouts
│   └── vite.config.js     # Vite configuration
│
└── docs/                   # Documentation
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artcollab-app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   cp .env.production.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   cp .env.production.example .env
   # Edit .env with your API URL
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/artcollab
JWT_SECRET=your-64-character-secret
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG....
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Artwork
- `GET /api/artworks` - List artworks
- `POST /api/artworks` - Create artwork
- `GET /api/artworks/:id` - Get artwork
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order

### Messages
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses/enroll` - Enroll in course

---

## Production Deployment

See [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Production Checklist
1. Configure MongoDB Atlas
2. Set Stripe live keys
3. Generate JWT_SECRET (64+ characters)
4. Configure domain and HTTPS
5. Set up CI/CD pipeline

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions:
- Check the documentation in `docs/`
- Review API tests in `backend/tests/`
- Examine integration test results

---

## Version

Current Version: 1.0.0

Built with ❤️ for the creative community
