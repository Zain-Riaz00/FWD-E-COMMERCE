# E-Commerce React Application

A full-featured e-commerce application built with React for the frontend and Node.js/Express/MongoDB for the backend.

## Features

### Frontend Features
- **User Authentication**: Login and registration system
- **Product Catalog**: Browse products with filtering and sorting
- **Product Details**: Detailed product pages with reviews and ratings
- **3D Product Gallery**: Interactive 360° product view
- **Shopping Cart**: Add to cart, update quantities, apply promo codes
- **User Profile**: Manage account, view order history, wishlist
- **Admin Panel**: Product, user, and order management

### Backend Features
- **RESTful API**: Express.js backend with MongoDB
- **Authentication**: JWT-based authentication
- **Product Management**: CRUD operations for products
- **Order Processing**: Complete order management system
- **Review System**: Product reviews and ratings
- **User Management**: User profiles and admin controls

## Project Structure

```
ecommerce-project/
├── frontend/                 # React frontend application
│   ├── components/          # Reusable React components
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── auth.jsx            # Authentication pages
│   ├── homepage.jsx        # Home page
│   ├── products.jsx        # Products listing
│   ├── product-detail.jsx  # Product detail page
│   ├── product-3d-gallery.jsx  # 3D product viewer
│   ├── cart.jsx            # Shopping cart
│   ├── profile.jsx         # User profile
│   ├── admin-panel.jsx     # Admin dashboard
│   ├── App.js              # Main app component
│   ├── index.js            # Entry point
│   └── package.json        # Frontend dependencies
│
└── backend/                 # Node.js backend API
    ├── models/             # Mongoose models
    │   ├── User.js
    │   ├── Product.js
    │   ├── Order.js
    │   └── Review.js
    ├── routes/             # API routes
    │   ├── auth.js
    │   ├── products.js
    │   ├── orders.js
    │   ├── users.js
    │   └── reviews.js
    ├── server.js           # Express server
    ├── .env.example        # Environment variables template
    └── package.json        # Backend dependencies
```

## Installation

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on http://localhost:3000

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```

The backend API will run on http://localhost:5000

## Technologies Used

### Frontend
- React 18.2
- React Router DOM 6.15
- Axios for API calls

### Backend
- Node.js
- Express.js 4.18
- MongoDB with Mongoose 7.5
- JWT for authentication
- bcryptjs for password hashing

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status (Admin)

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Features Overview

### User Features
- Browse and search products
- View product details with 360° views
- Add items to cart
- Manage user profile
- Place orders
- Write product reviews
- Track order history

### Admin Features
- Dashboard with statistics
- Product management (CRUD)
- Order management
- User management
- Review moderation
- Site settings

## License

MIT License

## Author

Your Name - E-Commerce Project 2024
