import { Route, Routes, Navigate } from 'react-router-dom';

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

function App() {
  return (
    <>
      <header>
        <h1>logo</h1>
        <SearchBar />
        <NavBar />
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:token" element={<VerifyAccount />} />
          <Route path ="/cart" element={<Cart />}/>
          <Route path="/checkout" element={<Checkout />} />
          <Route path ="/product/:id" element={<Product />}/>
          <Route path="/search" element={<SearchResults />} />
          <Route path='/account' element={<Account />} />
        </Routes>
      </main>

      <footer>
        <p>footer</p>
      </footer>
    </>
  );
}

export default App;
