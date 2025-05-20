import React from 'react'
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useCollection } from '@/hooks/useRealTime';
import { useParams } from 'react-router-dom';

export default function EditAdmin() {
  const { user_id } = useParams();
  const { updateItem, data } = useCollection('users');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load user data when component mounts or user_id changes
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if we have user_id from params or from Electron IPC
        let currentId = user_id;

        // If no user_id from params, try to get it from Electron IPC
        if (!currentId && window.api) {
          try {
            currentId = await window.api.invoke('get-edit-user-id');
          } catch (err) {
            console.error('Failed to get user ID:', err);
          }
        }

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
        console.error('Error loading user data:', error);
        if (window.api) {
          await window.api.notify('Error', 'Failed to load user data');
        }
      }
    };

    loadData();
  }, [user_id, data]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.name) {
      if (window.api) {
        await window.api.notify('Error', 'Username and Full Name are required');
      }
      return;
    }

    setIsLoading(true);
    try {
      // Get the current user ID either from params or from Electron IPC
      let currentId = user_id;
      if (!currentId && window.api) {
        currentId = await window.api.invoke('get-edit-user-id');
      }

      if (!currentId) {
        throw new Error('No User ID available');
      }

      await updateItem(currentId, formData);

      if (window.api) {
        await window.api.notify('Success', 'User info updated successfully!');
        // Optionally refresh the parent window's data
        try {
          await window.api.invoke('refresh-users-data');
        } catch (err) {
          console.log('Optional refresh failed:', err);
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      if (window.api) {
        if (error?.message) {
          await window.api.notify('Error', error.message);
        } else {
          await window.api.notify('Error', 'Error updating user info, please try again later...');
        }
      }
    } finally {
      setIsLoading(false);
      if (window.api) {
        await window.api.customDialogClose();
      }
    }
  };

  const handleClose = async () => {
    if (window.api) {
      await window.api.customDialogClose();
    }
  };

  return (
    <section className="p-10">
      <h1 className="text-2xl font-bold">Edit Admin</h1>
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
            {isLoading ? 'Updating...' : 'Update Admin'}
          </Button>
        </div>
      </form>
    </section>
  );
}
