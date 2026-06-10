import { useEffect, useMemo, useState } from "react";
import "./admin.css";
import { API_BASE_URL } from "../../config";

const ORDER_STATUSES = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

type Order = {
    id: number;
    created_at: string;
    amount: number;
    status: OrderStatus;
};

type ApiError = {
    message?: string;
};

type ProductForm = {
    title: string;
    brand: string;
    description: string;
    price: string;
    categories: string;
};

const EMPTY_PRODUCT: ProductForm = {
    title: "",
    brand: "",
    description: "",
    price: "",
    categories: "",
};

type Tab = "orders" | "products";

export default function Admin() {
    const [activeTab, setActiveTab] = useState<Tab>("orders");

    // --- orders state ---
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    // --- products (add form) state ---
    const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT);
    const [savingProduct, setSavingProduct] = useState(false);
    const [productMessage, setProductMessage] = useState("");
    const [productError, setProductError] = useState("");

    const totalRevenue = useMemo(
        () => orders.reduce((sum, order) => sum + Number(order.amount), 0),
        [orders],
    );

    useEffect(() => {
        const fetchAllOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/orders`);

                // The API returns 404 when there are simply no orders yet —
                // treat that as an empty list, not an error.
                if (res.status === 404) {
                    setOrders([]);
                    setError("");
                    return;
                }

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

    const handleStatusChange = async (orderId: number, status: OrderStatus) => {
        const previous = orders.find((o) => o.id === orderId)?.status;
        setUpdatingOrderId(orderId);
        setError("");

        // Optimistically update the UI, roll back if the request fails.
        setOrders((current) =>
            current.map((o) => (o.id === orderId ? { ...o, status } : o)),
        );

        try {
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const errorData: ApiError = await res.json();
                throw new Error(errorData.message ?? "Failed to update status");
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unexpected error";
            setError(message);
            if (previous) {
                setOrders((current) =>
                    current.map((o) =>
                        o.id === orderId ? { ...o, status: previous } : o,
                    ),
                );
            }
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProduct(true);
        setProductMessage("");
        setProductError("");

        try {
            const body = {
                title: productForm.title.trim(),
                brand: productForm.brand.trim() || undefined,
                description: productForm.description.trim(),
                price: Number(productForm.price),
                categories: productForm.categories
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean),
            };

            const res = await fetch(`${API_BASE_URL}/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errorData: ApiError = await res.json();
                throw new Error(errorData.message ?? "Failed to create product");
            }

            setProductMessage(`✓ "${body.title}" was added successfully.`);
            setProductForm(EMPTY_PRODUCT);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error";
            setProductError(message);
        } finally {
            setSavingProduct(false);
        }
    };

    const updateField = (field: keyof ProductForm, value: string) =>
        setProductForm((form) => ({ ...form, [field]: value }));

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

            <div className="admin-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "orders"}
                    className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
                    onClick={() => setActiveTab("orders")}
                >
                    Orders
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "products"}
                    className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
                    onClick={() => setActiveTab("products")}
                >
                    Products
                </button>
            </div>

            {activeTab === "orders" && (
                <>
                    {error ? <p className="admin-error">{error}</p> : null}

                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="admin-empty-state">
                                            Loading orders...
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="admin-empty-state">
                                            No orders available.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td>€{Number(order.amount).toFixed(2)}</td>
                                            <td>
                                                <select
                                                    className={`admin-status-select status-${order.status}`}
                                                    value={order.status}
                                                    disabled={updatingOrderId === order.id}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            order.id,
                                                            e.target.value as OrderStatus,
                                                        )
                                                    }
                                                >
                                                    {ORDER_STATUSES.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() +
                                                                status.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="admin-delete-btn"
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    disabled={deletingOrderId === order.id}
                                                >
                                                    {deletingOrderId === order.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === "products" && (
                <div className="admin-panel-card">
                    <h2 className="admin-panel-title">Add a New Product</h2>

                    {productMessage ? (
                        <p className="admin-success">{productMessage}</p>
                    ) : null}
                    {productError ? <p className="admin-error">{productError}</p> : null}

                    <form className="admin-form" onSubmit={handleProductSubmit}>
                        <div className="admin-field">
                            <label htmlFor="title">Title</label>
                            <input
                                id="title"
                                type="text"
                                value={productForm.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="Ping Pong Table"
                                required
                            />
                        </div>

                        <div className="admin-field">
                            <label htmlFor="brand">Brand (optional)</label>
                            <input
                                id="brand"
                                type="text"
                                value={productForm.brand}
                                onChange={(e) => updateField("brand", e.target.value)}
                                placeholder="Butterfly"
                            />
                        </div>

                        <div className="admin-field admin-field-full">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                rows={3}
                                value={productForm.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Professional ping pong table for indoor use"
                                required
                            />
                        </div>

                        <div className="admin-field">
                            <label htmlFor="price">Price (€)</label>
                            <input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={productForm.price}
                                onChange={(e) => updateField("price", e.target.value)}
                                placeholder="499.99"
                                required
                            />
                        </div>

                        <div className="admin-field">
                            <label htmlFor="categories">Categories</label>
                            <input
                                id="categories"
                                type="text"
                                value={productForm.categories}
                                onChange={(e) => updateField("categories", e.target.value)}
                                placeholder="games, sports"
                            />
                            <span className="admin-field-hint">Comma-separated</span>
                        </div>

                        <div className="admin-field admin-field-full">
                            <button
                                type="submit"
                                className="admin-submit-btn"
                                disabled={savingProduct}
                            >
                                {savingProduct ? "Adding..." : "Add Product"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}
