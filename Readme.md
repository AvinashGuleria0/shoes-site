This LLD is drafted to bridge the gap between a **creative, high-end UI** and a **production-ready backend**.

Since you want **Whapi** (or similar) for WhatsApp, **Razorpay** for payments (standard in India, free setup), and **GSAP** for the "Fake 3D" scroll effect using 2D images, here is the complete blueprint.

---

# Low-Level Design (LLD): "Kicks" (Project Name)

## 1. System Architecture & Tech Stack

*   **Frontend:** React + Vite
    *   **Animation:** GSAP (ScrollTrigger Plugin) for the pinning/scrollytelling.
    *   **Styling:** Tailwind CSS (with `darkMode: 'class'`).
    *   **State:** Redux Toolkit (Cart, Auth, Admin UI State).
    *   **Real-time:** Socket.io-client (Order updates).
*   **Backend:** Node.js + Express
    *   **Image Handling:** Cloudinary (Admin uploads images here).
    *   **Auth:** Passport.js (Google), Custom Logic (WhatsApp via Whapi), JWT.
    *   **Payment:** Razorpay (Supports INR natively).
    *   **Real-time:** Socket.io.
*   **Database:** MongoDB Atlas.

---

## 2. Database Schema Design (Mongoose)

We need a robust schema to handle the **Superadmin Logs** and **Multiple Image Angles**.

### A. User Schema
```javascript
{
  name: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true }, // For WhatsApp Auth
  password: { type: String, select: false }, // Hash
  googleId: String,
  role: { 
    type: String, 
    enum: ['user', 'admin', 'superadmin'], 
    default: 'user' 
  },
  addresses: [{ street: String, city: String, pin: String }],
  createdAt: Date
}
```

### B. Product Schema (The "Scrollytelling" Data)
```javascript
{
  name: String,
  description: String,
  price: Number, // Stored in INR
  stock: Number,
  category: String,
  // The magic happens here: Admins upload sequence of images
  images: {
    front: String, // URL
    side: String,
    back: String,
    perspective: String
  },
  isFeatured: Boolean, // To show on Home Page
  createdAt: Date
}
```

### C. AdminLog Schema (For Superadmin Tracking)
```javascript
{
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionType: String, // e.g., "PRICE_UPDATE", "STOCK_CHANGE", "ORDER_STATUS"
  targetDocument: String, // Which Product/Order ID was touched
  details: String, // "Changed price of Air Jordan from 5000 to 6000"
  timestamp: Date
}
```

