import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from "./pages/home";
import MusicGenerator from './pages/Musicgen'

function App() {

  return (
    <>
<Routes>
  <Route path='/' element={<Navigate to='/login'/>} />
  <Route path='/login' element={<Login/>}></Route>
  <Route path='/Signup' element={<Signup/>}></Route>
  <Route path='/Home' element={<Home/>}></Route>
  <Route path='/Music-Gen' element={<MusicGenerator/>}></Route>
</Routes>
    </>
  )
}

export default App
