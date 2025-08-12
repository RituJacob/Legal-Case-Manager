import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CaseList = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const fetchCases = async () => {
      const res = await axiosInstance.get('/api/cases', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCases(res.data);
    };
    if (user) fetchCases();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Cases</h2>
      <Link to="/cases/new" className="bg-green-600 text-white px-4 py-2 rounded">New Case</Link>
      <div className="mt-4 grid gap-4">
        {cases.map(c => (
          <div key={c._id} className="p-4 border rounded">
            <h3 className="font-semibold">{c.caseNumber} - {c.title}</h3>
            <p>Status: {c.status}</p>
            <p>Client: {c.client?.name}</p>
            <Link to={`/cases/${c._id}`} className="text-blue-600">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CaseList;
