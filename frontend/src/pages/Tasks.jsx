import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const FileCase = () => {
  const { user } = useAuth();
  


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!user) return; // wait until user is loaded from context

  const fetchCases = async () => {
    try {
      let url = '/api/cases';
      if (user.role === 'Client') {
        url += `?clientId=${user._id}`;
      } else if (user.role === 'Lawyer') {
        url += `?lawyerId=${user._id}`;
      }

      const res = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCases(res.data);
    } catch {
      alert('Failed to fetch your cases');
    } finally {
      setLoading(false);
    }
  };
    fetchCases();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/api/cases', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCases([...cases, res.data]);
      setFormData({ title: '', description: '', category: '' });
      alert('Case filed successfully');
    } catch {
      alert('Failed to file case');
    }
  };
  
  const handleDelete = async (caseId) => {
  try {
    await axiosInstance.delete(`/api/cases/${caseId}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });

    setCases(prevCases => prevCases.filter(c => c._id !== caseId));
    alert('Case deleted successfully');
  } catch (err) {
    console.error(err);
    alert('Failed to delete case');
  }
};


  const updateCaseStatus = async (caseId, status) => {
  try {

    const res = await axiosInstance.patch(
  `/api/cases/${caseId}`, // remove /status
  { status },
  { headers: { Authorization: `Bearer ${user.token}` } }
);


    // Update the local state immutably
    setCases(prevCases =>
      prevCases.map(c => (c._id === caseId ? { ...c, status: res.data.status } : c))
    );
  } catch (err) {
    console.error(err);
    alert('Failed to update case status');
  }
};


  if (!user) {
    return <p>Loading user info...</p>;
  }

  if (loading) {
    return <p>Loading cases...</p>;
  }

  if (user.role === 'Client') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">File a New Case</h1>
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
          <input
            type="text"
            placeholder="Case Title"
            className="w-full border p-2 mb-3"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Case Description"
            className="w-full border p-2 mb-3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <select
            className="w-full border p-2 mb-3"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Select Case Category</option>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
            <option value="Family">Family</option>
            <option value="Corporate">Corporate</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">
            Submit Case
          </button>
        </form>

        <h2 className="text-xl font-bold mt-8 mb-4">Your Filed Cases</h2>
        <ul className="space-y-2">
          {cases.map((c) => (
            <li key={c._id} className="border p-3 rounded bg-gray-50">
              <p><strong>{c.title}</strong> — {c.status}</p>
              <p>{c.description}</p>
              <p>Category: {c.category}</p>
              <button
        onClick={() => handleDelete(c._id)}
        className="bg-red-600 text-white px-4 py-2 rounded mt-2"
      >
        Delete
      </button>
            </li>
          ))}
        </ul>


      </div>
    );
  }

  if (user.role === 'Lawyer') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Cases Assigned to You</h1>
        {cases.length === 0 && <p>No cases assigned yet.</p>}
        <ul className="space-y-4">
          {cases.map((c) => (
            <li key={c._id} className="border p-4 rounded bg-gray-50">
              <p><strong>{c.title}</strong> — {c.status}</p>
              <p>{c.description}</p>
              {c.status === 'Filed' && (
                <div className="mt-3 space-x-2">
                  <button
                    onClick={() => updateCaseStatus(c._id, 'In Progress')}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Accept
                  </button>
                  <button
  onClick={() =>
    setCases(prevCases => prevCases.filter(item => item._id !== c._id))
  }
  className="bg-red-600 text-white px-4 py-2 rounded"
>
  Deny
</button>

                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <p>You do not have access to this page.</p>
    </div>
  );
};

export default FileCase;
