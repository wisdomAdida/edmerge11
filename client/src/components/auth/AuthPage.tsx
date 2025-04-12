import { useState, useEffect } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export const AuthPage = () => {
  const [isLoginForm, setIsLoginForm] = useState(true);
  
  // Read URL params to determine if we should show signup form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signup') === 'true') {
      setIsLoginForm(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Login/Register Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 lg:p-16">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8">
          <div className="mb-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground text-3xl font-bold">EM</span>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Welcome to EdMerge</h1>
            <p className="text-muted-foreground text-lg">AI-powered learning platform by Afrimerge</p>
          </div>

          {isLoginForm ? (
            <LoginForm onSwitchToSignup={() => setIsLoginForm(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLoginForm(true)} />
          )}
        </div>
      </div>
      
      {/* Image/Graphic Side */}
      <div className="hidden lg:block w-1/2 bg-cover bg-center relative" 
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1603387538036-461bbd9920f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80')"}}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/90 flex flex-col items-center justify-center p-16 text-primary-foreground">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Transform Your Learning Experience with AI</h2>
            <p className="text-xl mb-10 leading-relaxed">EdMerge brings together students, tutors, mentors, and researchers on one powerful platform powered by advanced AI.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform transition-transform hover:scale-105">
                <i className="ri-ai-generate block text-4xl mb-4 text-white"></i>
                <h3 className="text-xl font-bold mb-2">AI Tutoring</h3>
                <p className="text-base text-white">Personalized learning assistance available 24/7</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform transition-transform hover:scale-105">
                <i className="ri-team-line block text-4xl mb-4 text-white"></i>
                <h3 className="text-xl font-bold mb-2">Expert Mentors</h3>
                <p className="text-base text-white">Connect with leading professionals in your field</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg transform transition-transform hover:scale-105">
                <i className="ri-graduation-cap-line block text-4xl mb-4 text-white"></i>
                <h3 className="text-xl font-bold mb-2">Custom Paths</h3>
                <p className="text-base text-white">Learning journeys tailored to your goals</p>
              </div>
            </div>
            
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-white/80 to-white/90 p-1 rounded-full shadow-lg">
              <span className="bg-primary text-primary-foreground text-base font-bold px-8 py-3 rounded-full">Join 50,000+ learners worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
