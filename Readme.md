# Kicks E-Commerce Store

A full-stack e-commerce web application specializing in footwear. Built with the MERN stack (MongoDB, Express, React, Node.js), this platform offers a seamless shopping experience with secure authentication, real-time features, and integrated payment processing.

**Live Demo:** [https://shoes-site-padvyk.vercel.app/](https://shoes-site-padvyk.vercel.app/)

## Features

*   **User Authentication:** Secure login and registration using JWT and Google OAuth (Passport.js).
*   **Product Management:** Browse products, view detailed specifications, and search/filter inventory.
*   **Shopping Cart & Wishlist:** Persistent cart and wishlist functionality managed via Redux Toolkit.
*   **Checkout & Payments:** Secure payment gateway integration using Razorpay.
*   **Real-Time Updates:** order status and live notifications powered by Socket.IO.
*   **Admin Dashboard:** Dedicated admin interfaces to manage products, view order logs, and manage other administrators.
*   **Image Management:** Cloudinary integration for smooth product image uploads and hosting.
*   **Responsive UI:** Fully responsive and animated user interface built with Tailwind CSS and GSAP.

## Technology Stack

### Frontend
*   **Framework:** React 19, Vite
*   **State Management:** Redux Toolkit
*   **Styling:** Tailwind CSS v4, PostCSS
*   **Animations:** GSAP, Tailwind Animate
*   **Routing:** React Router v7
*   **Network:** Axios, Socket.IO Client

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB with Mongoose
*   **Authentication:** bcryptjs, jsonwebtoken, Passport-Google-OAuth20
*   **Uploads:** Multer, Cloudinary
*   **Payments:** Razorpay
*   **Real-time:** Socket.IO

## Local Installation

### Prerequisites
*   Node.js (v18 or higher recommended)
*   MongoDB URI
*   Cloudinary Account
*   Razorpay Account
*   Google Cloud Project (for OAuth)

### Setup Steps

1.  **Clone the repository**

2.  **Backend Setup**
    *   Navigate to the backend directory:
        \ash
        cd backend
         npm install
        \\n    *   Create a .env file in the ackend directory and configure your environment variables:
        \env
        PORT=5000
        MONGO_URI=your_mongodb_uri
        JWT_SECRET=your_jwt_secret
        CLOUDINARY_CLOUD_NAME=your_cloud_name
        CLOUDINARY_API_KEY=your_api_key
        CLOUDINARY_API_SECRET=your_api_secret
        RAZORPAY_KEY_ID=your_razorpay_key
        RAZORPAY_KEY_SECRET=your_razorpay_secret
        GOOGLE_CLIENT_ID=your_google_id
        GOOGLE_CLIENT_SECRET=your_google_secret
        \\n    *   Start the backend development server:
        \ash
         npm run dev
        \\n
3.  **Frontend Setup**
    *   Navigate to the frontend directory:
        \ash
        cd frontend
         npm install
        \\n    *   Create a .env file in the rontend directory (if required) for API URLs or Google OAuth client IDs.
    *   Start the frontend development server:
        \ash
         npm run dev
        \\n
## Deployment
*   The frontend is configured for deployment on Vercel (includes ercel.json).
*   The backend can be deployed to services like Render, Heroku, or DigitalOcean.
