import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../../api/axios";
import Alert from "../Alert";
import Spinner from "../Spinner";

const emptyForm = { name: "", description: "", price: "", category: "", stock: "", image: "" };

function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/products", { params: { limit: 100 } })
      .then(({ data }) => setProducts(data.products))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await api.post("/products/upload", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setError(apiErrorMessage(err, "Image upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) || 0 };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save product"));
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete product"));
    }
  };

  return (
    <div>
      <Alert onClose={() => setError("")}>{error}</Alert>

      <form className="row g-2 bg-dark text-light p-3 rounded border border-warning mb-4" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <input name="name" className="form-control" placeholder="Name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <input name="category" className="form-control" placeholder="Category (Men/Women/Kids)" value={form.category} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input name="price" type="number" step="0.01" min="0" className="form-control" placeholder="Price" value={form.price} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input name="stock" type="number" min="0" className="form-control" placeholder="Stock" value={form.stock} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="file" accept="image/*" className="form-control" onChange={handleImageUpload} disabled={uploading} />
        </div>
        <div className="col-12">
          <input name="description" className="form-control" placeholder="Description" value={form.description} onChange={handleChange} />
        </div>
        {form.image && (
          <div className="col-12">
            <img src={form.image} alt="preview" style={{ height: 60 }} className="rounded" />
          </div>
        )}
        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-warning" disabled={uploading}>
            {editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline-warning" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-bordered align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>GH₵ {p.price}</td>
                  <td>{p.stock}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductsManager;
