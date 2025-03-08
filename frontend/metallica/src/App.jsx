import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import sidenav from './components/sidenav'
import Signup from './pages/Signup'
import Home from "./pages/home";
import MusicGenerator from './pages/Musicgen'
import PromptSelector from './pages/test'
import RefrshHandler from './components/RefrshHandler'
import Carousel from './components/Carousel'
import Instruments from './pages/Instruments'
import { DrumPlayer } from './pages/drumPlayer'
import { KeyboardPlayer } from './pages/KeyboardPlay'
import About from './pages/About'
import SVGDrumkit from './components/Drumkit'
import HandDrum from './pages/VirtualDrums'
import Dashboard from './pages/Dashboard'
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
  <Route path='/instrument' element={<Instruments/>}></Route>
  <Route path='/home' element={<PrivateRoute element={<Home />} />} />
  {/* added a refresh handler above by me because if user is unauthenticaed for some reason then he should be 
    redirected to login page if jwt token is deleted or other edge cases
  */}
  <Route path='/Music-Gen' element={<MusicGenerator/>}></Route>
  <Route path='/test' element={<PromptSelector/>}></Route>
  <Route path='/drums' element={<DrumPlayer/>}></Route>
  <Route path='/piano' element={<KeyboardPlayer/>}></Route>
  <Route path='/about' element={<About/>}></Route>
  <Route path='/drumkit' element={<SVGDrumkit/>}></Route>
  <Route path='/virtualdrums' element={<HandDrum/>}></Route>
  <Route path='/saved' element={<Dashboard/>}></Route>

</Routes>
</div>
    </>
  )
}

export default App