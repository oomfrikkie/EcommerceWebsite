import { NavLink } from "react-router-dom"
import "./navbar.css"
import { useEffect, useState } from "react"
import axios from "axios"

export default function NavBar() {
  const [logged, setLogged] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const fetchCartCount = async () => {
    const accountId = sessionStorage.getItem("account_id")
    setLogged(!!accountId)

    if (!accountId) {
      setCartCount(0)
      return
    }

    try {
      const res = await axios.get(`http://localhost:3000/cart/${accountId}`)
      const items = Array.isArray(res.data?.items) ? res.data.items : []

      const totalQuantity = items.reduce(
        (sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 0),
        0
      )

      setCartCount(totalQuantity)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchCartCount()

    const handleCartUpdate = () => {
      fetchCartCount()
    }

    window.addEventListener("cart:updated", handleCartUpdate)
    const intervalId = setInterval(fetchCartCount, 5000)

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdate)
      clearInterval(intervalId)
    }
  }, [])

  return (
    <section className="nav-container">
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