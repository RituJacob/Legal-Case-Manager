import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { user } = useAuth();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('myFile', file); // 'myFile' must match the multer config

        setIsUploading(true);
        try {
            await axiosInstance.post('/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
            });
            alert('File uploaded successfully!');
            onUploadSuccess(); // this refreshes the file list later
        } catch (error) {
            alert('File upload failed.');
        } finally {
            setIsUploading(false);
            e.target.reset(); // Clear the form input
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
            <h2 className="text-2xl font-bold mb-4">Upload a New File</h2>
            <input
                type="file"
                onChange={handleFileChange}
                className="w-full mb-4 p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                disabled={!file || isUploading}
            >
                {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
        </form>
    );
};

export default FileUpload;