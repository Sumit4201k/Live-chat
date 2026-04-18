import React, { useEffect } from 'react'
import {Navigate, Route,Router,Routes} from 'react-router'
import Chatpage from './Pages/Chatpage'
import LoginPage from './Pages/LoginPage'
import SignUppage from './Pages/SignUppage'
import { useAuthStore } from './store/AuthStorer'
import PageLoader from './components/PageLoader'
import {Toaster} from 'react-hot-toast'

function App() {
 
  const {authuser ,isAuthenticated ,AuthCheck} =  useAuthStore()

  // useEffect(()=>{
  //   AuthCheck()
  // },[AuthCheck])

  // if (isAuthenticated) return <PageLoader/>

  // console.log("authorization check",isAuthenticated);
  // console.log("authorization check",authuser);
  
  return (
    <div>
       <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />
      
      

      <Routes>
        <Route path="/" element={authuser ? <Chatpage/> : <Navigate to={"/login"} /> } />
        <Route path='/login' element={!authuser ? <LoginPage/>: <Navigate to={"/"}/> }/>
        <Route path='/signUp' element={!authuser ? <SignUppage /> : <Navigate to={"/"}/>}/>
      </Routes>
        </div>
    <Toaster/>
    </div>
  )
}

export default App

