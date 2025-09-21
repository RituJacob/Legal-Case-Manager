import { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const FileDashboard = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch files on component mount
  useEffect(() => {
    if (!user) return; // wait until user is loaded

    const fetchFiles = async () => {
      try {
        const res = await axiosInstance.get('/api/files', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFiles(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user]);

  // Handle file rename
  const handleRenameFile = async (fileId, newName) => {
    try {
      const res = await axiosInstance.put(
        `/api/files/${fileId}`,
        { newName },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setFiles(prev => prev.map(f => (f._id === fileId ? res.data.file : f)));
      alert('File renamed successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to rename file');
    }
  };

  // Handle file delete
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to permanently delete this file?')) return;

    try {
      await axiosInstance.delete(`/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFiles(prev => prev.filter(f => f._id !== fileId));
      alert('File deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete file');
    }
  };

  if (!user) return <p>Loading user info...</p>;
  if (loading) return <p>Loading files...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Cloud Storage</h1>
      <FileUpload
        onUploadSuccess={async () => {
          // refetch files after upload
          try {
            const res = await axiosInstance.get('/api/files', {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            setFiles(res.data);
          } catch (err) {
            console.error(err);
            alert('Failed to refresh files after upload');
          }
        }}
      />
      <div className="mt-8">
        <FileList
          files={files}
          isLoading={loading}
          onRename={handleRenameFile}
          onDelete={handleDeleteFile}
        />
      </div>
    </div>
  );
};

export default FileDashboard;
