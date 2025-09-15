import React, {  useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Container from '../components/layout/Container';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { message } from 'antd'
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { useNavigate ,useLocation} from 'react-router-dom';


const loginSchema = z.object({
    email: z
        .email("Invalid email format")
        .min(1, "Email is required"),
    password: z.string()
        .min(8, "Minimum 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });
    useEffect(() => {
        clearError()
    }, []);

    useEffect(()=>{
        if(error){
            message.error(error)
            clearError()
        }
    },[error])

    useEffect(() => {
        if (isAuthenticated && user ) {
            
            message.success(`Welcome back, ${user.name}!`);
            navigate(location.state?.from ||'/');
        }
    }, [isAuthenticated, user, navigate]);



    const handleFormSubmit = async (data: LoginFormData) => {
        await login(data)
    };

    return (
        <Container>
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-neutral-600">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
                        

                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                            <Input
                                label="Email Address"
                                type="email"
                                {...register('email')}
                                error={errors.email?.message}
                                leftIcon={Mail}
                                placeholder="Enter your email address"
                                required
                            />

                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    error={errors.password?.message}
                                    leftIcon={Lock}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                               
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-neutral-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};