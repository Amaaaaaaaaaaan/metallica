import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from "./pages/home";
import MusicGenerator from './pages/Musicgen';
import PromptSelector from './pages/test';
import Instruments from './pages/Instruments';
import { DrumPlayer } from './pages/drumPlayer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null to avoid flicker
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Convert token presence to boolean
    setLoading(false); // Stop loading after checking auth
  }, []);

  // PrivateRoute component to protect all private pages
  const PrivateRoute = ({ children }) => {
    if (loading) return null; // Wait until authentication is checked
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <Routes>
        {/* Redirect based on authentication */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/instrument" element={<PrivateRoute><Instruments /></PrivateRoute>} />
        <Route path="/Music-Gen" element={<PrivateRoute><MusicGenerator /></PrivateRoute>} />
        <Route path="/test" element={<PrivateRoute><PromptSelector /></PrivateRoute>} />
        <Route path="/drums" element={<PrivateRoute><DrumPlayer /></PrivateRoute>} />

        {/* Catch all invalid routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;


// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import Login from './pages/Login'
// import sidenav from './components/sidenav'
// import Signup from './pages/Signup'
// import Home from "./pages/home";
// import MusicGenerator from './pages/Musicgen'
// import PromptSelector from './pages/test'
// import RefrshHandler from './components/RefrshHandler'
// import Carousel from './components/Carousel'
// import Instruments from './pages/Instruments'
// import { DrumPlayer } from './pages/drumPlayer'
// function App() {

//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const PrivateRoute = ({ element }) => {
//     return isAuthenticated ? element : <Navigate to="/login" />
//   }

//   return (
//     <>
    
//     <div className="App">
     
// <RefrshHandler setIsAuthenticated={setIsAuthenticated} />

// <Routes>

//   <Route path='/' element={<Navigate to='/login'/>} />
//   <Route path='/login' element={<Login/>}></Route>
//   <Route path='/Signup' element={<Signup/>}></Route>
//   <Route path='/instrument' element={<Instruments/>}></Route>
//   <Route path='/home' element={<PrivateRoute element={<Home />} />} />
//   {/* added a refresh handler above by me because if user is unauthenticaed for some reason then he should be 
//     redirected to login page if jwt token is deleted or other edge cases
//   */}
//   <Route path='/Music-Gen' element={<MusicGenerator/>}></Route>
//   <Route path='/test' element={<PromptSelector/>}></Route>
//   <Route path='/drums' element={<DrumPlayer/>}></Route>
// </Routes>
// </div>
//     </>
//   )
// }

// export default App
