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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );

  return (
    <div className="container-fluid p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold mb-0">
            <i className="fas fa-users-cog me-2"></i>User Management
        </h2>
        <span className="badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill">
            Total Users: {users.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="py-3 ps-4 text-uppercase text-muted small fw-bold border-bottom">Name</th>
                            <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Email</th>
                            <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Role</th>
                            <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Status</th>
                            <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded-circle p-2 me-2 text-secondary d-flex justify-content-center align-items-center" style={{width: '35px', height: '35px'}}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <span className="fw-bold text-dark">{u.name}</span>
                                    </div>
                                </td>
                                <td className="text-muted">{u.email}</td>
                                <td>
                                    <span className={`badge rounded-pill px-3 py-2 border ${
                                        u.role === 'admin' ? 'bg-purple-subtle text-purple border-purple-subtle' :
                                        u.role === 'doctor' ? 'bg-info-subtle text-info border-info-subtle' :
                                        'bg-secondary-subtle text-secondary border-secondary-subtle'
                                    }`}>
                                        {u.role === 'admin' && <i className="fas fa-crown me-1"></i>}
                                        {u.role === 'doctor' && <i className="fas fa-user-md me-1"></i>}
                                        {u.role === 'patient' && <i className="fas fa-user me-1"></i>}
                                        <span className="text-uppercase small">{u.role}</span>
                                    </span>
                                </td>
                                <td>
                                    {u.is_active ? 
                                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">
                                            <i className="fas fa-check-circle me-1"></i>Active
                                        </span> : 
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3">
                                            <i className="fas fa-ban me-1"></i>Inactive
                                        </span>
                                    }
                                </td>
                                <td>
                                    <button 
                                        className={`btn btn-sm shadow-sm ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                        onClick={() => toggleStatus(u.id)}
                                        style={{minWidth: '100px'}}
                                    >
                                        {u.is_active ? (
                                            <><i className="fas fa-user-slash me-1"></i> Deactivate</>
                                        ) : (
                                            <><i className="fas fa-user-check me-1"></i> Activate</>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;