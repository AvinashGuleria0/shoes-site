import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderListPage from './pages/admin/OrderListPage';
import ProductListPage from './pages/admin/ProductListPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import ManageAdminsPage from './pages/admin/ManageAdminsPage';
import OrderDetailsPage from './pages/admin/OrderDetailsPage';

function App() {
  return (
    <Router>
      <Header />
      <main className="font-sans antialiased text-gray-900 bg-white dark:bg-deep-void dark:text-white min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/placeorder" element={<PlaceOrderPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} /> 
            <Route path="dashboard" element={<AdminDashboard />}>
                <Route index element={<OrderListPage />} />
                <Route path="orders" element={<OrderListPage />} />
                <Route path="order/:id" element={<OrderDetailsPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="product/:id/edit" element={<ProductEditPage />} />
                <Route path="users" element={<ManageAdminsPage />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <ToastContainer />
    </Router>
  );
}

export default App;
