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

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    emailVisibility: true,
    password: '',
    passwordConfirm: '',
    role: 'User',
    wallet: '',
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
      toast.warning('Please fill all the required fields');
      return; // Stop execution if validation fails
    }

    // Validate password confirmation
    if (formData.password !== formData.passwordConfirm) {
      toast.warning('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      // Create user record
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
        wallet: formData.wallet === '' ? 0 : Number(formData.wallet),
        type: formData.type,
        membership: formData.membership,
        contact: formData.contact
      };

      const customer = await createRecord('customers', customerData);
      console.log('Customer created:', customer);

      toast.success('Customer account created successfully!!!');

      // Reset form
      setFormData({
        username: '',
        name: '',
        email: '',
        emailVisibility: true,
        password: '',
        passwordConfirm: '',
        role: 'User',
        wallet: '',
        type: 'Post-Paid',
        membership: 'Standard',
        contact: ''
      });

      // Close dialog if needed
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      toast.error('Error creating account: ' + (error.message || 'Please try again later'));
    }
  };

  return (
    <section className='p-10'>
      <h1 className='text-2xl font-bold'>Create New Customer</h1>
      <form className='grid grid-cols-2 gap-4 pt-10'>
        <div className="space-y-4">
          <Label>Username</Label>
          <Input
            type='text'
            value={formData.username}
            onChange={(e) => setFormData({
              ...formData,
              username: e.target.value,
            })}
            placeholder='eg; johndoe001'
            pattern="^[a-z0-9_]+$"
            required
          />
        </div>
        <div className="space-y-4">
          <Label>Full Name</Label>
          <Input
            type='text'
            value={formData.name}
            onChange={(e) => setFormData({
              ...formData,
              name: e.target.value,
            })}
            placeholder='eg; John Doe'
            required
          />
        </div>
        <div className="space-y-4">
          <Label>Contact</Label>
          <Input
            type='text'
            value={formData.contact}
            onChange={(e) => setFormData({
              ...formData,
              contact: e.target.value,
            })}
            placeholder='eg; 1234567890'
            maxLength={10}
            minLength={10}
            required
          />
        </div>
        <div className="space-y-4">
          <Label>Email</Label>
          <Input
            type='email'
            value={formData.email}
            onChange={(e) => setFormData({
              ...formData,
              email: e.target.value,
            })}
            placeholder='eg; johndoe@gmail.com'
            required
          />
        </div>
        <div className="space-y-4">
          <Label>Password</Label>
          <div className='flex items-center gap-2'>
            <Input
              type={displayPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({
                ...formData,
                password: e.target.value,
              })}
              placeholder='********'
              minLength={8}
              required
            />
            {
              displayPassword ?
                <EyeOff onClick={() => setDisplayPassword(false)} className="cursor-pointer" />
                : <Eye onClick={() => setDisplayPassword(true)} className="cursor-pointer" />
            }
          </div>
        </div>
        <div className="space-y-4">
          <Label>Confirm Password</Label>
          <div className='flex items-center gap-2'>
            <Input
              type={displayConfirmPassword ? 'text' : 'password'}
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({
                ...formData,
                passwordConfirm: e.target.value,
              })}
              placeholder='********'
              minLength={8}
              required
            />
            {
              displayConfirmPassword ?
                <EyeOff onClick={() => setDisplayConfirmPassword(false)} className="cursor-pointer" />
                : <Eye onClick={() => setDisplayConfirmPassword(true)} className="cursor-pointer" />
            }
          </div>
        </div>

        <div className="space-y-4">
          <Label>Customer Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className={'w-full'}>
              <SelectValue placeholder="Customer Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Pre-paid'>Pre-paid</SelectItem>
              <SelectItem value='Post-Paid'>Post-paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Membership</Label>
          <Select
            value={formData.membership}
            onValueChange={(value) => setFormData({ ...formData, membership: value })}
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

        <div className="space-y-4">
          <Label>Wallet</Label>
          <Input
            type='text'
            value={formData.wallet}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || !isNaN(value)) {
                setFormData({
                  ...formData,
                  wallet: value
                });
              }
            }}
            placeholder='eg; 100'
          />
        </div>

        <div className="col-span-2 pt-4">
          <Button
            type='submit'
            className='w-full'
            onClick={onSubmit}
          >
            Create Customer
          </Button>
        </div>
      </form>
    </section>
  );
}
