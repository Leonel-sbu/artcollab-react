import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AdminRoute from "./components/common/AdminRoute.jsx";

import Home from "./pages/home/Home.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

import Courses from "./pages/courses/Courses.jsx";
import CourseDetails from "./pages/courses/CourseDetails.jsx";

import Marketplace from "./pages/marketplace/Marketplace.jsx";
import ArtworkDetails from "./pages/marketplace/ArtworkDetails.jsx";

import Cart from "./pages/cart/Cart.jsx";
import Checkout from "./pages/cart/Checkout.jsx";

import Orders from "./pages/orders/Orders.jsx";
import OrderDetails from "./pages/orders/OrderDetails.jsx";

import Messages from "./pages/messaging/Messages.jsx";
import Admin from "./pages/admin/Admin.jsx";
import Profile from "./pages/profile/Profile.jsx";

import VRGalleryPage from "./pages/vr/VRGalleryPage.jsx";
import NotFound from "./pages/NotFound.jsx";

function PublicOnly({ children }) {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/marketplace" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/artworks/:id" element={<ArtworkDetails />} />

          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />

          {/* Cart = public, Checkout = protected */}
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          <Route
            path="/vr"
            element={
              <ProtectedRoute>
                <VRGalleryPage />
              </ProtectedRoute>
            }
          />

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