### D. Order Schema
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{ 
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    priceAtPurchase: Number 
  }],
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'] },
  orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  razorpayOrderId: String,
  createdAt: Date
}
```

---

## 3. The "Unique" UI Logic (Frontend LLD)

This is how we achieve the "Not AI-generated" look without 3D models.

### A. The Home Page "Pinning" Strategy
Instead of a grid, the Home Page is a **Single Page Scroll Application**.

1.  **Layout:** The screen is split 50/50.
    *   **Left Side (Pinned):** Contains the Shoe Image Container.
    *   **Right Side (Scrollable):** Contains Description, Price, "Add to Cart".
2.  **The Animation (GSAP ScrollTrigger):**
    *   As the user scrolls the Right Side, the Left Side stays stuck (sticky).
    *   **Trigger Points:**
        *   Scroll 0-33%: Show `images.front`. Text: "The Design".
        *   Scroll 33-66%: Crossfade to `images.side`. Text: "The Comfort".
        *   Scroll 66-100%: Crossfade to `images.back`. Text: "The Grip".
3.  **Kinetic Typography:** The huge product name (e.g., "AIR MAX") is placed *behind* the shoe image using `z-index`. As the user scrolls, the text moves horizontally (Parallax).

### B. Dark/Light Mode
*   Use a global context or Redux to toggle a class on the `<html>` tag.
*   **Effect:** In Light mode, background is off-white/grey. In Dark mode, background is "Deep Void Black" (#0a0a0a), and the shoe images (transparent PNGs) will pop.

---

## 4. Admin Panel & Superadmin Logic

### A. Dashboard UI
*   **Analytics:** Use `Recharts` library. Show a line graph of "Sales in INR" vs "Date".
*   **Real-Time Orders:**
    *   Connect to Socket.io on mount.
    *   Listen for event `new_order_placed`.
    *   When triggered, pop a Toast notification ("New Order Received!") and auto-refresh the Order Table without reloading the page.

### B. Superadmin "God Mode"
*   **Manage Admins:** A table listing all users with `role: admin`.
    *   Button: "Revoke Access" (Downgrades them to `user`).
    *   Button: "Send Invite" (Sends email/WhatsApp to join as Admin).
*   **Audit Logs:** A read-only table fetching from `AdminLog` collection.
    *   *Row Example:* `[10:00 AM] Admin Sarah changed price of "Nike Dunk" (+₹500).`

---

## 5. Key API Workflows

### A. WhatsApp Auth (Whapi.cloud)
1.  **Client:** User enters phone number -> Clicks "Send OTP".
2.  **Server:** Generates 6-digit OTP -> Stores in Redis/Temp DB -> Calls Whapi API endpoint to send message.
3.  **Client:** User enters OTP.
4.  **Server:** Verifies OTP. If valid, check if user exists.
    *   If yes -> Issue JWT.
    *   If no -> Create User -> Issue JWT.

### B. Payment (Razorpay)
1.  **Client:** User clicks "Checkout".
2.  **Server:** Creates Razorpay Order (Amount in paise i.e., ₹100 = 10000). Sends `order_id` to Client.
3.  **Client:** Opens Razorpay Modal. User pays.
4.  **Client:** Sends `payment_id`, `order_id`, and `signature` to Backend.
5.  **Server:** Verifies crypto signature. If valid -> Save Order to DB -> **Emit Socket Event `new_order_placed`** to Admin Room.

---

## 6. Project Folder Structure (Recommended)

```
/client (React)
  /src
    /assets (Fonts, Static Images)
    /components
      /UI (Buttons, Cards, Modals - Atomic Design)
      /Animations (GSAP Wrappers)
    /pages
      /Home (The Scrollytelling logic)
      /Shop
      /Admin
        /Dashboard
        /Inventory
        /Logs (Superadmin only)
    /store (Redux Slices: auth, cart, admin)
    /hooks (useSocket, useDarkMode)

/server (Node)
  /config (DB, Razorpay, Whapi keys)
  /controllers
    authController.js
    productController.js
    orderController.js
    adminController.js
  /middleware
    auth.js (JWT verify)
    role.js (Check if Admin/Superadmin)
    logger.js (Save actions to AdminLog)
  /models (Mongoose Schemas)
  /routes
  server.js (Socket.io setup here)
```

---

## 7. Implementation Steps for You

1.  **Phase 1: Setup & Auth:**
    *   Initialize Repo.
    *   Build Login/Signup UI.
    *   Integrate Whapi (WhatsApp) and Google Auth.
2.  **Phase 2: The Core UI (Home):**
    *   Build the Layout.
    *   Implement GSAP ScrollTrigger to swap images based on scroll position.
3.  **Phase 3: Admin & Backend:**
    *   Build CRUD for Products (Upload images to Cloudinary).
    *   Implement "Audit Logging" middleware (every time a POST/PUT happens on products, save a log).
4.  **Phase 4: Commerce:**
    *   Cart Logic (Redux).
    *   Razorpay Integration.
    *   Order Tracking Status Bar.
5.  **Phase 5: Real-time & Polish:**
    *   Socket.io setup for Admin notifications.
    *   Toastify for UX feedback.

### Can I start generating the code for the **Backend Structure** or the **Home Page Animation** first?