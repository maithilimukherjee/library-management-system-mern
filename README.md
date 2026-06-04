# LMS Backend

A comprehensive Library Management System backend API built with Node.js, Express, and MongoDB. This system manages library operations including member registration, book inventory, borrowing transactions, and book requests.

## Project Overview

This backend serves as the core API for a complete library management platform. It handles user authentication, member management, book inventory, borrowing transactions, fine calculation, and book request workflows. The system supports two user roles: Members and Administrators.

## Tech Stack

- Node.js with Express.js (v5.2.1) - Web framework
- MongoDB with Mongoose - Database
- JWT (jsonwebtoken) - Authentication and authorization
- CORS - Cross-origin resource sharing
- dotenv - Environment variable management
- Nodemon - Development server auto-reload

## Project Structure

```
backend/
├── config/              # Database configuration
├── models/              # Mongoose schemas
├── controllers/         # Business logic and route handlers
├── routes/              # API endpoint definitions
├── middleware/          # Authentication and authorization
├── server.js            # Application entry point
├── package.json         # Dependencies
└── package-lock.json
```

## Database Models

### Member
- name (String, required)
- email (String, required, unique)
- memStatus (Enum: active, cancelled, suspended)
- fine (Number, default: 0)
- timestamps

### Book
- name (String, required)
- isbn (String, required, unique)
- info (String, optional)
- avStatus (Boolean, default: true - availability status)
- timestamps

### Admin
- name (String, required)
- email (String, required, unique)
- hireDate (Date, required)
- timestamps

### Borrowal (Borrowing Transaction)
- bookId (Reference to Book)
- memberId (Reference to Member)
- dueDate (Date)
- returnDate (Date, optional)
- timestamps

### BookRequest (Book Request Form)
- memberId (Reference to Member)
- requestedTitle (String)
- requestedAuthor (String, optional)
- status (Enum: pending, approved, rejected)
- adminReply (String, optional)
- timestamps

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Member login | Public |
| POST | `/member-register` | Register new member | Public |
| POST | `/cancel` | Cancel membership | Protected (Member) |

**Request/Response Examples:**

- **Member Login** `POST /api/auth/`
  - Body: `{ "email": "user@example.com" }`
  - Response: `{ "message": "Login successful", "token": "...", "member": {...} }`

- **Member Register** `POST /api/auth/member-register`
  - Body: `{ "name": "John Doe", "email": "john@example.com" }`
  - Response: `{ "message": "Member registered successfully", "member": {...} }`

- **Cancel Membership** `POST /api/auth/cancel`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "email": "user@example.com" }`
  - Response: `{ "message": "Membership cancelled successfully", "member": {...} }`
  - Note: Cannot cancel if outstanding fine exists

### Book Management Routes (`/api/book`)

All endpoints require authentication and admin role.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/add` | Add new book to inventory | Protected (Admin) |
| POST | `/lend` | Issue book to member | Protected (Admin) |
| POST | `/return` | Process book return | Protected (Admin) |
| POST | `/pay-fine` | Process fine payment | Protected (Admin) |

**Request/Response Examples:**

- **Add Book** `POST /api/book/add`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "The Great Gatsby", "isbn": "978-0-7432-7356-5", "info": "Classic fiction" }`
  - Response: `{ "message": "New book added successfully", "newBook": {...} }`

- **Lend Book** `POST /api/book/lend`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "bookId": "...", "memberId": "...", "dueDate": "2026-07-04" }`
  - Response: `{ "message": "Book successfully issued!", "transaction": {...} }`

