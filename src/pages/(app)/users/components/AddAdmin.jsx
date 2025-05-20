import React from 'react'
import { Eye, EyeOff } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { usePocketBase } from '@/hooks/usePocketBase';
import { toast } from 'sonner';

export default function AddAdmin({ onClose }) {
  const { createRecord } = usePocketBase();

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    emailVisibility: true,
    password: '',
    passwordConfirm: '',
    role: 'Admin',
  });
  const [displayPassword, setDisplayPassword] = useState(false);
  const [displayConfirmPassword, setDisplayConfirmPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Password validation - only if password field is not empty
      if (formData.password) {
        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters');
          return;
        }

        if (formData.password !== formData.passwordConfirm) {
          toast.error('Passwords do not match');
          return;
        }
      }

      const result = await createRecord('xtreme_users', formData);
      console.log(result);
      toast.success('Admin account created successfully!!!');

      // Reset form
      setFormData({
        username: '',
        name: '',
        email: '',
        emailVisibility: true,
        password: '',
        passwordConfirm: '',
        role: 'Admin',
      });

      // Close dialog if needed
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      toast.error('Error creating account: ' + (error.message || 'Please try again later'));
    }
  }

  return (
    <section className='p-10'>
      <h1 className='text-2xl font-bold'>Create New Admin</h1>
      <form className='grid gap-4 pt-10'>
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
          <Label>Email</Label>
          <Input
            type='email'
            value={formData.email}
            onChange={(e) => setFormData({
              ...formData,
              email: e.target.value,
            })}
            placeholder='eg; johndoe@gmail.com'
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
            />
            {
              displayPassword ?
                <EyeOff onClick={() => setDisplayPassword(false)} />
                : <Eye onClick={() => setDisplayPassword(true)} />
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
            />
            {
              displayConfirmPassword ?
                <EyeOff onClick={() => setDisplayConfirmPassword(false)} />
                : <Eye onClick={() => setDisplayConfirmPassword(true)} />
            }
          </div>
        </div>
        <div className="pt-2 w-full">
          <Button
            type='submit'
            className='w-full'
            onClick={onSubmit}
          >
            Create Admin
          </Button>
        </div>
      </form>
    </section>
  )
}
