import React from 'react'
import {Route,Router,Routes} from 'react-router'
import Chatpage from './Pages/Chatpage'
import LoginPage from './Pages/LoginPage'
import SignUppage from './Pages/SignUppage'
import { useAuthStore } from './store/AuthStorer'


function App() {
  const { IsloggedIn ,Login  }= useAuthStore()
  console.log("islogged in ",IsloggedIn);
  
  return (
    <div>
       <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />
      
      <button onClick={Login} className=' z-10'>Click me</button>

      <Routes>
        <Route path="/" element={<Chatpage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/signUp' element={<SignUppage />}/>
      </Routes>
        </div>

    </div>
  )
}

export default App

