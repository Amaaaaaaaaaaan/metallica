import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from "./pages/home";
import MusicGenerator from './pages/Musicgen'
import PromptSelector from './pages/test'
import RefrshHandler from './components/RefrshHandler'
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />
  }

  return (
    <>
    
    <div className="App">
<RefrshHandler setIsAuthenticated={setIsAuthenticated} />

<Routes>

  <Route path='/' element={<Navigate to='/login'/>} />
  <Route path='/login' element={<Login/>}></Route>
  <Route path='/Signup' element={<Signup/>}></Route>
  <Route path='/home' element={<PrivateRoute element={<Home />} />} />
  {/* added a refresh handler above by me because if user is unauthenticaed for some reason then he should be 
    redirected to login page if jwt token is deleted or other edge cases
  */}
  <Route path='/Music-Gen' element={<MusicGenerator/>}></Route>
  <Route path='/test' element={<PromptSelector/>}></Route>
</Routes>
</div>
    </>
  )
}

export default App
