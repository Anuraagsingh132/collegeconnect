
import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  if (!isOpen) return null;
  
  const toggleForm = () => setIsLogin(!isLogin);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-fade-in">
      <div 
        className="glass w-full max-w-md rounded-2xl overflow-hidden shadow-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="w-full py-2 pl-10 pr-4 rounded-lg border border-input focus:border-primary focus:ring-1 focus:ring-primary/30 focus-ring transition-all"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full py-2 pl-10 pr-4 rounded-lg border border-input focus:border-primary focus:ring-1 focus:ring-primary/30 focus-ring transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full py-2 pl-10 pr-10 rounded-lg border border-input focus:border-primary focus:ring-1 focus:ring-primary/30 focus-ring transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            
            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>
            )}
            
            <Button className="w-full">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
            
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-input"></div>
              </div>
              <div className="relative px-3 bg-card text-xs uppercase text-muted-foreground">Or continue with</div>
            </div>
            
            <button 
              type="button" 
              className="w-full py-2.5 px-4 border border-input rounded-lg flex items-center justify-center space-x-2 hover:bg-secondary transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleForm}
                className="text-primary font-medium hover:text-primary/80 hover:underline transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
