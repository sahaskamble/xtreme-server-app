import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Mail, Phone, CreditCard } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import pb from '@/lib/pocketbase/pb';

export default function AddCustomerDialog({ open, onOpenChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      role: 'User',
      wallet: 0,
      type: 'Post-Paid',
      membership: 'Standard',
      contact: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      // Validate password confirmation
      if (data.password !== data.passwordConfirm) {
        toast.error("Passwords don't match");
        return;
      }

      // Create user first
      const userData = {
        username: data.username,
        name: data.name, // Store name in user record
        email: data.email,
        emailVisibility: true,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        role: data.role
      };

      const createdUser = await pb.collection('users').create(userData);

      // Create customer record
      const customerData = {
        user: createdUser.id,
        wallet: parseFloat(data.wallet) || 0,
        type: data.type,
        membership: data.membership,
        contact: data.contact
      };

      await pb.collection('customers').create(customerData);

      toast.success("Customer added successfully!");
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating customer:', error);
      
      // Handle specific error messages
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.username) {
          toast.error("Username already exists");
        } else if (errorData.email) {
          toast.error("Email already exists");
        } else {
          toast.error("Failed to create customer. Please try again.");
        }
      } else {
        toast.error("Failed to create customer. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Customer
          </DialogTitle>
          <DialogDescription>
            Create a new customer account with login credentials
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Personal Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    {...form.register('name', { required: 'Full name is required' })}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    placeholder="Enter contact number"
                    {...form.register('contact')}
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Account Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    {...form.register('username', { required: 'Username is required' })}
                  />
                  {form.formState.errors.username && (
                    <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...form.register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      {...form.register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Confirm Password *</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="Confirm password"
                    {...form.register('passwordConfirm', { required: 'Please confirm password' })}
                  />
                  {form.formState.errors.passwordConfirm && (
                    <p className="text-sm text-destructive">{form.formState.errors.passwordConfirm.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Customer Settings</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Payment Type</Label>
                  <Select
                    value={form.watch('type')}
                    onValueChange={(value) => form.setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-Paid">Pre-Paid</SelectItem>
                      <SelectItem value="Post-Paid">Post-Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="membership">Membership</Label>
                  <Select
                    value={form.watch('membership')}
                    onValueChange={(value) => form.setValue('membership', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet">Initial Wallet Balance (₹)</Label>
                  <Input
                    id="wallet"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register('wallet', {
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
