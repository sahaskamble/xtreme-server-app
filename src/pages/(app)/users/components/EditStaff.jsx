import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useCollection } from '@/hooks/useRealTime';
import { useParams } from 'react-router-dom';

export default function EditStaff() {
  const { user_id } = useParams();
  const { updateItem, data } = useCollection('users');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        let currentId = user_id;
        if (currentId && data && data.length > 0) {
          const found = data.find(item => item?.id === currentId);
          if (found) {
            setFormData({
              name: found.name || '',
              username: found.username || '',
              email: found.email || '',
            });
          }
        }
      } catch (error) {
        await window.api.notify('Error', 'Failed to load user data');
      }
    };

    loadData();
  }, [user_id, data]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.name) {
      await window.api.notify('Error', 'Username and Full Name are required');
      return;
    }

    setIsLoading(true);
    try {
      // Get the current user ID either from params or from Electron IPC
      let currentId = user_id;
      if (!currentId) {
        throw new Error('No User ID available');
      }

      await updateItem(currentId, formData);
      await window.api.notify('Success', 'User info updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      if (error?.message) {
        await window.api.notify('Error', error.message);
      } else {
        await window.api.notify('Error', 'Error updating user info, please try again later...');
      }
    } finally {
      setIsLoading(false);
      await window.api.customDialogClose();
      setFormData({ name: '', username: '', email: '' })
    }
  };

  const handleClose = async () => {
    await window.api.customDialogClose();
  };

  return (
    <section className="p-10">
      <h1 className="text-2xl font-bold">Edit Staff</h1>
      <form className="grid gap-4 pt-6">
        <div className="space-y-2">
          <Label>Username</Label>
          <Input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({
              ...formData,
              username: e.target.value,
            })}
            placeholder="eg; johndoe001"
            pattern="^[a-z0-9_]+$"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({
              ...formData,
              name: e.target.value,
            })}
            placeholder="eg; John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({
              ...formData,
              email: e.target.value,
            })}
            placeholder="eg; johndoe@gmail.com"
          />
        </div>
        <div className="pt-4 w-full flex items-center gap-2">
          <Button
            variant="secondary"
            type="button"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={onSubmit}
          >
            {isLoading ? 'Updating...' : 'Update Staff'}
          </Button>
        </div>
      </form>
    </section>
  );
}
