# Customer Support System v1

A full-featured customer support ticketing system built with Node.js, Express, Knex (MySQL/PostgreSQL), MongoDB (Mongoose), RabbitMQ, and Redis. 
This system allows customers to submit support tickets, agents to manage and resolve issues, and admins to oversee all activities with detailed audit logs. 
Includes real-time messaging and robust authentication.

---

## Features

- **User Management:**  
  - Roles: Customer, Agent, Admin  
  - Registration, authentication (JWT & session), and role-based access control  
  - Admins can change user roles, remove users, and all changes are logged

- **Ticket Management:**  
  - Customers create support tickets (with subject & description)  
  - Agents are assigned to tickets and manage their status: `open`, `in_progress`, `resolved`, `escalated`  
  - Admins oversee all tickets  
  - All status changes and assignments are logged for auditing

- **Audit Logging:**  
  - Every ticket and user change is saved in dedicated history tables

- **Real-Time Messaging:**  
  - Socket-based chat within conversations between customers and agents

- **Authentication & Security:**  
  - JWT-based authentication with short-lived access tokens and refresh tokens stored in Redis  
  - Session management with Redis  
  - Input validation middleware  
  - Helmet, CORS, and secure headers

- **Scalable Architecture:**  
  - RabbitMQ for background jobs and queueing (e.g., ticket assignment, notifications)  
  - Modular database setup (supports both MySQL and PostgreSQL with Knex)

---

## Tech Stack

- **Backend:** Node.js, Express
- **Databases:** MySQL/PostgreSQL (Knex), MongoDB (Mongoose)
- **Messaging/Queue:** RabbitMQ
- **Session/Cache:** Redis
- **Authentication:** JWT + Redis-backed sessions
- **Real-time:** Socket.IO
- **Other:** dotenv, helmet, morgan, cors

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL or PostgreSQL
- MongoDB
- Redis
- RabbitMQ

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ahmedali64/Customer-Support-Systemv1.git
   cd Customer-Support-Systemv1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**  
   Copy `.env.example` to `.env` and set up your database, JWT secrets, Redis, and RabbitMQ URLs.

4. **Run database migrations:**
   ```bash
   # For MySQL/PostgreSQL (using Knex)
   npm run migrate
   ```

5. **Start the application:**
   ```bash
   npm start
   ```

---

## Usage

- **Customers:** Register/login, create new tickets, view status of their tickets, chat with assigned agents.
- **Agents:** View, manage, and resolve assigned tickets, communicate with customers.
- **Admins:** Manage users (change roles, delete users), view all tickets, access audit logs.

---

## Project Structure

```
app.js
src/
  config/        # Configuration files (db, redis, rabbitmq, etc.)
  routes/        # Express routes
  models/        # Database models
  middlewares/   # Auth, validation, etc.
  database/      # Migrations and seeds
  sockets/       # Real-time socket events
  utils/         # Helper utilities
```

---

## Contributing

Contributions are welcome! Please fork the repo and submit a pull request. For major changes, open an issue first to discuss what you’d like to change.

---

## License

This project is licensed under the MIT License.

---

## Author

- [Ahmedali64](https://github.com/Ahmedali64)

---

## Contact

For questions or support, please open an issue on GitHub.
