// Login Page
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      // Pass entire user info including role and specialization to login context
      login({
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        specialization: response.data.specialization,
        token: response.data.token,
      });
      navigate('/tasks');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r  px-4">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">Welcome Back</h1>
        
        <label className="block mb-2 text-gray-700 font-semibold">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />

        <label className="block mb-2 text-gray-700 font-semibold">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
          minLength={6}
        />

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors duration-300"
        >
          Login
        </button>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Don't have an account? <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Sign up</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
