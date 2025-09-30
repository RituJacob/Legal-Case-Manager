import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

const FileCase = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [cases, setCases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesByCase, setFilesByCase] = useState({}); // caseId -> files

  useEffect(() => {
  if (!user) return;

  const fetchAllData = async () => {
    setLoading(true);

    let url = '/api/cases';
    if (user.role === 'Client') url += `?clientId=${user._id}`;
    else if (user.role === 'Lawyer') url += `?lawyerId=${user._id}`;

    try {
      const [casesRes, notificationsRes] = await Promise.all([
        axiosInstance.get(url, { headers: { Authorization: `Bearer ${user.token}` } }),
        axiosInstance.get('/api/notifications', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);

      setCases(casesRes.data);
      setNotifications(notificationsRes.data);

      // Fetch files for each case
      const filesData = {};
      for (const c of casesRes.data) {
        const resFiles = await axiosInstance.get(`/api/files?caseId=${c._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        filesData[c._id] = resFiles.data;
      }
      setFilesByCase(filesData);

    } catch (err) {
      console.error(err);
      alert('Failed to fetch cases, files, or notifications');
    } finally {
      setLoading(false);
    }
  };

  fetchAllData();
}, [user]);



  const markNotificationAsRead = async (id) => {
    try {
      setNotifications(prev => prev.filter(n => n._id !== id));
      await axiosInstance.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/api/cases', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCases([...cases, res.data]);
      setFormData({ title: '', description: '', category: '' });
      alert('Case filed successfully');
    } catch (err) {
      console.error(err);
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
        `/api/cases/${caseId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCases(prevCases =>
        prevCases.map(c => (c._id === caseId ? res.data : c))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update case status');
    }
  };

  const handleFileUploaded = async (caseId) => {
    try {
      const res = await axiosInstance.get(`/api/files?caseId=${caseId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFilesByCase((prev) => ({ ...prev, [caseId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameFile = async (caseId, fileId, newName) => {
    try {
      const res = await axiosInstance.put(
        `/api/files/${fileId}`,
        { newName },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setFilesByCase((prev) => ({
        ...prev,
        [caseId]: prev[caseId].map((f) =>
          f._id === fileId ? res.data.file : f
        ),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to rename file");
    }
  };

  const handleDeleteFile = async (caseId, fileId) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this file?")
    )
      return;

    try {
      await axiosInstance.delete(`/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFilesByCase((prev) => ({
        ...prev,
        [caseId]: prev[caseId].filter((f) => f._id !== fileId),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete file");
    }
  };

  if (!user) return <p>Loading user info...</p>;
 
  if (loading) return <div className="text-center p-10">Loading...</div>;

  const NotificationPanel = () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return null;
    return (
      <div className="mb-6 bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-md">
        <h3 className="font-bold text-lg">Notifications</h3>
        <ul className="mt-2 space-y-2">
          {unreadNotifications.map(notification => (
            <li key={notification._id} className="flex justify-between items-center">
              <span>{notification.message}</span>
              <button
                onClick={() => markNotificationAsRead(notification._id)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                title="Mark as read"
              >
                Dismiss
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // --- Client View ---
  if (user.role === 'Client') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <NotificationPanel />
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
              <p>
                <strong>{c.title}</strong> — {c.status}
              </p>
              <p>{c.description}</p>
              <p>Category: {c.category}</p>

              {/* File Upload & List */}
              <div className="mt-4">
                <h3 className="font-semibold">Evidence Files</h3>
            
                <FileUpload caseId={c._id} onUploadSuccess={() => handleFileUploaded(c._id)} />
                <FileList
                  files={filesByCase[c._id] || []}
                  onRename={(fileId, newName) =>
                    handleRenameFile(c._id, fileId, newName)
                  }
                  onDelete={(fileId) => handleDeleteFile(c._id, fileId)}
                />
              
              </div>

              
              
              <button
                onClick={() => handleDelete(c._id)}
                className="bg-red-600 text-white px-4 py-2 rounded mt-2"
              >
                Delete
              </button>
            </li>
          ))}

          { /* Sort Button */ }

          <button
          >
            Sort by Alphabetical
          </button>
        </ul>
      </div>
    );
  }

  // --- Lawyer View ---
  if (user.role === 'Lawyer') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <NotificationPanel />
        <h1 className="text-2xl font-bold mb-4">Cases Assigned to You</h1>
        {cases.length === 0 && <p>No cases assigned yet.</p>}
        <ul className="space-y-4">
          {cases.map((c) => (
            <li key={c._id} className="border p-4 rounded bg-gray-50">
              <p>
                <strong>{c.title}</strong> — {c.status}
              </p>
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
              {c.status === 'In Progress' && (
              <div className="mt-4">
                <h3 className="font-semibold">Evidence Files</h3>
            
                <FileUpload caseId={c._id} onUploadSuccess={() => handleFileUploaded(c._id)} />
                <FileList
                  files={filesByCase[c._id] || []}
                  onRename={(fileId, newName) =>
                    handleRenameFile(c._id, fileId, newName)
                  }
                  onDelete={(fileId) => handleDeleteFile(c._id, fileId)}
                />
               <button
                    onClick={() => updateCaseStatus(c._id, 'Closed')}
                    className="bg-green-600 text-white px-4 py-3 rounded mt-4"
                  >
                    Close
                  </button>
              </div>
              )}

              {c.status === 'Closed' && (
              <button
                    onClick={() => updateCaseStatus(c._id, 'In Progress')}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Reopen
                  </button>
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