import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const CaseForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // if editing
  const [form, setForm] = useState({ caseNumber:'', title:'', description:'', client:'', lawyer:'' });

  useEffect(() => {
    if (!id) return;
    (async ()=> {
      const res = await axiosInstance.get(`/api/cases/${id}`, { headers: { Authorization: `Bearer ${user.token}` }});
      setForm({
        caseNumber: res.data.caseNumber, title: res.data.title,
        description: res.data.description, client: res.data.client._id, lawyer: res.data.lawyer?._id || ''
      });
    })();
  }, [id, user]);

  const submit = async (e) => {
    e.preventDefault();
    if (id) {
      await axiosInstance.put(`/api/cases/${id}`, form, { headers: { Authorization: `Bearer ${user.token}` }});
    } else {
      await axiosInstance.post('/api/cases', form, { headers: { Authorization: `Bearer ${user.token}` }});
    }
    navigate('/cases');
  };

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto p-6">
      <input required placeholder="Case Number" value={form.caseNumber} onChange={e => setForm({...form, caseNumber:e.target.value})} />
      <input required placeholder="Title" value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
      <textarea required placeholder="Description" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
      <input placeholder="Client ID" value={form.client} onChange={e => setForm({...form, client:e.target.value})} />
      <input placeholder="Lawyer ID (optional)" value={form.lawyer} onChange={e => setForm({...form, lawyer:e.target.value})} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">{id? 'Update' : 'Create'}</button>
    </form>
  );
};
export default CaseForm;