- **Return Book** `POST /api/book/return`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "bookId": "...", "memberId": "..." }`
  - Response: `{ "message": "Book returned successfully!", "fineCharged": 0, "daysOverdue": 0, "transaction": {...} }`
  - Note: Automatically calculates fine at 1 per day overdue

- **Pay Fine** `POST /api/book/pay-fine`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "email": "user@example.com", "amountPaid": 50 }`
  - Response: `{ "message": "Payment of 50 processed successfully", "remainingFine": 0, "member": {...} }`

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Admin registration | Public |
| POST | `/login` | Admin login | Public |
| GET | `/members` | Get all members | Protected (Admin) |
| GET | `/books` | Get all books | Protected (Admin) |
| GET | `/transactions` | Get all borrowing transactions | Protected (Admin) |
| POST | `/suspend` | Suspend member account | Protected (Admin) |
| POST | `/reactivate` | Reactivate member account | Protected (Admin) |
| GET | `/requests` | Get pending book requests | Protected (Admin) |
| POST | `/requests/:id/respond` | Respond to book request | Protected (Admin) |

**Request/Response Examples:**

- **Admin Register** `POST /api/admin/register`
  - Body: `{ "name": "Jane Doe", "email": "admin@example.com", "hireDate": "2026-01-01" }`
  - Response: `{ "message": "Admin registered successfully", "admin": {...} }`

- **Admin Login** `POST /api/admin/login`
  - Body: `{ "email": "admin@example.com" }`
  - Response: `{ "message": "Welcome back admin", "token": "...", "admin": {...} }`

- **Get All Members** `GET /api/admin/members`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "count": 10, "members": [...] }`

- **Suspend Membership** `POST /api/admin/suspend`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "email": "user@example.com" }`
  - Response: `{ "message": "Membership suspended successfully due to outstanding fine balances", "member": {...} }`
  - Note: Can only suspend if fine exceeds 100

- **Reactivate Membership** `POST /api/admin/reactivate`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "email": "user@example.com" }`
  - Response: `{ "message": "Account restored to active standing successfully", "member": {...} }`
  - Note: All fines must be paid before reactivation

- **Get Pending Requests** `GET /api/admin/requests`
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of pending book requests with member details

- **Respond to Request** `POST /api/admin/requests/:id/respond`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "status": "approved", "adminReply": "Book available", "bookId": "..." }` (bookId required for approval)
  - Response: `{ "message": "Request marked as approved. Borrowal created and book locked.", "request": {...} }`

### Member Routes (`/api/member`)

All endpoints require authentication.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/request` | Submit book request | Protected (Member) |
| GET | `/my-requests` | Get own request history | Protected (Member) |

**Request/Response Examples:**

- **Request Book** `POST /api/member/request`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "requestedTitle": "The Hobbit", "requestedAuthor": "J.R.R. Tolkien" }`
  - Response: `{ "message": "Request submitted successfully. An admin will review it shortly.", "request": {...} }`

- **Get My Requests** `GET /api/member/my-requests`
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of requests submitted by the authenticated member

## Key Features

### Authentication & Authorization
- JWT-based token authentication with 24-hour expiration
- Role-based access control (Member vs Admin)
- Protected routes with middleware validation

### Member Management
- Member registration and login
- Account status tracking (active, suspended, cancelled)
- Self-service membership cancellation
- Fine tracking and payment processing

### Book Management
- Add books to inventory with ISBN validation
- Track book availability status
- Lend books to members with due date tracking
- Process book returns with automatic overdue fine calculation

### Transaction Management
- Track all borrowing transactions
- Automatic fine calculation (1 per overdue day)
- Support for fine payments and balance tracking

### Book Request Workflow
- Members can request specific books
- Admins can approve/reject requests with replies
- Automatic borrowal creation on approval
- Request history tracking

### Access Control
- Members cannot access admin operations
- Suspended/cancelled members cannot borrow books
- All protected routes require valid JWT token
- Admin operations require admin role in token

## Environment Setup

Create a `.env` file in the backend directory:

```
PORT=5000
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/lms-database
JWT_SECRET=your_secret_key_here
```

## Getting Started

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up environment variables in `.env` file

3. Start the server:
   ```bash
   npm run dev    # Development mode with nodemon
   npm start      # Production mode
   ```

The server will start on the specified PORT (default: 5000) and connect to MongoDB.

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden (access denied)
- 404: Not Found
- 409: Conflict (duplicate email/ISBN)
- 500: Server Error

All error responses include a descriptive message field explaining the issue.
