import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

 return (
  <nav className="bg-blue-400 text-white p-4 shadow-md flex justify-between items-center">
    <Link to="/" className="text-2xl font-extrabold tracking-wide hover:text-blue-200 transition-colors">
      Legal Case Manager
    </Link>
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <Link
            to="/tasks"
            className="px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Cases
          </Link>
          <Link
            to="/storage"
            className="px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Storage
          </Link>
          <Link
            to="/profile"
            className="px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-400 px-4 py-2 rounded-md hover:bg-red-500 transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="bg-blue-500 px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-green-400 px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Register
          </Link>
        </>
      )}
    </div>
  </nav>
);

};

export default Navbar;
