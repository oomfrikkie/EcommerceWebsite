import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "./product.css"

interface Product {
  id: number;
  title: string;
  price: number;
  brand: string;
  description: string;
  image_url?: string;
}

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product>()
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const res = await axios.get(`http://localhost:3000/products/${id}`)
      setProduct(res.data)
      setLoading(false)
    }
    load()
  }, [id])

  const addToCart = async () => {
    const accountId = sessionStorage.getItem("account_id")
    if (!accountId) { alert("Please log in to add items to cart"); return }
    if (!product) return
    try {
      await axios.post("http://localhost:3000/cart/add", {
        accountId: Number(accountId),
        productId: product.id,
        quantity: 1,
      })
      window.dispatchEvent(new Event("cart:updated"))
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (error) {
      console.error(error)
      alert("Failed to add to cart")
    }
  }

  if (loading) return <div className="loading-state" style={{ paddingTop: "4rem" }}>Loading…</div>
  if (!product) return <div className="empty-state" style={{ paddingTop: "4rem" }}>Product not found.</div>

  return (
    <div className="product-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/products">Products</Link>
          <span>›</span>
          <span>{product.title}</span>
        </nav>

        <div className="product-detail">
          <div className="product-detail-img">
            {product.image_url
              ? <img src={`/${product.image_url}`} alt={product.title} />
              : <div className="img-placeholder" />
            }
          </div>

          <div className="product-detail-info">
            <p className="product-brand">{product.brand}</p>
            <h1 className="product-name">{product.title}</h1>
            <p className="product-price">€{Number(product.price).toFixed(2)}</p>
            <p className="product-desc">{product.description}</p>

            <button
              className={`btn btn-primary btn-lg product-cta ${added ? "added" : ""}`}
              onClick={addToCart}
            >
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>

            <p className="product-shipping">Free delivery on orders over €50</p>
          </div>
        </div>
      </div>
    </div>
  )
}
