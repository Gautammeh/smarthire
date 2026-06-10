import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert(error.message)
    } else {
      // CHECK USER EXISTS
      if (!data.user) {
        alert("Invalid login")
        return
      }

      navigate("/dashboard")
    }
  }
  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Check your email to confirm your account!")

      // ❌ REMOVE THIS
      // navigate("/dashboard")

      navigate("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-brand-surface p-6 rounded-xl w-[90%] max-w-md shadow-lg">

        <h1 className="text-2xl font-bold mb-4 text-center">SmartHire</h1>

        <input
          className="w-full p-2 mb-3 rounded bg-gray-800"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 rounded bg-gray-800"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-brand-accent p-2 rounded mb-2"
        >
          Login
        </button>

        <button
          onClick={handleSignup}
          className="w-full border p-2 rounded"
        >
          Signup
        </button>
      </div>
    </div>
  )
}