import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePocketBase } from '@/hooks/usePocketBase';
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function AddCustomer({ onClose }) {
  const { createRecord } = usePocketBase();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    emailVisibility: true,
    password: '',
    passwordConfirm: '',
    role: 'Staff',
    wallet: 0,
    type: 'Post-Paid',
    membership: 'Standard',
    contact: ''
  });
  const [displayPassword, setDisplayPassword] = useState(false);
  const [displayConfirmPassword, setDisplayConfirmPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.email || !formData.username || !formData.password || !formData.name) {
      toast.error('Please fill all the required fields (Username, Name, Email, Password)');
      return;
    }

    // Validate username pattern
    if (!/^[a-z0-9_]+$/.test(formData.username)) {
      toast.error('Username can only contain lowercase letters, numbers, and underscores');
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Create user record in the default users collection
      const userData = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        emailVisibility: formData.emailVisibility,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        role: formData.role,
      };

      const result = await createRecord('xtreme_users', userData);
      console.log('User created:', result);

      // Create customer record
      const customerData = {
        user: result.id,
        wallet: Number(formData.wallet) || 0,
        type: formData.type,
        membership: formData.membership,
        contact: formData.contact
      };

      const customer = await createRecord('customers', customerData);
      console.log('Customer created:', customer);

      toast.success('Customer account created successfully!');

      // Reset form
      setFormData({
        username: '',
        name: '',
        email: '',
        emailVisibility: true,
        password: '',
        passwordConfirm: '',
        role: 'Staff',
        wallet: 0,
        type: 'Post-Paid',
        membership: 'Standard',
        contact: ''
      });

      // Close dialog if needed
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Error creating account: ' + (error.message || 'Please try again later'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Create New Customer</h1>
      <form onSubmit={onSubmit} className='grid grid-cols-2 gap-4'>
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            type='text'
            value={formData.username}
            onChange={(e) => setFormData({
              ...formData,
              username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
            })}
            placeholder='eg; johndoe001'
            pattern="^[a-z0-9_]+$"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Only lowercase letters, numbers, and underscores allowed
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type='text'
            value={formData.name}
            onChange={(e) => setFormData({
              ...formData,
              name: e.target.value,
            })}
            placeholder='eg; John Doe'
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contact</Label>
          <Input
            id="contact"
            type='tel'
            value={formData.contact}
            onChange={(e) => setFormData({
              ...formData,
              contact: e.target.value,
            })}
            placeholder='eg; 1234567890'
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type='email'
            value={formData.email}
            onChange={(e) => setFormData({
              ...formData,
              email: e.target.value,
            })}
            placeholder='eg; johndoe@gmail.com'
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className='flex items-center gap-2'>
            <Input
              id="password"
              type={displayPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({
                ...formData,
                password: e.target.value,
              })}
              placeholder='********'
              minLength={8}
              required
              disabled={isLoading}
            />
            {
              displayPassword ?
                <EyeOff onClick={() => setDisplayPassword(false)} className="cursor-pointer h-4 w-4" />
                : <Eye onClick={() => setDisplayPassword(true)} className="cursor-pointer h-4 w-4" />
            }
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Confirm Password *</Label>
          <div className='flex items-center gap-2'>
            <Input
              id="passwordConfirm"
              type={displayConfirmPassword ? 'text' : 'password'}
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({
                ...formData,
                passwordConfirm: e.target.value,
              })}
              placeholder='********'
              minLength={8}
              required
              disabled={isLoading}
            />
            {
              displayConfirmPassword ?
                <EyeOff onClick={() => setDisplayConfirmPassword(false)} className="cursor-pointer h-4 w-4" />
                : <Eye onClick={() => setDisplayConfirmPassword(true)} className="cursor-pointer h-4 w-4" />
            }
          </div>
        </div>

        <div className="space-y-2">
          <Label>Customer Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
            disabled={isLoading}
          >
            <SelectTrigger className={'w-full'}>
              <SelectValue placeholder="Customer Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Pre-paid'>Pre-paid</SelectItem>
              <SelectItem value='Post-Paid'>Post-Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Membership</Label>
          <Select
            value={formData.membership}
            onValueChange={(value) => setFormData({ ...formData, membership: value })}
            disabled={isLoading}
          >
            <SelectTrigger className={'w-full'}>
              <SelectValue placeholder="Select Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Standard'>Standard</SelectItem>
              <SelectItem value='Member'>Member</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wallet">Initial Wallet Amount</Label>
          <Input
            id="wallet"
            type='number'
            value={formData.wallet}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                wallet: value === '' ? 0 : Number(value)
              });
            }}
            placeholder='eg; 100'
            min="0"
            step="0.01"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Account Type</Label>
          <Input
            id="role"
            type='text'
            value="Customer (Staff Role)"
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Customers are created with Staff role for system compatibility
          </p>
        </div>

        <div className="col-span-2 pt-4 flex gap-2">
          <Button
            type='button'
            variant="outline"
            className='flex-1'
            onClick={() => onClose && onClose()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            className='flex-1'
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </section>
  );
}
