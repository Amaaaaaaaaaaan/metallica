import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import Sidenav from '../components/sidenav';

function Home() {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (!user) {
            navigate('/signup'); // Redirect if user is not logged in
        } else {
            setLoggedInUser(user);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('User Logged out');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    if (loggedInUser === null) {
        return <p>Loading...</p>; // Prevents rendering before authentication check
    }

    return (
        <div>
            <Sidenav />
            <h1>Welcome {loggedInUser}</h1>
            <button onClick={handleLogout}>Logout</button>
            <ToastContainer />
        </div>
    );
}

export default Home;
