# Kicks E-Commerce Platform

A production-ready, full-stack e-commerce application tailored for footwear. Kicks bridges the gap between high-end, creative user interfaces and robust, scalable backend architecture. The platform features an immersive scrollytelling experience, secure authentication, real-time order tracking, and a comprehensive administrative dashboard.

**Live Demo:** [https://kicks-shoestore.vercel.app/](https://kicks-shoestore.vercel.app/)

https://github.com/user-attachments/assets/2c54d4e3-ad34-4a60-933c-cd46ff15d7b6

## Core Features

*   **Immersive User Experience:** Utilizes advanced animation libraries for a sticky, scrollytelling home page that presents products dynamically without relying on 3D models.
*   **Comprehensive Authentication:** Secure user access managed through JSON Web Tokens, Google OAuth, and customized role-based access control (User, Admin, Superadmin).
*   **Real-Time Capabilities:** Live order tracking and instant administrative notifications powered by WebSocket connections.
*   **Advanced Product Management:** Multi-angle product imagery supported by cloud storage, alongside inventory and category management.
*   **Seamless Checkout:** Integrated payment gateway for secure and reliable transaction processing.
*   **Administrative Management:** Dedicated superadmin capabilities for managing administrators, overseeing comprehensive audit logs, and monitoring sales analytics.
*   **Theming Options:** Full support for both dark and light modes, enhancing accessibility and user preference.

## Technology Stack

### Frontend Architecture
*   **Core Library:** React
*   **Build Tool:** Vite
*   **State Management:** Redux Toolkit, React Redux
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS, PostCSS, Tailwind Animate
*   **Animations:** GSAP (GreenSock Animation Platform)
*   **Network & Communication:** Axios, Socket.IO Client
*   **Authentication Integration:** React OAuth Google
*   **UI Components & Feedback:** React Toastify, React Icons

### Backend Architecture
*   **Runtime Environment:** Node.js
*   **Web Framework:** Express.js
*   **Database & ORM:** MongoDB with Mongoose, Prisma ORM
*   **Caching & State:** Upstash Redis
*   **Authentication & Security:** bcryptjs, JSON Web Token, Passport.js, Express Rate Limit
*   **Real-Time Engine:** Socket.IO
*   **Payment Processing:** Razorpay
*   **File Handling & Storage:** Multer, Cloudinary
*   **Email Services:** Nodemailer, Brevo
*   **External APIs:** Google Auth Library

## System Architecture

The application adopts a decoupled architecture separating the client-side presentation from the server-side business logic.

*   **Client:** A single-page application focused on high performance and complex UI interactions, managing global state for carts and user sessions.
*   **Server:** A RESTful API layer handling data persistence, external service integrations (payments, cloud storage), and broadcasting real-time events.
*   **Data Layer:** Hybrid approach utilizing document-based storage for flexible product catalogs and relationship-based modeling where strict data integrity is required.

## Local Development Setup

### Prerequisites
*   Node.js installed on your local machine
*   MongoDB database cluster URI
*   Cloudinary account credentials
*   Razorpay API keys
*   Google Cloud Console project configured for OAuth credentials

### Installation Instructions

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Backend Configuration**
    Navigate to the backend directory and install the necessary dependencies:
    ```bash
    cd backend
    npm install
    ```
    
    Create a `.env` file in the root of the `backend` directory based on `.env.example` and populate it with your specific service keys:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    RAZORPAY_KEY_ID=your_razorpay_key
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```
    
    Start the backend development server:
    ```bash
    npm run dev
    ```

3.  **Frontend Configuration**
    Open a new terminal window, navigate to the frontend directory, and install dependencies:
    ```bash
    cd frontend
    npm install
    ```
    
    Create a `.env` file in the root of the `frontend` directory for environment-specific variables like API endpoints and Client IDs.
    
    Start the frontend development server:
    ```bash
    npm run dev
    ```

## Deployment Strategy

*   **Frontend Environment:** Configured and optimized for serverless deployment on platforms like Vercel (configuration included via `vercel.json`).
*   **Backend Environment:** Capable of being containerized or hosted directly on PaaS providers such as Render, Heroku, or DigitalOcean App Platform.
