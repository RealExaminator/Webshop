// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Layout/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AddItemPage from './pages/AddItemPage';
import CartPage from './pages/CartPage';
import MyInventoryPage from './pages/MyInventoryPage'; // Component for "/myitems"
import PurchasesPage from './pages/PurchasesPage';
import ChangePasswordPage from './pages/ChangePasswordPage'; // Component for "/account"
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes - Requirement 13.a, 13.b */}
              <Route path="/" element={<HomePage />} /> {/* Shop "/" */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} /> {/* SignUp "/signup" */}

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/add-item" element={<AddItemPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Requirement 13.e - MyItems "/myitems" */}
                <Route path="/myitems" element={<MyInventoryPage />} />

                <Route path="/my-purchases" element={<PurchasesPage />} />

                {/* Requirement 13.d - Edit Account "/account" (assuming this means change password for now) */}
                <Route path="/account" element={<ChangePasswordPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;