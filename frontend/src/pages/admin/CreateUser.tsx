import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  Shield,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';
import { createUser } from '../../lib/api';
import { createUserSchema, type CreateUserFormData } from '../../lib/schemas';
import { getErrorMessage } from '../../lib/api-error';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PageLayout } from '../../components/layout/PageLayout';
import type { CreateUserRequest } from '../../types';

const roleOptions = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

export function CreateUserPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      department: '',
      phone_number: '',
      role: 'viewer',
      status: 'active',
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      return await createUser(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      navigate('/admin/users');
    },
    onError: (err: unknown) => {
      setError('root', { message: getErrorMessage(err) });
    },
  });

  // Submit form
  const onSubmit = (data: CreateUserFormData) => {
    const userData: CreateUserRequest = {
      email: data.email.trim(),
      password: data.password,
      first_name: data.first_name?.trim() || undefined,
      last_name: data.last_name?.trim() || undefined,
      department: data.department?.trim() || undefined,
      phone_number: data.phone_number?.trim() || undefined,
      role: data.role,
      status: data.status,
    };

    createMutation.mutate(userData);
  };

  return (
    <PageLayout
      title="Create User"
      subtitle="Add a new user to the system"
      icon={<UserPlus className="w-6 h-6 text-sky-600" />}
      backTo="/admin/users"
      maxWidth="2xl"
    >
      {/* Error Alert */}
      {errors.root && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{errors.root.message}</p>
          <button onClick={() => setError('root', {})} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Account Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-400" />
            Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="user@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                error={errors.password?.message}
                {...register('password')}
              />
              <Lock className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            Profile Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              placeholder="John"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              label="Last Name"
              type="text"
              placeholder="Doe"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
            <div className="relative">
              <Input
                label="Department"
                type="text"
                placeholder="Engineering"
                error={errors.department?.message}
                {...register('department')}
              />
              <Briefcase className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
            </div>
            <div className="relative">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 234 567 8900"
                error={errors.phone_number?.message}
                {...register('phone_number')}
              />
              <Phone className="absolute right-3 top-[38px] w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Role & Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" />
            Role & Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Role"
              options={roleOptions}
              error={errors.role?.message}
              {...register('role')}
            />
            <Select
              label="Status"
              options={statusOptions}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/admin/users')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={createMutation.isPending}
            leftIcon={!createMutation.isPending ? <Check className="w-4 h-4" /> : undefined}
          >
            Create User
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}

export default CreateUserPage;
