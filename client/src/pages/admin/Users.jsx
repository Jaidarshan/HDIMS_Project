import { useEffect, useState } from 'react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = () => {
    api.get('/admin/users')
       .then(res => { setUsers(res.data.users); setLoading(false); })
       .catch(console.error);
  };

  const toggleStatus = async (id) => {
    try {
        await api.post(`/admin/user/${id}/toggle-status`);
        showToast('User status updated successfully', 'success');
        fetchUsers(); // Reload list
    } catch (err) {
        showToast('Action failed', 'danger');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4 text-primary"><i className="fas fa-users-cog me-2"></i>User Management</h2>
      <div className="card shadow-sm">
        <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {users.map(u => (
                    <tr key={u.id}>
                        <td className="fw-bold">{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className="badge bg-secondary text-uppercase">{u.role}</span></td>
                        <td>
                            {u.is_active ? 
                                <span className="badge bg-success">Active</span> : 
                                <span className="badge bg-danger">Inactive</span>
                            }
                        </td>
                        <td>
                            <button 
                                className={`btn btn-sm btn-outline-${u.is_active ? 'danger' : 'success'}`}
                                onClick={() => toggleStatus(u.id)}
                            >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;