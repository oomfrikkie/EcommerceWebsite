import { useState, useEffect } from "react";
import axios from "axios";

interface Account {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Order {
  id: number;
  amount: number;
  created_at: string;
}

export default function Account() {
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const accountId = sessionStorage.getItem("account_id");

  useEffect(() => {
    if (!accountId) return;

    const fetchAccountDetails = async () => {
      const res = await axios.get(
        `http://localhost:3000/account/${accountId}`
      );
      setAccount(res.data);
    };

    fetchAccountDetails();
  }, [accountId]);

  useEffect(() => {
    if (!accountId) return;

    const fetchOrders = async () => {
      const res = await axios.get(
        `http://localhost:3000/orders/account/${accountId}`
      );
      setOrders(res.data);
    };

    fetchOrders();
  }, [accountId]);

 return (
 <section>
  <div>
      <h1>Hello {account?.first_name}</h1>
      <p>here you find all your details and your orders</p>
      <p>email: {account?.email}</p>
      <p>name: {account?.first_name} {account?.last_name}</p>
  </div>
  <div>
    {orders.length === 0 ? (
      <p>No orders have been made.</p>
    ) : (
      orders.map((order) => (
        <div key={order.id} className="order-item">
          <h3>{order.amount}</h3>
          <h3>{order.created_at}</h3>
          <h3>{}</h3>
        </div>
      ))
    )}
  </div>
</section>

);

}
