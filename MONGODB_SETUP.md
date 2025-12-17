# MongoDB Integration

This project now includes MongoDB integration with a Node.js/Express backend.

## Setup

### Environment Variables

Create a `.env` file in the root directory with:

```env
MONGODB_URI=mongodb+srv://roastingwzain_db_user:9wSNS6cSVpf6yves@cluster0.fm3mci7.mongodb.net/ecom-fwd?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

Create a `.env.local` file for the frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Option 1: Run Frontend and Backend Together
```bash
npm run dev:full
```

### Option 2: Run Separately

**Backend Server:**
```bash
npm run server
```

**Frontend (in another terminal):**
```bash
npm run dev
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/users` - Get all users

### Health Check
- `GET /api/health` - Check server and database status

## Using the API in Frontend

Import the API service:

```typescript
import { productAPI, authAPI, checkServerHealth } from '@/services/api'

// Get all products
const products = await productAPI.getAll()

// Create a product
const newProduct = await productAPI.create({
  name: 'Product Name',
  price: 99.99,
  description: 'Product description',
  imageUrl: 'https://example.com/image.jpg'
})

// Register a user
const user = await authAPI.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
})

// Login
const loggedInUser = await authAPI.login({
  email: 'john@example.com',
  password: 'password123'
})
```

## Database Models

### Product Schema
- name (String, required)
- price (Number, required)
- description (String, required)
- imageUrl (String, required)
- rating (Number, 0-5)
- reviewCount (Number)
- category (String)
- stock (Number)
- colors (Array of Strings)
- colorVariants (Array of Objects)
- timestamps (createdAt, updatedAt)

### User Schema
- name (String, required)
- email (String, required, unique)
- password (String, required)
- isAdmin (Boolean, default: false)
- timestamps (createdAt, updatedAt)

## Production Notes

⚠️ **Important**: The current authentication implementation stores passwords in plain text. 
For production, you should:
1. Use `bcrypt` to hash passwords
2. Implement JWT tokens for authentication
3. Add middleware for protected routes
4. Use environment variables for sensitive data
5. Enable CORS only for specific domains
