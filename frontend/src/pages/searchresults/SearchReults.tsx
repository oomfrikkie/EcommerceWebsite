import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"
import './searchresults.css'

interface Product {
  id: number
  title: string
  brand: string
  price: number
}

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])

  const title = searchParams.get("title")

  useEffect(() => {
    if (!title) return
    const fetch = async () => {
      try {
        const res = await axios.get("http://localhost:3000/products/title", { params: { title } })
        setProducts(res.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetch()
  }, [title])

  return (
    <section className="search-results-section">
      <h2>Search results for "{title}"</h2>

      <div className="search-results-container">
        {products.map(product => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <img src="OneFifty.png" alt="" className="scroller-product-image"/>
            <h2>{product.title}</h2>
            <p>€{product.price}</p>
          </div>
      ))}
      </div>
    </section>
  )
}
