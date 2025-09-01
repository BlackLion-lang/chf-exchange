"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import GoogleOneTap from "@/components/GooleOneTap"

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback: (notification: any) => void) => void
          cancel: () => void
          revoke: (hint: string, callback: () => void) => void
        }
      }
    }
  }
}



export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  
  // Warning states for login validation
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [loginError, setLoginError] = useState("")

  // Simple registration states
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Forgot password flow states
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1) // 1: email, 2: code, 3: password
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotVerificationCode, setForgotVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [resetToken, setResetToken] = useState("")
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("/images/login_bg.png")

  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const activateToken = urlParams.get('activationToken');   //verify token
        const token = urlParams.get('token');   //ctyped email

        console.log("debug--------->", activateToken, token);

        const res = await fetch("http://api.robora-dapp.xyz:3001/activate", {
          method: "post",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ activateToken, token })
        })
        const data = await res.json();
        if (data.user) {
          router.push('/login');
        } else {
          return;
        }

      } catch (error) {
        console.error('Error activating account:', error);
      }
    }
    verifyToken()
  }, [])

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setEmailError("")
    setPasswordError("")
    setLoginError("")
    
    // Validate email format
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }
    
    // Validate password
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long")
      return
    }
    
    try {
      const res = await fetch("http://api.robora-dapp.xyz:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await res.json()

      if (res.ok && data.user && data.user.activate) {
        // Use the auth hook to handle login
        login(data.token, rememberMe)

        // Check if there's a redirect parameter
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirect') || '/overview'
        
        router.push(redirectTo)
      } else if (res.status === 401) {
        // Invalid credentials
        setLoginError("Invalid email or password. Please try again.")
      } else if (res.status === 403) {
        // Account not activated
        setLoginError("Please verify your email address before logging in.")
      } else {
        // Other errors
        setLoginError(data.message || "Login failed. Please try again.")
      }

      // Simulate login logic here
    } catch (error) {
      console.error("Login failed:", error)
      setLoginError("Network error. Please check your connection and try again.")
    }
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!isValidEmail(regEmail)) {
      alert("Please enter a valid email address!")
      return
    }

    if (regPassword.length < 6) {
      alert("Password must be at least 6 characters long!")
      return
    }

    if (regPassword !== confirmPassword) {
      alert("Passwords don't match!")
      return
    }

    try {
      // Here you would typically make an API call to register the user
      console.log("Registration data:", { email: regEmail, password: regPassword })

      const email = regEmail;
      const password = regPassword;

      const res = await fetch("http://api.robora-dapp.xyz:3001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      router.push("/login")
      // For now, just close the modal and show success
      alert("Registration successful! Please login with your credentials.")
      setIsRegistrationOpen(false)

      // Reset registration form
      setRegEmail("")
      setRegPassword("")
      setConfirmPassword("")
      setShowRegPassword(false)
      setShowConfirmPassword(false)
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(forgotEmail)) {
      alert("Please enter a valid email address!")
      return
    }

    try {
      // Here you would typically make an API call to send verification code
      console.log("Sending verification code to:", forgotEmail)

      const email = forgotEmail;

      const res = await fetch("http://api.robora-dapp.xyz:3001/sendForgotPasswordCode", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      // Simulate API call
      const data = await res.json();

      if (data.message) {
        alert(`Verification code sent to ${forgotEmail}! Please check your email.`)
        setForgotPasswordStep(2)
      } else {
        return
      }
    } catch (error) {
      console.error("Failed to send verification code:", error)
    }
  }

  const handleForgotCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (forgotVerificationCode.length < 4) {
      alert("Please enter the verification code!")
      return
    }

    try {
      // Here you would typically verify the code with your API
      console.log("Verifying code:", forgotVerificationCode)

      const email = forgotEmail;
      const code = forgotVerificationCode;
      const res = await fetch("http://api.robora-dapp.xyz:3001/verifyForForgetPassword", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code })
      })

      const data = await res.json();

      if (data.access_token) {
        setResetToken(data.access_token);
        setForgotPasswordStep(3);
      } else {
        alert("Invalid code or expired");
        return;
      }
      // Simulate API call
    } catch (error) {
      console.error("Failed to verify code:", error)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long!")
      return
    }

    if (newPassword !== confirmNewPassword) {
      alert("Passwords don't match!")
      return
    }

    try {
      // Here you would typically make an API call to reset the password
      console.log("Resetting password for:", forgotEmail)

      const res = await fetch("http://api.robora-dapp.xyz:3001/resetPassword", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resetToken}`, // Include the token in headers
        },
        body: JSON.stringify({
          password: newPassword,
          token: resetToken // Also include in body if your API expects it
        }),
      })

      const data = await res.json();

      console.log("updated data", res)

      if (res.ok) {
        // Simulate API call
        alert("Password reset successful! Please login with your new password.")
        setIsForgotPasswordOpen(false)

        // Reset forgot password flow
        setForgotPasswordStep(1)
        setForgotEmail("")
        setForgotVerificationCode("")
        setNewPassword("")
        setConfirmNewPassword("")
        setShowNewPassword(false)
        setShowConfirmNewPassword(false)
        setResetToken("") // Clear the token
      } else {
        alert(data.message || "Password reset failed. Please try again.")
      }
    } catch (error) {
      console.error("Password reset failed:", error)
      alert("Password reset failed. Please try again.")
    }
  }

  const handleForgotResendCode = async () => {
    try {
      // Here you would typically make an API call to resend verification code
      console.log("Resending verification code to:", forgotEmail)

      // Simulate API call
      alert(`Verification code resent to ${forgotEmail}!`)
    } catch (error) {
      console.error("Failed to resend verification code:", error)
    }
  }

  const resetRegistrationModal = () => {
    setRegEmail("")
    setRegPassword("")
    setConfirmPassword("")
    setShowRegPassword(false)
    setShowConfirmPassword(false)
  }

  const resetForgotPasswordModal = () => {
    setForgotPasswordStep(1)
    setForgotEmail("")
    setForgotVerificationCode("")
    setNewPassword("")
    setConfirmNewPassword("")
    setShowNewPassword(false)
    setShowConfirmNewPassword(false)
    setResetToken("") // Clear the reset token
  }

  // Function to set background image URL
  const setBackgroundImage = (imageUrl: string) => {
    setBackgroundImageUrl(imageUrl)
  }

  // Function to reset to default gradient background
  const resetToDefaultBackground = () => {
    setBackgroundImageUrl("")
  }

  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-white">Reset Password</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-gray-300 text-center mb-6">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>
              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-12 h-12 bg-slate-700 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white h-12 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isValidEmail(forgotEmail)}
                  onClick={handleForgotEmailSubmit}
                >
                  SEND VERIFICATION CODE
                </Button>
              </form>
            </div>
          </>
        )

      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-white">Verify Code</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-gray-300 text-center mb-6">
                We've sent a verification code to <span className="text-purple-300 font-medium">{forgotEmail}</span>
              </p>
              <form onSubmit={handleForgotCodeSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={forgotVerificationCode}
                    onChange={(e) => setForgotVerificationCode(e.target.value)}
                    className="h-12 bg-slate-700 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleForgotEmailSubmit}
                    className="flex-1 bg-transparent border-purple-400/30 text-purple-300 hover:bg-purple-600/20 hover:text-white h-12 rounded-xl"
                  >
                    RESEND
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white h-12 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={forgotVerificationCode.length < 4}
                    onClick={handleForgotCodeSubmit}
                  >
                    CONFIRM
                  </Button>
                </div>
              </form>
            </div>
          </>
        )

      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-white">Reset Password</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-gray-300 text-center mb-6">Create a new secure password for your account</p>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-slate-700 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <Input
                    type={showConfirmNewPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-slate-700 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white h-12 text-lg font-semibold rounded-xl shadow-lg mt-6"
                  onClick={handlePasswordReset}
                >
                  RESET PASSWORD
                </Button>
              </form>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: backgroundImageUrl
          ? `url('${backgroundImageUrl}') center/contain no-repeat, linear-gradient(135deg, #8B5CF6 0%, #A855F7 25%, #9333EA 50%, #7C3AED 75%, #6D28D9 100%)`
          : "linear-gradient(135deg, #8B5CF6 0%, #A855F7 25%, #9333EA 50%, #7C3AED 75%, #6D28D9 100%)",
        backgroundSize: backgroundImageUrl ? 'cover' : 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay when using custom image */}
      {backgroundImageUrl && (
        <div className="absolute inset-0 bg-black/40"></div>
      )}

      {/* Background decorative elements - only show with gradient */}
      {!backgroundImageUrl && (
        <div className="absolute inset-0">
          {/* Top left flowing shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 opacity-30">
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/40 rounded-full blur-3xl"></div>
            <div className="absolute top-20 left-32 w-48 h-48 bg-purple-300/50 rounded-full blur-2xl"></div>
          </div>

          {/* Curved lines */}
          <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 1200 800">
            <path d="M0,400 Q300,200 600,400 T1200,400" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
            <path d="M0,450 Q400,250 800,450 T1200,450" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
          </svg>

          {/* Bottom decorative shapes */}
          <div className="absolute bottom-0 right-0 w-80 h-80 opacity-25">
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-400/60 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-32 w-24 h-24 bg-blue-400/40 rounded-full blur-xl"></div>
          </div>

          {/* Additional floating elements */}
          <div className="absolute bottom-32 left-20 w-16 h-16 bg-purple-300/30 rounded-full blur-xl"></div>
          <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-blue-300/40 rounded-full blur-lg"></div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-between px-16">
        {/* Left side - Logo */}
        <div className="flex-1 flex items-center justify-center">
          <Image src="/images/robora-logo-new.png" alt="Robora Logo" width={400} height={100} className="h-40 w-auto" />
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-8">Login to your account</h2>
            </div>

            {/* Background Image Input - Uncomment for testing */}
            {/* 
            <div className="space-y-2 mb-4">
              <Input
                type="url"
                placeholder="Enter background image URL (optional)"
                value={backgroundImageUrl}
                onChange={(e) => setBackgroundImageUrl(e.target.value)}
                className="h-10 bg-black/20 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300"
              />
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaultBackground}
                  className="bg-transparent border-purple-400/30 text-purple-300 hover:bg-purple-600/20 hover:text-white"
                >
                  Reset to Default
                </Button>
              </div>
            </div>
            */}

            <form className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) setEmailError("") // Clear error when typing
                      }}
                      className={`pl-12 h-14 bg-black/20 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-400 text-sm mt-1 ml-1">{emailError}</p>
                  )}
                </div>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (passwordError) setPasswordError("") // Clear error when typing
                        if (loginError) setLoginError("") // Clear login error when typing
                      }}
                      className={`pl-12 h-14 bg-black/20 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                  </div>
                  {passwordError && (
                    <p className="text-red-400 text-sm mt-1 ml-1">{passwordError}</p>
                  )}
                </div>
              </div>

              {/* General login error message */}
              {loginError && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  {loginError}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-purple-700 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <label htmlFor="remember" className="text-sm text-white">
                    Remember me
                  </label>
                </div>
                <Dialog
                  open={isForgotPasswordOpen}
                  onOpenChange={(open) => {
                    setIsForgotPasswordOpen(open)
                    if (!open) {
                      resetForgotPasswordModal()
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <button type="button" className="text-sm text-purple-400 hover:text-white ">
                      Forgot password?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-slate-800 border-purple-400/30 text-white rounded-2xl shadow-2xl">
                    {renderForgotPasswordContent()}
                  </DialogContent>
                </Dialog>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white h-14 text-lg font-semibold rounded-xl shadow-lg"
                onClick={handleLogin}
              >
                LOGIN
              </Button>

              <div className="flex items-center">
                <div className="flex-1 border-t border-white/30"></div>
                <span className="px-4 text-white/70">OR</span>
                <div className="flex-1 border-t border-white/30"></div>
              </div>

              <div className="flex justify-center space-x-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-16 h-16 rounded-full bg-black/20 border-purple-400/30 hover:bg-black/30 backdrop-blur-sm"
                  onClick={() => {
                    window.google.accounts.id.prompt("" as any)
                  }}
                >
                  <svg className="w-14 h-14" viewBox="0 0 20 20">
                    <path
                      fill="#4285F4"
                      d="M18.8 10.2c0-.65-.06-1.28-.17-1.88H10v3.55h4.93c-.22 1.14-.87 2.11-1.84 2.76v2.31h2.98c1.73-1.6 2.73-3.95 2.73-6.74z"
                    />
                    <path
                      fill="#34A853"
                      d="M10 19.17c2.48 0 4.55-.82 6.07-2.22l-2.98-2.31c-.82.55-1.86.88-3.09.88-2.38 0-4.41-1.61-5.13-3.78H1.82v2.37c1.51 3.01 4.64 5.06 8.18 5.06z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M4.87 11.74c-.18-.55-.29-1.13-.29-1.74s.11-1.19.29-1.74V5.89H1.82C1.19 7.13.83 8.52.83 10s.36 2.87.99 4.11l2.38-1.85.67-.52z"
                    />
                    <path
                      fill="#EA4335"
                      d="M10 4.48c1.35 0 2.55.46 3.51 1.37l2.62-2.62C14.54 1.74 12.48.83 10 .83c-3.54 0-6.67 2.05-8.18 5.06l3.05 2.37c.72-2.17 2.75-3.78 5.13-3.78z"
                    />
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-16 h-16 rounded-full bg-black/20 border-purple-400/30 hover:bg-black/30 backdrop-blur-sm"
                >
                  <svg className="w-16 h-16" viewBox="0 0 20 20" fill="white">
                    <path d="M15.59 16.25c-.69 1.03-1.42 2.04-2.54 2.06-1.12.02-1.48-.66-2.74-.66-1.28 0-1.67.64-2.73.68-1.09.04-1.92-1.1-2.62-2.11-1.43-2.06-2.53-5.83-1.06-8.37.73-1.27 2.03-2.07 3.43-2.09 1.07-.02 2.08.72 2.74.72.65 0 1.88-.89 3.18-.76.54.03 2.06.22 3.03 1.65-.08.05-1.81 1.07-1.79 3.17.03 2.52 2.21 3.36 2.24 3.37-.03.06-.35 1.2-1.15 2.36M10.83 2.92c.61-.69 1.62-1.22 2.42-1.22.11 1.23-.33 2.85-1.17 3.87-.65.82-1.72 1.49-2.8 1.49-.14-1.25.4-2.77 1.55-4.14z" />
                  </svg>
                </Button>
              </div>

              {/* Don't have an account section */}
              <div className="text-center mt-6">
                <span className="text-white/70 text-sm">Don't have an account? </span>
                <Dialog
                  open={isRegistrationOpen}
                  onOpenChange={(open) => {
                    setIsRegistrationOpen(open)
                    if (!open) {
                      resetRegistrationModal()
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <button type="button" className="text-sm text-purple-700 hover:text-white font-medium">
                      Register now
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-slate-800 border-purple-400/30 text-white rounded-2xl shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center text-white">Create Account</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <p className="text-sm text-gray-300 text-center mb-6">
                        Fill in your details to create a new account
                      </p>
                      <form onSubmit={handleRegistration} className="space-y-4">
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="pl-12 h-12 bg-slate-900 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300"
                            required
                          />
                        </div>

                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                          <Input
                            type={showRegPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="pl-12 pr-12 h-12 bg-slate-700 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                          >
                            {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-12 pr-12 h-12 bg-slate-700 border-purple-400/30 text-white placeholder-gray-300 rounded-xl focus:border-purple-300 focus:ring-purple-300"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white h-12 text-lg font-semibold rounded-xl shadow-lg mt-6"
                          onClick={handleRegistration}
                        >
                          REGISTER
                        </Button>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </div>
        </div>
        <GoogleOneTap />
      </div>
    </div>
  )
}
