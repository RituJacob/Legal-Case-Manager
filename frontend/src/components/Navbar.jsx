import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoIcon from '../assets/images/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

 return (
  <nav className="bg-stone-500 text-white p-4 shadow-md flex justify-between items-center">
    {/* Update the Link to be a flex container */}
    <Link to="/" className="flex items-center space-x-3 text-2xl font-extrabold tracking-wide hover:text-stone-200 transition-colors">
      {/* Add the img tag for your icon */}
      <img src={logoIcon} alt="Legal Case Manager Logo" className="h-8 w-8" />
      <span>Legal Case Manager</span>
    </Link>
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <Link
            to="/tasks"
            className="px-3 py-2 rounded-md hover:bg-stone-600 transition-colors"
          >
            Cases
          </Link>
         
          <Link
            to="/profile"
            className="px-3 py-2 rounded-md hover:bg-stone-600 transition-colors"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="bg-stone-600 px-3 py-2 rounded-md hover:bg-stone-700 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-green-500 px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
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