import React, { useState, useEffect } from 'react';
import { useRealTime } from '../../../hooks/useRealTime';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash, Edit, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import pb from '@/lib/pocketbase/pb';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("happy-hours");
  const [openHappyHourDialog, setOpenHappyHourDialog] = useState(false);
  const [editingHappyHour, setEditingHappyHour] = useState(null);

  // Fetch groups for happy hour settings
  const {
    data: groups = [],
    loading: groupsLoading,
    error: groupsError
  } = useRealTime('groups', {
    fetchInitial: true
  });

  // Fetch happy hours
  const {
    data: happyHours = [],
    loading: happyHoursLoading,
    error: happyHoursError
  } = useRealTime('happy_hours', {
    fetchInitial: true
  });

  // Form for happy hour creation/editing
  const form = useForm({
    defaultValues: {
      group: "",
      days: "Monday",
      start_time: "09:00",
      end_time: "11:00",
      discount_percentage: 10,
      fixed_rate: 0,
      status: "Active"
    }
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!openHappyHourDialog) {
      if (!editingHappyHour) {
        form.reset({
          group: "",
          days: "Monday",
          start_time: "09:00",
          end_time: "11:00",
          discount_percentage: 10,
          fixed_rate: 0,
          status: "Active"
        });
      }
    }
  }, [openHappyHourDialog, form, editingHappyHour]);

  // Set form values when editing
  useEffect(() => {
    if (editingHappyHour) {
      form.reset({
        group: editingHappyHour.group,
        days: editingHappyHour.days,
        start_time: editingHappyHour.start_time,
        end_time: editingHappyHour.end_time,
        discount_percentage: editingHappyHour.discount_percentage || 0,
        fixed_rate: editingHappyHour.fixed_rate || 0,
        status: editingHappyHour.status || "Active"
      });
    }
  }, [editingHappyHour, form]);

  // Handle happy hour form submission
  const onSubmit = async (data) => {
    try {
      if (editingHappyHour) {
        // Update existing happy hour
        await pb.collection('happy_hours').update(editingHappyHour.id, data);
        console.log("Happy hour updated successfully");
      } else {
        // Create new happy hour
        await pb.collection('happy_hours').create(data);
        console.log("Happy hour created successfully");
      }

      setOpenHappyHourDialog(false);
      setEditingHappyHour(null);
    } catch (error) {
      console.error("Error saving happy hour:", error);
    }
  };

  // Handle happy hour deletion
  const handleDeleteHappyHour = async (id) => {
    if (window.confirm("Are you sure you want to delete this happy hour?")) {
      try {
        await pb.collection('happy_hours').delete(id);
        console.log("Happy hour deleted successfully");
      } catch (error) {
        console.error("Error deleting happy hour:", error);
      }
    }
  };

  // Handle editing a happy hour
  const handleEditHappyHour = (happyHour) => {
    setEditingHappyHour(happyHour);
    setOpenHappyHourDialog(true);
  };

  return (
    <div className="mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Configure your cafe settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="happy-hours" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="happy-hours">Happy Hours</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Happy Hours Tab */}
            <TabsContent value="happy-hours" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Happy Hours Management</h3>
                <Button onClick={() => {
                  setEditingHappyHour(null);
                  setOpenHappyHourDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Happy Hour
                </Button>
              </div>

              {happyHoursLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : happyHoursError ? (
                <div className="text-destructive text-center py-8">
                  Error loading happy hours
                </div>
              ) : happyHours.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No happy hours configured
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Fixed Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {happyHours.map((happyHour) => {
                        const group = groups.find(g => g.id === happyHour.group);
                        return (
                          <TableRow key={happyHour.id}>
                            <TableCell className="font-medium">{group?.name || 'Unknown Group'}</TableCell>
                            <TableCell>{happyHour.days}</TableCell>
                            <TableCell>{happyHour.start_time} - {happyHour.end_time}</TableCell>
                            <TableCell>{happyHour.discount_percentage}%</TableCell>
                            <TableCell>₹{happyHour.fixed_rate || 0}</TableCell>
                            <TableCell>
                              <Badge variant={happyHour.status === "Active" ? "default" : "secondary"}>
                                {happyHour.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditHappyHour(happyHour)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteHappyHour(happyHour.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <h3 className="text-lg font-medium mb-4">Pricing Settings</h3>
              <p className="text-muted-foreground">
                Configure pricing settings here.
              </p>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system">
              <h3 className="text-lg font-medium mb-4">System Settings</h3>
              <p className="text-muted-foreground">
                Configure system settings here.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Happy Hour Dialog */}
      <Dialog open={openHappyHourDialog} onOpenChange={setOpenHappyHourDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingHappyHour ? 'Edit Happy Hour' : 'Create Happy Hour'}
            </DialogTitle>
            <DialogDescription>
              Configure happy hour settings for specific groups and times
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Group Selection */}
              <div className="space-y-2">
                <Label htmlFor="group">Device Group</Label>
                <Select
                  value={form.watch('group')}
                  onValueChange={(value) => form.setValue('group', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.group && (
                  <p className="text-sm text-destructive">{form.formState.errors.group.message}</p>
                )}
              </div>

              {/* Day Selection */}
              <div className="space-y-2">
                <Label htmlFor="days">Day of Week</Label>
                <Select
                  value={form.watch('days')}
                  onValueChange={(value) => form.setValue('days', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thrusday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...form.register('start_time')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...form.register('end_time')}
                  />
                </div>
              </div>

              {/* Discount Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_percentage">Discount (%)</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    {...form.register('discount_percentage', {
                      valueAsNumber: true,
                      min: 0,
                      max: 100
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fixed_rate">Fixed Rate (₹)</Label>
                  <Input
                    id="fixed_rate"
                    type="number"
                    min="0"
                    {...form.register('fixed_rate', {
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={form.watch('status') === 'Active'}
                  onCheckedChange={(checked) =>
                    form.setValue('status', checked ? 'Active' : 'Inactive')
                  }
                />
                <Label htmlFor="status">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                {editingHappyHour ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
