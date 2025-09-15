import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  MapPin,
  
  
  Edit,
  Eye,
  ChevronRight,
  ChevronLeft,
  XCircle,
  EyeOff,
  Lock,
  CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Container from '../components/layout/Container';
import useBookingStore from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { message } from 'antd';

const profileSchema = z
  .object({
    name: z
      .string()
      .optional()
      .refine((val) => {
        
        if (!val || val.trim().length === 0) {
          return true;
        }
        
        return val.length >= 2 && val.length <= 50;
      }, "Name must be at least 2 characters and maximum 50 characters"),
    password: z
      .string()
      .optional()
      .refine((val) => {
        
        if (!val || val.trim().length === 0) {
          return true;
        }
        
        return val.length >= 8 &&
          /[A-Z]/.test(val) &&
          /[a-z]/.test(val) &&
          /[0-9]/.test(val);
      }, "Password must be at least 8 characters with uppercase, lowercase, and number"),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => {
    
    if (data.password && data.password.trim().length > 0) {
      return data.password === data.confirmPassword;
    }
    return true; 
  });

type ProfileFormData = z.infer<typeof profileSchema>;

export const UserDashboard: React.FC = () => {
  const { user, updateProfile, isMutating, error, clearError } = useAuthStore()
  const { fetchUserBookings, userBookings, pagination, isLoading , error:bookingError, clearError:clearBookingError } = useBookingStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const createBookingQuery = useCallback(() => ({
    page: currentPage,
    limit: 10
  }), [currentPage]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchUserBookings(createBookingQuery());
    }
  }, [fetchUserBookings, createBookingQuery, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(()=>{
    clearBookingError()
  },[clearBookingError])

  useEffect(()=>{
    if(bookingError){
      message.error(bookingError)
      clearBookingError()
    }
  },[bookingError])
  useEffect(()=>{
    if(error){
      message.error(error)
      clearError()
    }
  },[error])

  const { register, watch, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",  
      password: "",
      confirmPassword: ""
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: ProfileFormData) => {
    const payload: Record<string, string> = {};

    if (data.name && data.name.trim().length > 0 && data.name !== user?.name) {
      payload.name = data.name;
    }

    
    if (data.password && data.password.trim().length > 0) {
      if (data.password !== data.confirmPassword) {
        message.error("Passwords must match before submitting");
        return;
      }
      payload.password = data.password;
    }

    
    if (Object.keys(payload).length === 0) {
      message.info("No changes made");
      return;
    }

    await updateProfile(payload);

    if (!useAuthStore.getState().error) {
      message.success("Profile updated successfully!");
      reset({ name: "", password: "", confirmPassword: "" });
      setIsEditing(false);
    }
  }

  const password = watch("password")
  const confirmPassword = watch("confirmPassword")

  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(false);
    }
  }, [password, confirmPassword]);

  
  const isFormValid = () => {
    const currentName = watch("name");
    const currentPassword = watch("password");

    
    const hasNameChange = currentName && currentName.trim().length > 0 && currentName !== user?.name;
    const hasPasswordChange = currentPassword && currentPassword.trim().length > 0;

    
    if (!hasNameChange && !hasPasswordChange) {
      return false;
    }

    
    if (hasPasswordChange) {
      return passwordsMatch;
    }

    return true;
  };

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.userBookings.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };



  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard</h1>
          <p className="text-neutral-600">Manage your profile and bookings</p>
        </div>

        <div className="border-b border-neutral-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              ...(user?.role !== "ADMIN"
                ? [{ id: "bookings", label: "My Bookings", icon: Calendar }]
                : []),
              
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-8">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Profile Information
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isMutating}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Name</label>
                    <p className="text-lg text-neutral-900">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Email</label>
                    <p className="text-lg text-neutral-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Role</label>
                    <p className="text-lg text-neutral-900 capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                </div>
              ) : (
                
                <div className="max-w-md">
                 
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    <Input
                      label="Full Name (leave blank to keep current)"
                      {...register("name")}
                      error={errors.name?.message}
                      leftIcon={User}
                      placeholder="Enter your name"
                      disabled={isMutating}
                    />

                    {}
                    <div className="relative">
                      <Input
                        label="New Password (leave blank to keep current)"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        error={errors.password?.message}
                        leftIcon={Lock}
                        placeholder="Enter new password"
                        disabled={isMutating}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {}
                    {password && (
                      <div className="relative">
                        <Input
                          label="Confirm Password"
                          type={showConfirmPassword ? "text" : "password"}
                          {...register("confirmPassword", {
                            onBlur: () => setConfirmPasswordTouched(true),
                          })}
                          error={errors.confirmPassword?.message}
                          leftIcon={Lock}
                          placeholder="Confirm your password"
                          disabled={isMutating}
                          className={`${confirmPasswordTouched && confirmPassword
                            ? passwordsMatch
                              ? "border-green-300 focus:border-green-500"
                              : "border-red-300 focus:border-red-500"
                            : ""
                            }`}
                        />

                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-10 top-[38px] text-neutral-400 hover:text-neutral-600 transition-colors"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        {confirmPasswordTouched && confirmPassword && (
                          <div className="absolute right-3 top-[38px]">
                            {passwordsMatch ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {confirmPasswordTouched && confirmPassword && (
                      <div
                        className={`text-sm transition-colors ${passwordsMatch ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {passwordsMatch ? (
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Passwords match!
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            Passwords don't match
                          </span>
                        )}
                      </div>
                    )}

                    {/* Password Requirements */}
                    {password && (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        <h4 className="font-medium text-neutral-900 mb-2">
                          Password Requirements:
                        </h4>
                        <ul className="text-sm text-neutral-600 space-y-1">
                          <li>• Minimum 8 characters</li>
                          <li>• At least one uppercase letter (A-Z)</li>
                          <li>• At least one lowercase letter (a-z)</li>
                          <li>• At least one number (0-9)</li>
                        </ul>
                      </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        className="flex-1"
                        size="md"
                        loading={isMutating}
                        disabled={isMutating || !isFormValid()}
                      >
                        Save Changes
                      </Button>
                      {/* Show message when no fields are filled */}
                      {!isFormValid() && !isMutating && (
                        <p className="text-sm text-neutral-500 text-center">
                          Please fill in at least one field (name or password) to continue
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => {
                          setIsEditing(false);
                          reset({
                            name: user?.name || "",
                            password: "",
                            confirmPassword: ""
                          });
                          setPasswordsMatch(false);
                          setConfirmPasswordTouched(false);
                        }}
                        disabled={isMutating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-neutral-900">My Bookings</h2>
                <div className="text-sm text-neutral-500">
                  {userBookings.length} booking{userBookings.length !== 1 ? 's' : ''}
                </div>
              </div>

              {userBookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
                  <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No bookings yet</h3>
                  <p className="text-neutral-600 mb-4">
                    Start exploring events and make your first booking!
                  </p>
                  <Button onClick={() => navigate('/events')}>Browse Events</Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {userBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="h-48 bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                          {booking.event?.images && typeof booking.event.images === 'string' ? (
                            <img
                              src={booking.event.images}
                              alt={booking.event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Calendar className="w-12 h-12 text-primary-600" />
                          )}
                        </div>

                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            {booking.event?.title}
                          </h3>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-neutral-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {booking.event ?
                                  (new Date(booking.event.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })) :
                                  "Date not available"
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-neutral-600">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.event?.city}, {booking.event?.state}</span>
                            </div>
                            <div className="text-sm text-neutral-500">
                              Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/events/${booking.event?.id}`)}
                            >
                              
                              View Details
                            </Button> */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/booking/${booking.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Booking Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pagination.userBookings.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mt-6">
                      <div className="text-sm text-neutral-700">
                        Page {currentPage} of {pagination.userBookings.totalPages} • {pagination.userBookings.totalItems} total bookings
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || isLoading}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>

                        <div className="hidden sm:flex space-x-1">
                          {getPageNumbers().map((pageNum) => (
                            <Button
                              key={pageNum}
                              variant={pageNum === currentPage ? "primary" : "ghost"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isLoading}
                              className="min-w-10"
                            >
                              {pageNum}
                            </Button>
                          ))}
                        </div>

                        <div className="sm:hidden text-sm text-neutral-600">
                          {currentPage} / {pagination.userBookings.totalPages}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === pagination.userBookings.totalPages || isLoading}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {/* {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Account Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">Email Notifications</p>
                        <p className="text-sm text-neutral-600">Receive updates about your bookings</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">SMS Notifications</p>
                        <p className="text-sm text-neutral-600">Get text messages for important updates</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-primary-600" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Privacy</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">Profile Visibility</p>
                        <p className="text-sm text-neutral-600">Allow organizers to see your profile</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Button variant="danger" size="lg" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </Container>
  );
}; 