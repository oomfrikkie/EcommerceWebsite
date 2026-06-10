import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "./searchresults.css"
import { API_BASE_URL } from "../../config"

interface Product {
  id: number
  title: string
  brand: string
  price: number
  image_url?: string
}

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const title = searchParams.get("title") ?? ""

  useEffect(() => {
    if (!title) { setLoading(false); return }
    const load = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API_BASE_URL}/products/title`, { params: { title } })
        setProducts(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [title])

  return (
    <div className="search-page">
      <div className="container">
        <h1 className="page-title">
          {title ? `Results for "${title}"` : "Search"}
        </h1>
        <p className="page-subtitle">
          {loading ? "Searching…" : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
        </p>

        {loading ? (
          <div className="loading-state">Searching…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found for "{title}".</p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>Try a different search term.</p>
          </div>
        ) : (
          <div className="search-grid">
            {products.map(product => (
              <div
                key={product.id}
                className="product-tile"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="product-tile-img">
                  {product.image_url && (
                    <img src={`/${product.image_url}`} alt={product.title} />
                  )}
                </div>
                <div className="product-tile-body">
                  <p className="product-tile-brand">{product.brand}</p>
                  <h3 className="product-tile-title">{product.title}</h3>
                  <p className="product-tile-price">€{Number(product.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
