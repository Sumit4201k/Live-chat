import React from 'react'
import { useAuthStore } from '../store/AuthStorer'

function SignUppage() {

  const [formData, setFormData] = useState({fullname:"",email:"",password:""})
  const {signup, isSigningUp} = useAuthStore()

  const handleSubmit = (e)=>{
    e.preventDefault()
    signup(formData)
  };

  return (
    <div>
      signUp-Page
    </div>
  )
}

export default SignUppage
