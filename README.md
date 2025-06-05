# 🍽️ Kasa Restaurant Management System

A comprehensive web application for managing restaurant operations with user authentication, built with Docker Compose for easy deployment.

## 🚀 Features

### Currently Available
- ✅ **User Authentication System**
  - Secure registration and login
  - JWT token-based authentication
  - Role-based access control (Admin, Manager, Employee)
  - Password hashing with bcrypt
  - Protected routes and API endpoints

### Coming Soon
- 📋 Menu Management
- 🎯 Order Management
- 🪑 Table Management
- 👥 Staff Management
- 📦 Inventory Control
- 📊 Financial Reports
- 👤 Customer Management
- 🏢 Multi-Location Support

## 🛠️ Technology Stack

- **Frontend**: React 18 with React Router
- **Backend**: Node.js with Express
- **Database**: PostgreSQL 15
- **Authentication**: JWT tokens with bcrypt
- **Containerization**: Docker & Docker Compose
- **Security**: Helmet, CORS, Rate limiting

## 🏃‍♂️ Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd kasa
   ```

2. **Start all services with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend (React): http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### 🔐 Default Login Credentials
- **Email**: `admin@kasa-restaurant.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password immediately in production!

## 📁 Project Structure

```
kasa/
├── docker-compose.yml          # Docker services configuration
├── database/
│   └── init.sql               # Database initialization script
├── backend/                   # Node.js API server
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js             # Main server file
│   ├── config/
│   │   └── database.js       # Database connection
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   └── routes/
│       ├── auth.js          # Authentication routes
│       └── users.js         # User management routes
└── frontend/                 # React application
    ├── Dockerfile
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js           # Main React component
        ├── App.css          # Styles
        ├── index.js         # React entry point
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            └── DashboardPage.js
```

## 🔧 Configuration

### Environment Variables
The system uses these environment variables (already configured in docker-compose.yml):

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)
- `PORT`: Backend server port

### Database Schema
The system automatically creates these tables:
- `users`: User accounts with authentication
- `restaurants`: Restaurant information

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Users (Protected)
- `GET /api/users` - Get all users (Manager/Admin only)
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/:id` - Delete user (Admin only)

### Health Check
- `GET /api/health` - API health status

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Role-based access control
- SQL injection protection with parameterized queries

## 🐳 Docker Services

1. **PostgreSQL Database** (`postgres`)
   - Port: 5432
   - Persistent data storage
   - Auto-initialization with schema

2. **Backend API** (`backend`)
   - Port: 3001
   - Node.js with Express
   - Hot reload in development

3. **Frontend** (`frontend`)
   - Port: 3000
   - React development server
   - Hot reload in development

## 📱 Usage Guide

1. **First Time Setup**:
   - Start the application with `docker-compose up --build`
   - Wait for all services to be ready
   - Navigate to http://localhost:3000

2. **Login**:
   - Use the default admin credentials
   - Or create a new account via the registration page

3. **Dashboard**:
   - View current features and upcoming functionality
   - Manage your profile and change password
   - Admin users can view all users

## 🛠️ Development

### Adding New Features
1. Backend: Add routes in `backend/routes/`
2. Frontend: Add components in `frontend/src/components/`
3. Database: Update `database/init.sql` for schema changes

### Running in Development
```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build
```

## 🚀 Production Deployment

For production deployment:

1. **Change default credentials**
2. **Update JWT_SECRET** in docker-compose.yml
3. **Use environment-specific configuration**
4. **Set up SSL/TLS certificates**
5. **Configure proper backup strategy**

## 🤝 Contributing

This is a personal project for restaurant management. Feel free to fork and customize for your own needs!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3001, and 5432 are available
2. **Docker issues**: Restart Docker service and try again
3. **Database connection**: Wait for PostgreSQL to fully initialize
4. **Permission issues**: Ensure proper file permissions for the project directory

### Getting Help

Check the logs for detailed error information:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

---

**Happy Restaurant Managing! 🍽️✨**