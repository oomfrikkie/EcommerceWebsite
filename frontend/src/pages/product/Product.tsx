import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "./product.css"

interface Product {
  id: number
  title: string
  price: number
  brand: string
  description: string
}

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product>()

  const fetchProduct = async (id: string) => {
    const res = await axios.get(
      `http://localhost:3000/products/${id}`
    )
    setProduct(res.data)
  }

  const addToCart = async () => {
    const accountId = sessionStorage.getItem("account_id");
    if (!accountId) {
      alert("Please log in to add items to cart");
      return;
    }
    if (!product) return;

    try {
      await axios.post("http://localhost:3000/cart/add", {
        accountId: Number(accountId),
        productId: product.id,
        quantity: 1,
      });
      window.dispatchEvent(new Event("cart:updated"));
      alert("Added to cart!");
    } catch (error) {
      console.error(error);
      alert("Failed to add to cart");
    }
  };

  useEffect(() => {
    if (id) fetchProduct(id)
  }, [id])

  return (
    <section className="product-page">
      <div className="product-container">
        {product ? (
          <>
            <div className="productPage-image">
              <img src="/OneFifty.png" alt={product.title} />
            </div>
            <div className="product-details">
              <h1>{product.title}</h1>
              <p className="brand">by {product.brand}</p>
              <p className="price">${product.price}</p>
              <p className="description">{product.description}</p>
              <button className="add-to-cart-btn" onClick={addToCart}>Add to Cart</button>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </section>
  )
}
