import { NavLink } from "react-router-dom"
import "./navbar.css"
import { useEffect, useState } from "react"
import axios from "axios"

export default function NavBar() {
  const [logged, setLogged] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const accountId = sessionStorage.getItem("account_id")
    setLogged(!!accountId)

    if (accountId) {
      axios
        .get(`http://localhost:3000/cart/${accountId}`)
        .then(res => {
          setCartCount(res.data.items.length)
        })
        .catch(console.error)
    }
  }, [])

  return (
    <section className="nav-container">
      {/* Hamburger */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <NavLink to="/home" onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/products" onClick={() => setMenuOpen(false)}>Products</NavLink>

        {logged ? (
          <NavLink to="/account" onClick={() => setMenuOpen(false)}>Account</NavLink>
        ) : (
          <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
        )}

        <NavLink to="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
          <img src="/cart.svg" alt="Cart" className="cart-icons" />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </NavLink>
      </nav>
    </section>
  )
}
