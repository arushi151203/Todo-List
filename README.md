# ? To-Do List App

A full-stack To-Do List application built during my internship at **Aegis Jobs Pvt. Ltd., Jaipur**. It allows users to add, complete, and delete tasks with a clean and responsive UI.

## ?? Features

- ? Add new tasks
- ? Mark tasks as complete
- ??? Delete tasks
- ?? Data saved using PostgreSQL database
- ?? Responsive UI with glassmorphism dark theme

## ??? Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |

## ?? Project Structure

\\\
to-do-list/
+-- frontend/         # React frontend
¦   +-- src/
¦   +-- index.html
+-- backend/          # Express backend
¦   +-- routes/
¦   +-- db.js
¦   +-- server.js
\\\

## ?? Getting Started

### Installation

1. Clone the repository
   \\\ash
   git clone https://github.com/arushi151203/Todo-List.git
   cd Todo-List
   \\\

2. Install frontend dependencies
   \\\ash
   cd frontend
   npm install
   \\\

3. Install backend dependencies
   \\\ash
   cd backend
   npm install
   \\\

4. Create \ackend/.env\ with your DB credentials:
   \\\env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   \\\

5. Run backend
   \\\ash
   node server.js
   \\\

6. Run frontend
   \\\ash
   npm run dev
   \\\

## ????? Author
**Arushi** — Intern at Aegis Jobs Pvt. Ltd., Jaipur
