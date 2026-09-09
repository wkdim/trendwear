import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../../api/axios";
import Alert from "../Alert";
import Spinner from "../Spinner";

function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/categories", { name, description });
      setName("");
      setDescription("");
      load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create category"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete category"));
    }
  };

  return (
    <div>
      <Alert onClose={() => setError("")}>{error}</Alert>

      <form className="row g-2 bg-dark text-light p-3 rounded border border-warning mb-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <input className="form-control" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-5">
          <input className="form-control" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="col-md-3">
          <button type="submit" className="btn btn-warning w-100">Add Category</button>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : (
        <table className="table table-dark table-bordered align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CategoriesManager;
