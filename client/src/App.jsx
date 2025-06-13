import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login.jsx'
import AdminHome from "./pages/admin/AdminHome.jsx";
const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/signup' element={<SignUp/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path="/admin/" element={<AdminHome />}/>
    </Routes>
    // <div className='font-bold'>App</div>
  )
}

export default App