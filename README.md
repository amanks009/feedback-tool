Feedback Management System

This is a full-stack feedback management web application built with:

- **Frontend**: Next.js (v15), React 19, Mantine UI, Tailwind CSS, Axios
- **Backend**: Prisma ORM (assumed to be used with Node.js/Express or FastAPI)
- **Features**: Login, Registration, Employee & Manager Dashboards, Feedback generation and PDF export


🚀 Getting Started

1. Clone the Repository

git clone https://github.com/your-username/feedback-app.git
cd FEEDBACK
2. Install Dependencies
Frontend
cd client
npm install


Backend
cd ../server
npm install

3. Development
Frontend
cd client
npm run dev
Backend
Set up your .env with the database connection string.
cd server
npx prisma generate
npx prisma migrate dev --name init
Then, run your server (assuming you have an API handler in server/index.js or similar).

🧱 Frontend Stack
Next.js 15

React 19

Mantine UI

Tailwind CSS

Axios

jsPDF + react-to-pdf for exporting PDFs

🛠 Backend Stack
Prisma ORM

Database: Add your provider (postgresql, mysql, sqlite, etc.) in .env

Example .env:
DATABASE_URL="postgresql://user:password@localhost:5432/feedback"
✨ Features
🔐 User Authentication (Login & Register)

👨‍💼 Manager Dashboard

👨‍💻 Employee Feedback Submission

📄 Generate Feedback as PDF

🧩 Modular UI with Mantine Components

📦 Available Scripts
Frontend (client/)
npm run dev       # Start development server with Turbopack
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Lint with ESLint
Backend (server/)
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run DB migrations
You may need to create additional backend files for routes and logic if not already present.

📚 To Do
 Add backend routes and controllers

 Add authentication middleware

 Dockerize the app for deployment

 Add unit/integration tests
