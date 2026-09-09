import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../../api/axios";
import Alert from "../Alert";
import Spinner from "../Spinner";

function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/users")
      .then(({ data }) => setUsers(data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <Alert onClose={() => setError("")}>{error}</Alert>
      <table className="table table-dark table-bordered align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span className={`badge bg-${u.role === "admin" ? "warning text-dark" : "secondary"}`}>
                  {u.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersManager;
