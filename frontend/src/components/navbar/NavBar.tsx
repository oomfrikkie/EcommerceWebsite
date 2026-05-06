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
    if (!accountId) { setCartCount(0); return }
    try {
      const res = await axios.get(`http://localhost:3000/cart/${accountId}`)
      const items = Array.isArray(res.data?.items) ? res.data.items : []
      const total = items.reduce(
        (sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 0), 0
      )
      setCartCount(total)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const init = async () => { await fetchCartCount() }
    init()
    const onCart = () => { fetchCartCount() }
    const onAuth = () => { fetchCartCount() }
    window.addEventListener("cart:updated", onCart)
    window.addEventListener("auth:updated", onAuth)
    const id = setInterval(fetchCartCount, 6000)
    return () => {
      window.removeEventListener("cart:updated", onCart)
      window.removeEventListener("auth:updated", onAuth)
      clearInterval(id)
    }
  }, [])

  const close = () => setMenuOpen(false)

  return (
    <>
      <button
        className={`hamburger ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
      >
        <span className="hline" />
        <span className="hline" />
        <span className="hline" />
      </button>

      <nav className={`nav ${menuOpen ? "is-open" : ""}`}>
        <NavLink to="/home" className="nav-link" onClick={close}>Home</NavLink>
        <NavLink to="/products" className="nav-link" onClick={close}>Products</NavLink>
        {logged
          ? <NavLink to="/account" className="nav-link" onClick={close}>Account</NavLink>
          : <NavLink to="/login" className="nav-link" onClick={close}>Login</NavLink>
        }
        <NavLink to="/cart" className="nav-link nav-cart" onClick={close}>
          Cart
          {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        </NavLink>
      </nav>

      {menuOpen && <div className="nav-backdrop" onClick={close} />}
    </>
  )
}
