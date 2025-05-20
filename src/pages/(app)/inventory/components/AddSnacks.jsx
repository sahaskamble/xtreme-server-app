import React from 'react'
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { usePocketBase } from '@/hooks/usePocketBase';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";

export default function AddSnack() {
  const { createRecord } = usePocketBase();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Eatable',
    quantity: '',
    location: 'Stock',
    selling_price: '',
    status: 'Available'
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRecord('inventory', formData);
      toast.success('Snack added successfully!!!');
    } catch (error) {
      toast.error('Error adding snack: ' + (error.message || 'Unknown error'));
    } finally {
      // TODO: Implement dialog close functionality
      resetForm();
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Eatable',
      quantity: '',
      location: 'Stock',
      selling_price: '',
      status: 'Available'
    });
  }

  const handleClose = () => {
    // TODO: Implement dialog close functionality
    console.log('Dialog would close here');
    resetForm();
  }

  return (
    <section className='p-10'>
      <h1 className='text-2xl font-bold'>Add New Snack</h1>
      <form className='grid gap-4 mt-10'>
        <div className="space-y-4">
          <Label>Name</Label>
          <Input
            type='text'
            value={formData.name}
            onChange={(e) => setFormData({
              ...formData,
              name: e.target.value,
            })}
            placeholder='eg; Lays'
            required
          />
        </div>
        <div className="space-y-4">
          <Label>Snack Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className={'w-full'}>
              <SelectValue placeholder="Snack Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Eatable'>Eatable</SelectItem>
              <SelectItem value='Drinkable'>Drinkable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <Label>Quantity</Label>
          <Input
            type='number'
            value={formData.quantity}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || !isNaN(value)) {
                setFormData({
                  ...formData,
                  quantity: value
                });
              }
            }}
            placeholder='eg; 100'
          />
        </div>
        <div className="space-y-4">
          <Label>Location</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => setFormData({ ...formData, location: value })}
          >
            <SelectTrigger className={'w-full'}>
              <SelectValue placeholder="Located At" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Stock'>Stock</SelectItem>
              <SelectItem value='Fridge'>Fridge</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <Label>Selling Price</Label>
          <Input
            type='number'
            value={formData.selling_price}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || !isNaN(value)) {
                setFormData({
                  ...formData,
                  selling_price: value
                });
              }
            }}
            placeholder='eg; 100'
          />
        </div>
        <div className="space-y-4">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className={'w-full'}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Available'>Available</SelectItem>
              <SelectItem value='Unavailable'>Unavailable</SelectItem>
              <SelectItem value='Low Stock'>Low Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="pt-2 w-full flex items-center gap-2">
          <Button
            variant={'secondary'}
            type='reset'
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            onClick={onSubmit}
          >
            Add Snack
          </Button>
        </div>
      </form>
    </section>
  )
}
