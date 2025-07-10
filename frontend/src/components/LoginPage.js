import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { authStyles as styles } from '../styles/AuthStyles';
import { FaUser, FaLock } from 'react-icons/fa';
import { playLoginSound } from '../utils/soundEffects';
import { useDispatch } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { api } from '../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Log the request payload
        console.log('Attempting login with:', { email });

        try {
            console.log('Making API request to:', '/api/users/login');
            const response = await api.post('/api/users/login', { 
                email, 
                password 
            });
            
            console.log('Server response:', response.data);
            
            if (response.data && response.data.user) {
                // Store user data and token in localStorage
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
                
                // Set the default Authorization header for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                // Dispatch to Redux
                await dispatch(loginUser(response.data));
                
                // Play sound effect
                playLoginSound();
                
                // Get role and navigate
                const role = response.data.user.role.toLowerCase(); // Ensure lowercase
                console.log('User role:', role);
                
                // Navigate based on role
                switch(role) {
                    case 'buyer':
                        navigate('/buyer');
                        break;
                    case 'seller':
                        navigate('/seller');
                        break;
                    case 'employee':
                        navigate('/employee');
                        break;
                    case 'admin':
                        navigate('/admin');
                        break;
                    default:
                        setError('Invalid user role');
                        console.error('Invalid role:', role);
                }
            } else {
                setError('Invalid response from server');
                console.error('Invalid response structure:', response.data);
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response) {
                // Log detailed error information
                console.error('Error status:', err.response.status);
                console.error('Error headers:', err.response.headers);
                console.error('Error data:', err.response.data);
                
                const errorMessage = err.response.data?.error || err.response.data?.message || 'Invalid email or password';
                setError(errorMessage);
            } else if (err.request) {
                console.error('Network error - no response received');
                setError('Unable to connect to server. Please check if the server is running.');
            } else {
                console.error('Error details:', err.message);
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.floatingShape1}></div>
            <div style={styles.floatingShape2}></div>
            <div style={styles.floatingShape3}></div>
            <div style={styles.floatingShape4}></div>
            <div style={styles.formBox}>
                <h2 style={styles.header}>Welcome Back</h2>
                {error && <p style={styles.errorText}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputBox}>
                        <FaUser style={styles.icon} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                ...styles.input,
                                textTransform: 'none'
                            }}
                        />
                    </div>

                    <div style={styles.inputBox}>
                        <FaLock style={styles.icon} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                ...styles.input,
                                textTransform: 'none'
                            }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{
                            ...styles.submitButton,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        Don't have an account? {' '}
                        <Link to="/signup" style={styles.link}>
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage; 