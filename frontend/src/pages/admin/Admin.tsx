import { useEffect, useMemo, useState } from "react";
import "./admin.css";

type Order = {
    id: number;
    created_at: string;
    amount: number;
};

type ApiError = {
    message?: string;
};

const API_BASE_URL = "http://localhost:3000";

export default function Admin() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

    const totalRevenue = useMemo(
        () => orders.reduce((sum, order) => sum + Number(order.amount), 0),
        [orders],
    );

    useEffect(() => {
        const fetchAllOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/orders`);
                if (!res.ok) {
                    const errorData: ApiError = await res.json();
                    throw new Error(errorData.message ?? "Failed to fetch orders");
                }

                const data: Order[] = await res.json();
                setOrders(data);
                setError("");
            } catch (e) {
                const message = e instanceof Error ? e.message : "Unexpected error";
                setError(message);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, []);

    const handleDeleteOrder = async (orderId: number) => {
        setDeletingOrderId(orderId);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData: ApiError = await response.json();
                throw new Error(errorData.message ?? "Failed to delete order");
            }

            setOrders((currentOrders) =>
                currentOrders.filter((order) => order.id !== orderId),
            );
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unexpected error";
            setError(message);
        } finally {
            setDeletingOrderId(null);
        }
    };

    return (
        <section className="admin-container">
            <div className="admin-header">
                <p className="admin-kicker">Control Center</p>
                <h1>Admin Dashboard</h1>
            </div>

            <div className="admin-stats">
                <article className="admin-stat-card">
                    <p className="admin-stat-label">Total Orders</p>
                    <p className="admin-stat-value">{orders.length}</p>
                </article>
                <article className="admin-stat-card">
                    <p className="admin-stat-label">Revenue</p>
                    <p className="admin-stat-value">€{totalRevenue.toFixed(2)}</p>
                </article>
            </div>

            {error ? <p className="admin-error">{error}</p> : null}

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="admin-empty-state">
                                    Loading orders...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="admin-empty-state">
                                    No orders available.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td>€{Number(order.amount).toFixed(2)}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="admin-delete-btn"
                                            onClick={() => handleDeleteOrder(order.id)}
                                            disabled={deletingOrderId === order.id}
                                        >
                                            {deletingOrderId === order.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}