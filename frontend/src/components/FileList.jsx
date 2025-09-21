// The base URL of backend, needed for download links
// IMPORTANT: change this to EC2 instance's public IP
const API_BASE_URL = 'http://localhost:5001';

const FileList = ({ files, isLoading, onRename, onDelete }) => {
    if (isLoading) {
        return <p className="text-center mt-8">Loading files...</p>;
    }

    if (files.length === 0) {
        return <p className="text-center mt-8">No files uploaded yet. Upload the first file!</p>;
    }

    const handleRenameClick = (file) => {
        const currentNameWithoutExt = file.originalName.split('.').slice(0, -1).join('.');
        // Use prompt to get the new name from user
        const newName = window.prompt('Enter new file name (without extension):', currentNameWithoutExt);
        
        // If user enters a name and doesn't click cancel
        if (newName && newName.trim() !== '') {
            onRename(file._id, newName.trim());
        }
    };

    return (
        <div className="bg-white p-6 shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">My Files</h2>
            <ul className="space-y-2">
                {files.map(file => (
                    <li key={file._id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50 rounded-md">
                        {/* The link points to the file on the server */}
                        <a
                            href={`${API_BASE_URL}/${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            {file.originalName}
                        </a>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-500 text-sm">{(file.size / 1024).toFixed(2)} KB</span>
                            <button
                                onClick={() => handleRenameClick(file)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm font-semibold"
                            >
                                Rename
                            </button>
                            <button
                                onClick={() => onDelete(file._id)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-semibold"
                                >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileList;