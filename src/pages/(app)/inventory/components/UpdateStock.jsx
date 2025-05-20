import React, { useEffect } from 'react'
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useRealTime } from '@/hooks/useRealTime';
import { usePocketBase } from '@/hooks/usePocketBase';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner";

export default function UpdateStock() {
  const { snack_id } = useParams();
  const { data } = useRealTime('inventory');
  const { updateRecord, createRecord } = usePocketBase();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quantity');

  // Original snack data for reference
  const [originalData, setOriginalData] = useState(null);

  // Form data for the snack
  const [formData, setFormData] = useState({
    name: '',
    type: 'Eatable',
    quantity: '',
    location: 'Stock',
    selling_price: '',
    status: 'Available',
  });

  // Specific update form states
  const [quantityUpdate, setQuantityUpdate] = useState({
    action: 'add', // 'add' or 'subtract'
    amount: '',
    status: 'Purchase' // Purchase, Lost, Theft, Used, Expired
  });

  const [priceUpdate, setPriceUpdate] = useState({
    newPrice: '',
    action: '' // 'increase' or 'decrease'
  });

  const [locationUpdate, setLocationUpdate] = useState({
    newLocation: 'Stock'
  });

  useEffect(() => {
    const loadSnackData = async () => {
      try {
        setIsLoading(true);
        const snackInfo = data.find((snack) => snack.id === snack_id)
        if (snackInfo) {
          // Store original data for reference
          setOriginalData(snackInfo);

          // Set form data
          setFormData({
            name: snackInfo.name || '',
            type: snackInfo.type || 'Eatable',
            quantity: snackInfo.quantity || '',
            location: snackInfo.location || 'Stock',
            selling_price: snackInfo.selling_price || '',
            status: snackInfo.status || 'Available',
          });

          // Initialize update forms with current values
          setPriceUpdate({
            newPrice: snackInfo.selling_price || '',
            action: ''
          });

          setLocationUpdate({
            newLocation: snackInfo.location || 'Stock'
          });
        }
      } catch (error) {
        console.error("Error loading snack:", error);
        toast.error('Could not load snack data');
      } finally {
        setIsLoading(false);
      }
    };

    if (snack_id && data) {
      loadSnackData();
    }
  }, [snack_id, data]);

  // Handle quantity update
  const handleQuantityUpdate = async (e) => {
    e.preventDefault();
    if (!quantityUpdate.amount || isNaN(quantityUpdate.amount) || quantityUpdate.amount <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      setIsLoading(true);

      // Calculate new quantity
      let newQuantity;
      if (quantityUpdate.action === 'add') {
        newQuantity = Number(formData.quantity) + Number(quantityUpdate.amount);
      } else {
        newQuantity = Math.max(0, Number(formData.quantity) - Number(quantityUpdate.amount));
      }

      // Update status based on new quantity
      let newStatus = formData.status;
      if (newQuantity <= 10 && newQuantity > 0) {
        newStatus = 'Low Stock';
      } else if (newQuantity === 0) {
        newStatus = 'Unavailable';
      } else {
        newStatus = 'Available';
      }

      // Update the snack
      await updateRecord('inventory', snack_id, {
        quantity: newQuantity,
        status: newStatus
      });

      // Create log entry
      await createRecord('inventory_logs', {
        inventory_id: snack_id,
        user: localStorage.getItem('userId'), // Get current user ID from localStorage
        quantity: quantityUpdate.amount,
        status: quantityUpdate.action === 'add' ? 'Purchase' : quantityUpdate.status,
        location: formData.location,
        reason: quantityUpdate.action === 'add'
          ? `Added ${quantityUpdate.amount} items (Purchase)`
          : `Removed ${quantityUpdate.amount} items (${quantityUpdate.status})`
      });

      // Update local state
      setFormData({
        ...formData,
        quantity: newQuantity,
        status: newStatus
      });

      // Reset update form
      setQuantityUpdate({
        action: 'add',
        amount: '',
        status: 'Purchase'
      });

      toast.success(`Stock quantity ${quantityUpdate.action === 'add' ? 'increased' : 'decreased'} successfully!`);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error('Error updating stock quantity: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  // Handle price update
  const handlePriceUpdate = async (e) => {
    e.preventDefault();
    if (!priceUpdate.newPrice || isNaN(priceUpdate.newPrice) || priceUpdate.newPrice < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsLoading(true);

      // Determine if price increased or decreased
      const oldPrice = Number(formData.selling_price);
      const newPrice = Number(priceUpdate.newPrice);
      const action = newPrice > oldPrice ? 'increase' : (newPrice < oldPrice ? 'decrease' : 'unchanged');

      // Update the snack
      await updateRecord('inventory', snack_id, {
        selling_price: newPrice
      });

      // Create log entry
      await createRecord('inventory_logs', {
        inventory_id: snack_id,
        user: localStorage.getItem('userId'), // Get current user ID from localStorage
        quantity: formData.quantity,
        status: 'Price Changed', // Using 'Added' as a generic status for price changes
        location: formData.location,
        reason: `Price ${action}: Rs.${oldPrice} → Rs.${newPrice}`
      });

      // Update local state
      setFormData({
        ...formData,
        selling_price: newPrice
      });

      toast.success('Price updated successfully!');
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error('Error updating price: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  // Handle location update
  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    if (locationUpdate.newLocation === formData.location) {
      toast.info('Location is unchanged');
      return;
    }

    try {
      setIsLoading(true);

      // Update the snack
      await updateRecord('inventory', snack_id, {
        quantity: formData.quantity,
        location: locationUpdate.newLocation
      });

      // Create log entry
      await createRecord('inventory_logs', {
        inventory_id: snack_id,
        user: localStorage.getItem('userId'), // Get current user ID from localStorage
        quantity: formData.quantity,
        status: 'Location changed',
        reason: `Location changed: ${formData.location} → ${locationUpdate.newLocation}`
      });

      // Update local state
      setFormData({
        ...formData,
        location: locationUpdate.newLocation
      });

      toast.success('Location updated successfully!');
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error('Error updating location: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  const handleClose = () => {
    // TODO: Implement dialog close functionality
    console.log('Dialog would close here');
  }

  return (
    <section className='p-10'>
      <h1 className='text-2xl font-bold'>Update Stock</h1>

      {isLoading && !originalData ? (
        <div className="flex items-center justify-center h-40">Loading snack data...</div>
      ) : (
        <>
          <Card className="mt-4 mb-6">
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="font-medium">{formData.name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Current Quantity</Label>
                <p className="font-medium">{formData.quantity} pcs</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Current Price</Label>
                <p className="font-medium">Rs. {formData.selling_price}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Current Location</Label>
                <p className="font-medium">{formData.location}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Type</Label>
                <p className="font-medium">{formData.type}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <p className="font-medium">{formData.status}</p>
              </div>
            </CardContent>
          </Card>

          <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={'w-full'}>
              <TabsTrigger value="quantity">Quantity</TabsTrigger>
              <TabsTrigger value="selling_price">Selling Price</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            {/* Quantity Update Tab */}
            <TabsContent value="quantity">
              <form className='grid gap-4 mt-6' onSubmit={handleQuantityUpdate}>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <RadioGroup
                    value={quantityUpdate.action}
                    onValueChange={(value) => setQuantityUpdate({ ...quantityUpdate, action: value })}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="add" id="add" />
                      <Label htmlFor="add">Add Stock</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="subtract" id="subtract" />
                      <Label htmlFor="subtract">Subtract Stock</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Quantity to {quantityUpdate.action === 'add' ? 'Add' : 'Subtract'}</Label>
                  <Input
                    type='number'
                    value={quantityUpdate.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
                        setQuantityUpdate({
                          ...quantityUpdate,
                          amount: value
                        });
                      }
                    }}
                    placeholder='eg; 10'
                  />
                </div>

                {quantityUpdate.action === 'subtract' && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={quantityUpdate.status}
                      onValueChange={(value) => setQuantityUpdate({ ...quantityUpdate, status: value })}
                    >
                      <SelectTrigger className={'w-full'}>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Lost'>Lost</SelectItem>
                        <SelectItem value='Theft'>Theft</SelectItem>
                        <SelectItem value='Used'>Used</SelectItem>
                        <SelectItem value='Expired'>Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="pt-4 w-full flex items-center gap-2">
                  <Button
                    variant={'secondary'}
                    type='button'
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading || !quantityUpdate.amount}
                  >
                    {isLoading ? 'Updating...' : `${quantityUpdate.action === 'add' ? 'Add to' : 'Subtract from'} Stock`}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Selling Price Update Tab */}
            <TabsContent value="selling_price">
              <form className='grid gap-4 mt-6' onSubmit={handlePriceUpdate}>
                <div className="space-y-2">
                  <Label>New Selling Price</Label>
                  <Input
                    type='number'
                    value={priceUpdate.newPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
                        setPriceUpdate({
                          ...priceUpdate,
                          newPrice: value,
                          action: value > formData.selling_price ? 'increase' : 'decrease'
                        });
                      }
                    }}
                    placeholder='eg; 100'
                  />
                </div>

                {priceUpdate.newPrice && formData.selling_price && (
                  <div className="text-sm">
                    {Number(priceUpdate.newPrice) > Number(formData.selling_price) ? (
                      <p className="text-green-600">Price will increase by Rs. {(Number(priceUpdate.newPrice) - Number(formData.selling_price)).toFixed(2)}</p>
                    ) : Number(priceUpdate.newPrice) < Number(formData.selling_price) ? (
                      <p className="text-amber-600">Price will decrease by Rs. {(Number(formData.selling_price) - Number(priceUpdate.newPrice)).toFixed(2)}</p>
                    ) : (
                      <p className="text-muted-foreground">Price remains unchanged</p>
                    )}
                  </div>
                )}

                <div className="pt-4 w-full flex items-center gap-2">
                  <Button
                    variant={'secondary'}
                    type='button'
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading || !priceUpdate.newPrice || priceUpdate.newPrice === formData.selling_price}
                  >
                    {isLoading ? 'Updating...' : 'Update Price'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Location Update Tab */}
            <TabsContent value="location">
              <form className='grid gap-4 mt-6' onSubmit={handleLocationUpdate}>
                <div className="space-y-2">
                  <Label>New Location</Label>
                  <Select
                    value={locationUpdate.newLocation}
                    onValueChange={(value) => setLocationUpdate({ ...locationUpdate, newLocation: value })}
                  >
                    <SelectTrigger className={'w-full'}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Stock'>Stock</SelectItem>
                      <SelectItem value='Fridge'>Fridge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 w-full flex items-center gap-2">
                  <Button
                    variant={'secondary'}
                    type='button'
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading || locationUpdate.newLocation === formData.location}
                  >
                    {isLoading ? 'Updating...' : 'Update Location'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </>
      )}
    </section>
  )
}

