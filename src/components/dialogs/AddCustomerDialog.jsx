import React, { useState } from 'react';
import { Eye, EyeOff, User } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    wallet: 0,
    type: 'Post-Paid',
    membership: 'Standard',
    contact: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.passwordConfirm) newErrors.passwordConfirm = 'Please confirm password';
    else if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = "Passwords don't match";
    return newErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    try {
      setIsLoading(true);
      // Create client (auth user) first
      const clientData = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        emailVisibility: true,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm
      };
      const createdClient = await pb.collection('clients').create(clientData);
      // Create customer record with relation to client
      const customerData = {
        client: createdClient.id,
        wallet: parseFloat(formData.wallet) || 0,
        type: formData.type,
        membership: formData.membership,
        contact: formData.contact
      };
      await pb.collection('customers').create(customerData);
      toast.success("Customer added successfully!");
      setFormData({
        username: '',
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        wallet: 0,
        type: 'Post-Paid',
        membership: 'Standard',
        contact: ''
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating customer:', error);
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

  const handleDialogOpenChange = (isOpen) => {
    if (!isOpen) {
      setFormData({
        username: '',
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        wallet: 0,
        type: 'Post-Paid',
        membership: 'Standard',
        contact: ''
      });
      setErrors({});
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      wallet: 0,
      type: 'Post-Paid',
      membership: 'Standard',
      contact: ''
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
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
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    name="contact"
                    placeholder="Enter contact number"
                    value={formData.contact}
                    onChange={handleChange}
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
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
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
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Confirm Password *</Label>
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                  />
                  {errors.passwordConfirm && (
                    <p className="text-sm text-destructive">{errors.passwordConfirm}</p>
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
                    value={formData.type}
                    onValueChange={value => handleSelectChange('type', value)}
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
                    value={formData.membership}
                    onValueChange={value => handleSelectChange('membership', value)}
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
                    name="wallet"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.wallet}
                    onChange={handleChange}
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
