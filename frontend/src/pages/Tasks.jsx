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

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axiosInstance.get('/api/cases', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setCases(res.data);
      } catch {
        alert('Failed to fetch your cases');
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileCase;
