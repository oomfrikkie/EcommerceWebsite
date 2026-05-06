import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./productscroller.css"

type ProductScrollerProps = { category: string }

interface Product {
  id: number
  title: string
  brand: string
  price: number
  image_url?: string
}

export default function ProductScroller({ category }: ProductScrollerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      await productsPerCategory(category)
    }
    load()
  }, [category])

  const productsPerCategory = async (cat: string) => {
    try {
      const res = await axios.get("http://localhost:3000/products/category/by-name", {
        params: { name: cat },
      })
      setProducts(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  if (products.length === 0) {
    return <p className="empty-state">No products found in {category}.</p>
  }

  return (
    <div className="product-scroller">
      {products.map(product => (
        <div
          key={product.id}
          className="product-card"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <div className="product-image-wrapper">
            {product.image_url && (
              <img
                src={`/${product.image_url}`}
                alt={product.title}
                className="product-image"
              />
            )}
          </div>
          <div className="product-card-body">
            <h2>{product.title}</h2>
            <p>€{Number(product.price).toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
