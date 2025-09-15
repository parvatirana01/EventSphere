import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Calendar, MapPin, Upload, X, Globe } from 'lucide-react';
import useEventStore from '../../store/eventStore';
import { isDevelopment } from '../../config/environment';
import { LocationMap } from './LocationMap';
import { AddressData } from '../../services/geocodingService';
import { geocodingService } from '../../services/geocodingService';
import { message } from 'antd';

const createEventFormSchema = z.object({
  title: z.string()
    .min(3, "Title must have at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  description: z.string()
    .min(10, "Description must have at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .trim(),
  date: z
    .string()
    .min(1, "Date is required")
    .refine(date => new Date(date) > new Date(), "Event date must be in future"),
  longitude: z.number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  latitude: z.number()
    .min(-85.05112878, "Invalid latitude")
    .max(85.05112878, "Invalid latitude"),
  address: z.string().min(5, "Complete address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(3, "Postal code is required"),
});




type CreateEventFormData = z.infer<typeof createEventFormSchema>;  
type CompleteSubmissionData = CreateEventFormData & { images: File[] };
interface CreateEventFormProps {
  onSubmit: (data: CompleteSubmissionData) => Promise<void>;
  onCancel: () => void;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSubmit, onCancel }) => {
  const [showMap, setShowMap] = useState<boolean>(false)
  const { isMutating, error, clearError } = useEventStore()
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    clearErrors, 
    watch
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      longitude: 0,
      latitude: 0,
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    }
  });
  useEffect(() => {
    clearError()
  }, [clearError])
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError()
    }
  }, [error])

  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);



  const handleFormSubmit = async (data: CreateEventFormData) => {
    try {
      const completeData: CompleteSubmissionData = {
        ...data,
        images: selectedImages
      }

      await onSubmit(completeData);
    } catch (error) {
      if (isDevelopment())
        console.error('Event creation failed:', error);

    };
  }
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newUrls = files.map(file => URL.createObjectURL(file));

    setSelectedImages(prev => [...prev, ...files]);
    setImageUrls(prev => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const handleMapLocationSelect = (coords: { lat: number; lng: number }) => {
    console.log('Map coordinates selected:', coords);

    
    setValue('latitude', coords.lat);
    setValue('longitude', coords.lng);

    trigger(['latitude', 'longitude']);
  }

  const handleAddressSelect = (addressData: AddressData) => {
    console.log('Address received from map:', addressData);

    
    setValue('address', addressData.address);
    setValue('city', addressData.city);
    setValue('state', addressData.state);
    setValue('country', addressData.country);
    setValue('postalCode', addressData.postalCode);

    
    clearErrors(['address', 'city', 'state', 'country', 'postalCode']);

   

    
  };

  const handleLocationSelect = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          
          setValue('latitude', lat);
          setValue('longitude', lng);

          
          try {
            const addressData = await geocodingService.reverseGeocode(lat, lng);
            if (addressData) {
              
              setValue('address', addressData.address);
              setValue('city', addressData.city);
              setValue('state', addressData.state);
              setValue('country', addressData.country);
              setValue('postalCode', addressData.postalCode);



            }
          } catch (error) {
            console.error('Failed to get address from current location:', error);
          }
        },
        () => {
          
          setValue('latitude', 28.6139);
          setValue('longitude', 77.2088);
        }
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Create New Event</h2>
        <p className="text-neutral-600">Fill in the details below to create your event</p>
      </div>

     

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Event Title"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Enter event title (3-100 characters)"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-error-500' : 'border-neutral-300'
                }`}
              placeholder="Describe your event (10-1000 characters)"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Input
              label="Event Date & Time"
              type="datetime-local"
              {...register('date')}
              error={errors.date?.message}
              leftIcon={Calendar}
              required
            />
          </div>
        </div>

        
        <div className="border-t pt-6">

          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location Details
          </h3>

          
          <div className="mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="w-full"
            >
              <Globe className="w-4 h-4 mr-2" />
              {showMap ? 'Hide Map' : 'Show Map & Select Location'}
            </Button>
          </div>
          {showMap && (
            <div className="mb-6 overflow-hidden">
              <LocationMap
                className="h-96 w-full"
                onLocationSelect={handleMapLocationSelect}
                coords={{
                  lat: watch('latitude') || 28.6139,
                  lng: watch('longitude') || 77.2088
                }}
                initialCoords={{
                  lat: 28.6139,
                  lng: 77.2088
                }}
                onAddressSelect={handleAddressSelect}
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Address"
                {...register('address', {
                  onChange: () => {
                    
                    if (errors.address) {
                      clearErrors('address');
                    }
                  }
                })}
                value={watch('address')} 
                error={errors.address?.message}
                placeholder="Complete street address"
                required
              />
            </div>

            <div>
              <Input
                label="City"
                {...register('city', {
                  onChange: () => {
                    if (errors.city) {
                      clearErrors('city');
                    }
                  }
                })}
                error={errors.city?.message}
                placeholder="City name"
                required
              />
            </div>

            <div>
              <Input
                label="State/Province"
                {...register('state', {
                  onChange: () => {
                    if (errors.state) {
                      clearErrors('state');
                    }
                  }
                })}
                error={errors.state?.message}
                placeholder="State or province"
                required
              />
            </div>

            <div>
              <Input
                label="Country"
                {...register('country', {
                  onChange: () => {
                    if (errors.country) {
                      clearErrors('country');
                    }
                  }
                })}
                error={errors.country?.message}
                placeholder="Country name"
                required
              />
            </div>

            <div>
              <Input
                label="Postal Code"
                {...register('postalCode', {
                  onChange: () => {
                    if (errors.postalCode) {
                      clearErrors('postalCode');
                    }
                  }
                })}
                error={errors.postalCode?.message}
                placeholder="Postal/ZIP code"
                required
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleLocationSelect}
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </Button>
            </div>
          </div>

          
          <div className="hidden">
            <Input
              type="number"
              step="any"
              {...register('latitude', { valueAsNumber: true })}
              error={errors.latitude?.message}
            />
            <Input
              type="number"
              step="any"
              {...register('longitude', { valueAsNumber: true })}
              error={errors.longitude?.message}
            />
          </div>
        </div>

        {}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Event Images
          </h3>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isMutating}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-600">Click to upload images</p>
                <p className="text-sm text-neutral-500">PNG, JPG, JPEG up to 5MB each</p>
              </label>
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((_, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrls[index]} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 hover:bg-error-600"
                      disabled={isMutating} 
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isMutating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isMutating}
            disabled={isMutating}
          >
            {isMutating ? (
              <>
                <LoadingSpinner size="sm" />
                Creating Event...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}; 