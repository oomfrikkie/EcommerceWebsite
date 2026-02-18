import { useState, useEffect } from "react";
import axios from "axios";
import './cart.css'

interface CartItem {
  id: number;
  product: {
    id: number;
    title: string;
    brand: string;
    description: string;
    price: string;
  };
  quantity: number;
}

interface Cart {
  id: number;
  items: CartItem[];
}

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  const handleDelete = async (cartItemId: number) => {
    try {
      await axios.delete(`http://localhost:3000/cart/item/${cartItemId}`);
      // Refetch cart
      const accountId = sessionStorage.getItem("account_id");
      if (accountId) {
        const res = await axios.get(`http://localhost:3000/cart/${accountId}`, { timeout: 5000 });
        setCart(res.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete item");
    }
  };

  useEffect(() => {
    const fetchCart = async () => {
      const accountId = sessionStorage.getItem("account_id");
      if (!accountId) {
        setError("Please log in to view your cart");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:3000/cart/${accountId}`, { timeout: 5000 });
        setCart(res.data);
        
      } catch (err) {
        console.error(err);
        setError("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleCheckout = async () => {
    if (!cart || !cart.items.length) return;
    const accountId = sessionStorage.getItem("account_id");
    if (!accountId) {
      setError("Please log in to checkout");
      return;
    }
    const orderPayload = {
      account_id: parseInt(accountId, 10),
      amount: total,
      products: cart.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    };
    try {
      await axios.post("http://localhost:3000/orders", orderPayload, { timeout: 5000 });
      // Optionally clear cart or refetch
      setCart({ ...cart, items: [] });
      setError("");
      alert("Order placed successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to place order");
    }
  }
  const total = cart?.items?.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0) || 0;

  return (
    <section className='cart-section'>
      <div className='cart-container'>
        <h1>Your Cart</h1>
        {loading && <p>Loading...</p>}
        {error && <p className='cart-error'>{error}</p>}
        <div className='cart-list'>
          {cart?.items?.length && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <div key={item.id} className='cart-item'>
                <div className='item-info'>
                  <div className='item-details'>
                    <img src="/OneFifty.png" alt={item.product.title} className='item-image' />
                    <div className='item-text'>
                      <h3>{item.product.title}</h3>
                      <p>{item.product.brand}</p>
                    </div>
                  </div>
                  <div className='item-price'>
                    <div className='item-total'>Item Total: ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</div>
                    <div className='item-qty'>Qty: {item.quantity}</div>
                    <div className='item-unit-price'>Price per unit: ${item.product.price}</div>
                  </div>
                </div>
                <button className='delete-btn' onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            ))
          ) : (
            !loading && <p>Your cart is empty</p>
          )}
        </div>
        {cart?.items?.length && cart.items.length > 0 && (
          <div className='cart-total'>
            <h3>Total: ${total.toFixed(2)}</h3>
            <button className="pay-button" onClick={handleCheckout}>Pay</button>
          </div>
        )}
      </div>
    </section>
  );
}