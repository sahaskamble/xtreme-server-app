import React, { useEffect } from 'react'
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useRealTime } from '@/hooks/useRealTime';
import { usePocketBase } from '@/hooks/usePocketBase';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useParams } from 'react-router-dom';

export default function EditSnack() {
  const { snack_id } = useParams();
  const { data } = useRealTime('inventory');
  const { updateRecord } = usePocketBase();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Eatable',
    quantity: '',
    location: 'Stock',
    selling_price: '',
    status: 'Available',
  });

  useEffect(() => {
    const loadSnackData = async () => {
      try {
        setIsLoading(true);
        const snackInfo = data.find((snack) => snack.id === snack_id)
        if (snackInfo) {
          setFormData({
            name: snackInfo.name || '',
            type: snackInfo.type || 'Eatable',
            quantity: snackInfo.quantity || '',
            location: snackInfo.location || 'Stock',
            selling_price: snackInfo.selling_price || '',
            status: snackInfo.status || 'Available',
          });
        }
      } catch (error) {
        console.error("Error loading snack:", error);
        // TODO: Replace with toast notification
        console.error('Error: Could not load snack data');
      } finally {
        setIsLoading(false);
      }
    };

    if (snack_id) {
      loadSnackData();
    }
  }, [snack_id, data]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateRecord('inventory', snack_id, formData);
      console.log(result);
      // TODO: Replace with toast notification
      console.log('Success: Snack updated successfully!!!');
    } catch (error) {
      // TODO: Replace with toast notification
      console.error('Error updating snack:', error);
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
      <h1 className='text-2xl font-bold'>Update Snack</h1>
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
            disabled={isLoading}
          >
            {isLoading ? 'Updating' : 'Update'} Snack
          </Button>
        </div>
      </form>
    </section>
  )
}
