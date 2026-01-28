import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '@/lib/api';
import { authAPI } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Helper function to decode JWT tokens
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_BASE_URL = 'https://api.hyperx.llc';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to get user details with existing token
        // This will automatically handle token refresh if needed via apiRequest
        const userData = await authAPI.getUser();
        console.log('User data received from API:', userData);
        
        // Handle different possible response structures
        let userId, userEmail;
        
        if (userData && userData.user) {
          // If user data is nested under 'user' key
          userId = userData.user.id;
          userEmail = userData.user.email;
        } else if (userData && userData.id && userData.email) {
          // If user data is at the root level
          userId = userData.id;
          userEmail = userData.email;
        } else if (userData && userData.data && userData.data.id && userData.data.email) {
          // If user data is nested under 'data' key
          userId = userData.data.id;
          userEmail = userData.data.email;
        }
        
        if (userId && userEmail) {
          setUser({
            id: userId,
            email: userEmail,
          });
          console.log('Session re-established for user:', userEmail);
          
          // Check PIN status for existing session
          try {
            const pinStatusResponse = await authAPI.getPinStatus(userId);
            console.log('PIN status response for existing session:', pinStatusResponse);
            
            if (pinStatusResponse && pinStatusResponse.success && pinStatusResponse.data && pinStatusResponse.data.hasPin) {
              // User has PIN, they can access the dashboard
              console.log('User has PIN, allowing access to dashboard');
            } else {
              // User doesn't have PIN, redirect to PIN setup
              console.log('User does not have PIN, redirecting to PIN setup');
              navigate('/setup-pin');
            }
          } catch (pinError) {
            console.error('PIN status check failed for existing session:', pinError);
            // If PIN status check fails, assume PIN setup is needed
            navigate('/setup-pin');
          }
        } else {
          console.log('Invalid user data structure:', userData);
          // If user data is incomplete, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('Failed to re-establish session:', error);
        
        // Only clear tokens if it's an authentication error
        // Don't clear on network errors to avoid losing valid sessions
        if (error.message && (error.message.includes('401') || error.message.includes('unauthorized'))) {
          console.log('Authentication error detected, clearing tokens');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } else {
          console.log('Network or other error, keeping tokens for retry');
          // Notify user about connection issues
          toast({
            title: "Connection Error",
            description: "Unable to connect to the authentication service. Please check your internet connection.",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token from the response
        const token = data.token;
        localStorage.setItem('accessToken', token);
        
        // Store refresh token if provided
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        // Decode the JWT to extract user information
        const decodedPayload = decodeJwt(token);
        
        if (decodedPayload && decodedPayload.sub && decodedPayload.email) {
          const userObject = {
            id: decodedPayload.sub, // 'sub' is typically the user ID in JWT
            email: decodedPayload.email, // 'email' is also in your JWT payload
          };
          setUser(userObject);

          // Check PIN status after successful login
          try {
            const pinStatusResponse = await authAPI.getPinStatus(userObject.id);
            console.log('PIN status response:', pinStatusResponse);
            
            if (pinStatusResponse && pinStatusResponse.success && pinStatusResponse.data && pinStatusResponse.data.hasPin) {
              // User has PIN, proceed to dashboard
              toast({ 
                title: "Login Successful", 
                description: `Welcome back, ${userObject.email}!` 
              });
              navigate('/');
            } else {
              // User doesn't have PIN, redirect to PIN setup
              toast({ 
                title: "PIN Setup Required", 
                description: "Please create a payment PIN to secure your transactions." 
              });
              navigate('/setup-pin');
            }
          } catch (pinError) {
            console.error('PIN status check failed:', pinError);
            // If PIN status check fails, assume PIN setup is needed
            toast({ 
              title: "PIN Setup Required", 
              description: "Please create a payment PIN to secure your transactions." 
            });
            navigate('/setup-pin');
          }
        } else {
          // Fallback if token decoding fails or essential info is missing
          console.error('Failed to decode token or missing user information');
          toast({ 
            title: "Login Warning", 
            description: "Login successful but could not retrieve full user details.", 
            variant: "destructive" 
          });
          // Still navigate but user state won't be properly set
          navigate('/');
        }
      } else {
        // Check if the error is specifically about missing PIN
        const errorMessage = data.message || "";
        if (errorMessage.toLowerCase().includes("pin") || errorMessage.toLowerCase().includes("4-digit") || errorMessage.toLowerCase().includes("4 digit")) {
          // User is authenticated but needs to create a PIN
          console.log('Login failed due to missing PIN, attempting to extract user info');
          
          // Try to get token from response even though login "failed"
          const token = data.token || data.accessToken;
          if (token) {
            localStorage.setItem('accessToken', token);
            
            // Store refresh token if provided
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            
            // Decode the JWT to extract user information
            const decodedPayload = decodeJwt(token);
            
            if (decodedPayload && decodedPayload.sub && decodedPayload.email) {
              const userObject = {
                id: decodedPayload.sub,
                email: decodedPayload.email,
              };
              setUser(userObject);
              
              toast({ 
                title: "PIN Setup Required", 
                description: "Please create a 4-digit PIN to secure your account." 
              });
              navigate('/setup-pin');
            } else {
              // If we can't decode the token, show the original error
              toast({ 
                title: "Login Failed", 
                description: errorMessage, 
                variant: "destructive" 
              });
            }
          } else {
            // No token provided, show the original error
            toast({ 
              title: "Login Failed", 
              description: errorMessage, 
              variant: "destructive" 
            });
          }
        } else {
          // Generic login failure (wrong credentials, etc.)
          toast({ 
            title: "Login Failed", 
            description: errorMessage || "Invalid email or password.", 
            variant: "destructive" 
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({ 
        title: "Login Failed", 
        description: "Network error. Please try again.", 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  const signup = async (email, password) => {
    try {
      console.log('Attempting signup with:', { email, password: '***' });
      console.log('API URL:', `${API_BASE_URL}/v1/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Signup response status:', response.status);
      console.log('Signup response headers:', response.headers);
      
      const data = await response.json();
      console.log('Signup response data:', data);

      if (response.ok) {
        toast({ 
          title: "Signup Successful", 
          description: "Please check your email to verify your account." 
        });
        return true;
      } else {
        toast({ 
          title: "Signup Failed", 
          description: data.message || "Please provide valid email and password.", 
          variant: "destructive" 
        });
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({ 
        title: "Signup Failed", 
        description: `Network error: ${error.message}. Please try again.`, 
        variant: "destructive" 
      });
      return false;
    }
  };

  const logout = async () => {
    // Clear local storage and state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    
    toast({ 
      title: "Logged Out", 
      description: "You have been successfully logged out." 
    });
    navigate('/login');
  };


  const verifyEmail = async (email, otp) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens if provided
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          // Set user data
          setUser(data.user || data);
        }
        
        toast({ 
          title: "Email Verified", 
          description: "Your email has been successfully verified!" 
        });
        setLoading(false);
        navigate('/');
        return true;
      } else {
        toast({ 
          title: "Verification Failed", 
          description: data.message || "Invalid verification code.", 
          variant: "destructive" 
        });
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Email verification error:', error);
      toast({ 
        title: "Verification Failed", 
        description: "Network error. Please try again.", 
        variant: "destructive" 
      });
      setLoading(false);
      return false;
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your email for the verification code."
        });
        return true;
      } else {
        toast({
          title: "Failed to Send",
          description: data.message || "Could not send verification email.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: "Failed to Send",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const submitBiodata = async (email, biodataFormData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const decodedPayload = decodeJwt(token);
      if (!decodedPayload || !decodedPayload.sub) {
        throw new Error('Invalid authentication token');
      }

      const userId = decodedPayload.sub;

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: userId,
            email: email,
            first_name: biodataFormData.firstName.trim(),
            last_name: biodataFormData.lastName.trim(),
            identity_type: biodataFormData.identityType,
            identity_number: biodataFormData.identityNumber
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to save biodata');
      }

      console.log('Biodata saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Submit biodata error:', error);
      toast({
        title: "Failed to Save",
        description: error.message || "Could not save your information. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    verifyEmail,
    resendVerification,
    submitBiodata,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
