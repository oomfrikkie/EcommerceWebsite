import { Route, Routes, Navigate, Link } from 'react-router-dom';

import Home from './pages/home/Home';
import NavBar from './components/navbar/NavBar';
import SearchBar from './components/searchbar/SearchBar';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import VerifyAccount from './pages/verify/Verify';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import Product from './pages/product/Product';
import SearchResults from './pages/searchresults/SearchReults';
import Account from './pages/account/Account';
import Admin from './pages/admin/Admin';
import Products from './pages/products/Products';
import Chat from './components/chat/Chat';

function App() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/home" className="brand-logo">
            One<span>Fifty</span>
          </Link>
          <SearchBar />
          <NavBar />
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:token" element={<VerifyAccount />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/home" className="brand-logo">
              One<span>Fifty</span>
            </Link>
            <p>Premium gear, fresh drops, and everyday essentials — all in one place.</p>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=Shoes">Shoes</Link>
            <Link to="/products?category=Clothing">Clothing</Link>
            <Link to="/products?category=Sports">Sports</Link>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/account">My Orders</Link>
          </div>

          <p className="footer-copy">© 2025 OneFifty. All rights reserved.</p>
        </div>
      </footer>

      <Chat />
    </>
  );
}

export default App;
