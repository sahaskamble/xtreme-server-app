import React, { useState, useEffect } from 'react';
import { useRealTime } from '../../../hooks/useRealTime';
import {
  Card,
  CardContent,
  CardDescription,
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash, Edit, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import pb from '@/lib/pocketbase/pb';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("happy-hours");
  const [openHappyHourDialog, setOpenHappyHourDialog] = useState(false);
  const [editingHappyHour, setEditingHappyHour] = useState(null);

  // Device management state
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  // Group pricing state
  const [openPricingDialog, setOpenPricingDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // Membership management state
  const [openMembershipDialog, setOpenMembershipDialog] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [openAssignMembershipDialog, setOpenAssignMembershipDialog] = useState(false);
  const [selectedCustomerForMembership, setSelectedCustomerForMembership] = useState(null);

  // Recharge management state
  const [openRechargeDialog, setOpenRechargeDialog] = useState(false);
  const [editingRecharge, setEditingRecharge] = useState(null);
  const [openCustomerRechargeDialog, setOpenCustomerRechargeDialog] = useState(false);
  const [selectedCustomerForRecharge, setSelectedCustomerForRecharge] = useState(null);

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

  // Fetch devices
  const {
    data: devices = [],
    loading: devicesLoading,
    error: devicesError
  } = useRealTime('devices', {
    fetchInitial: true
  });

  // Fetch membership plans
  const {
    data: membershipPlans = [],
    loading: membershipPlansLoading,
    error: membershipPlansError
  } = useRealTime('membership_plans', {
    fetchInitial: true
  });

  // Fetch membership logs
  const {
    data: membershipLogs = [],
    loading: membershipLogsLoading,
    error: membershipLogsError
  } = useRealTime('membership_logs', {
    fetchInitial: true,
    queryParams: { expand: 'customer_id,plan_id,activated_by' }
  });

  // Fetch recharge plans
  const {
    data: rechargePlans = [],
    loading: rechargePlansLoading,
    error: rechargePlansError
  } = useRealTime('recharge_plans', {
    fetchInitial: true
  });

  // Fetch recharge logs
  const {
    data: rechargeLogs = [],
    loading: rechargeLogsLoading,
    error: rechargeLogsError
  } = useRealTime('recharge_logs', {
    fetchInitial: true,
    queryParams: { expand: 'customer_id,recharge_id,recharged_by' }
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

  // Form for device creation/editing
  const deviceForm = useForm({
    defaultValues: {
      name: "",
      type: "PC",
      group: "",
      mac_address: "",
      ip_address: "",
      status: "Available",
      powerOff: false,
      reboot: false,
      lock: false,
      sleep: false
    }
  });

  // Form for group pricing
  const pricingForm = useForm({
    defaultValues: {
      price: 0
    }
  });

  // Form for membership plan creation/editing
  const membershipForm = useForm({
    defaultValues: {
      name: "",
      price: 0,
      duration: 30,
      description: "",
      features: [],
      status: "Active"
    }
  });

  // Form for membership assignment
  const assignMembershipForm = useForm({
    defaultValues: {
      customer_id: "",
      plan_id: "",
      activated_on: new Date().toISOString().split('T')[0],
      expires_on: ""
    }
  });

  // Form for recharge plan creation/editing
  const rechargeForm = useForm({
    defaultValues: {
      name: "",
      price: 0,
      value: 0,
      note: "",
      status: "Active",
      base_rate: 0,
      total_hours: 0
    }
  });

  // Form for customer recharge
  const customerRechargeForm = useForm({
    defaultValues: {
      customer_id: "",
      recharge_id: "",
      recharged_on: new Date().toISOString().split('T')[0],
      note: "",
      available_time: 0
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

  // Device management functions
  const onDeviceSubmit = async (data) => {
    try {
      console.log("Submitting device data:", data);

      if (editingDevice) {
        console.log("Updating device with ID:", editingDevice.id);
        const result = await pb.collection('devices').update(editingDevice.id, data);
        console.log("Device updated successfully:", result);
        toast.success("Device updated successfully!");
      } else {
        console.log("Creating new device");
        const result = await pb.collection('devices').create(data);
        console.log("Device created successfully:", result);
        toast.success("Device created successfully!");
      }
      setOpenDeviceDialog(false);
      setEditingDevice(null);
      deviceForm.reset();
    } catch (error) {
      console.error("Error saving device:", error);
      toast.error("Failed to save device. Please try again.");
    }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      try {
        await pb.collection('devices').delete(id);
        console.log("Device deleted successfully");
      } catch (error) {
        console.error("Error deleting device:", error);
      }
    }
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    deviceForm.reset({
      name: device.name || "",
      type: device.type || "PC",
      group: device.group || "",
      mac_address: device.mac_address || "",
      ip_address: device.ip_address || "",
      status: device.status || "Available",
      powerOff: device.powerOff || false,
      reboot: device.reboot || false,
      lock: device.lock || false,
      sleep: device.sleep || false
    });
    setOpenDeviceDialog(true);
  };

  // Group pricing functions
  const onPricingSubmit = async (data) => {
    try {
      await pb.collection('groups').update(editingGroup.id, {
        price: data.price
      });
      console.log("Group pricing updated successfully");
      setOpenPricingDialog(false);
      setEditingGroup(null);
      pricingForm.reset();
    } catch (error) {
      console.error("Error updating group pricing:", error);
    }
  };

  const handleEditGroupPricing = (group) => {
    setEditingGroup(group);
    pricingForm.reset({
      price: group.price || 0
    });
    setOpenPricingDialog(true);
  };

  // Membership management functions
  const onMembershipSubmit = async (data) => {
    try {
      console.log("Submitting membership data:", data);

      // Parse features as JSON array
      const membershipData = {
        ...data,
        features: Array.isArray(data.features) ? data.features :
                 typeof data.features === 'string' ? data.features.split(',').map(f => f.trim()) : []
      };

      if (editingMembership) {
        const result = await pb.collection('membership_plans').update(editingMembership.id, membershipData);
        console.log("Membership plan updated successfully:", result);
        toast.success("Membership plan updated successfully!");
      } else {
        const result = await pb.collection('membership_plans').create(membershipData);
        console.log("Membership plan created successfully:", result);
        toast.success("Membership plan created successfully!");
      }
      setOpenMembershipDialog(false);
      setEditingMembership(null);
      membershipForm.reset();
    } catch (error) {
      console.error("Error saving membership plan:", error);
      toast.error("Failed to save membership plan. Please try again.");
    }
  };

  const handleDeleteMembershipPlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this membership plan?")) {
      try {
        await pb.collection('membership_plans').delete(id);
        console.log("Membership plan deleted successfully");
        toast.success("Membership plan deleted successfully!");
      } catch (error) {
        console.error("Error deleting membership plan:", error);
        toast.error("Failed to delete membership plan. Please try again.");
      }
    }
  };

  const handleEditMembershipPlan = (plan) => {
    setEditingMembership(plan);
    membershipForm.reset({
      name: plan.name || "",
      price: plan.price || 0,
      duration: plan.duration || 30,
      description: plan.description || "",
      features: Array.isArray(plan.features) ? plan.features : [],
      status: plan.status || "Active"
    });
    setOpenMembershipDialog(true);
  };

  // Membership assignment functions
  const onAssignMembershipSubmit = async (data) => {
    try {
      console.log("Assigning membership:", data);

      // Calculate expiry date based on plan duration
      const plan = membershipPlans.find(p => p.id === data.plan_id);
      const activatedDate = new Date(data.activated_on);
      const expiryDate = new Date(activatedDate);
      expiryDate.setDate(expiryDate.getDate() + (plan?.duration || 30));

      const membershipLogData = {
        customer_id: data.customer_id,
        plan_id: data.plan_id,
        activated_on: data.activated_on,
        expires_on: expiryDate.toISOString().split('T')[0],
        activated_by: pb.authStore.model?.id
      };

      const result = await pb.collection('membership_logs').create(membershipLogData);
      console.log("Membership assigned successfully:", result);
      toast.success("Membership assigned successfully!");

      setOpenAssignMembershipDialog(false);
      setSelectedCustomerForMembership(null);
      assignMembershipForm.reset();
    } catch (error) {
      console.error("Error assigning membership:", error);
      toast.error("Failed to assign membership. Please try again.");
    }
  };

  // Recharge management functions
  const onRechargeSubmit = async (data) => {
    try {
      console.log("Submitting recharge plan data:", data);

      if (editingRecharge) {
        const result = await pb.collection('recharge_plans').update(editingRecharge.id, data);
        console.log("Recharge plan updated successfully:", result);
        toast.success("Recharge plan updated successfully!");
      } else {
        const result = await pb.collection('recharge_plans').create(data);
        console.log("Recharge plan created successfully:", result);
        toast.success("Recharge plan created successfully!");
      }
      setOpenRechargeDialog(false);
      setEditingRecharge(null);
      rechargeForm.reset();
    } catch (error) {
      console.error("Error saving recharge plan:", error);
      toast.error("Failed to save recharge plan. Please try again.");
    }
  };

  const handleDeleteRechargePlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this recharge plan?")) {
      try {
        await pb.collection('recharge_plans').delete(id);
        console.log("Recharge plan deleted successfully");
        toast.success("Recharge plan deleted successfully!");
      } catch (error) {
        console.error("Error deleting recharge plan:", error);
        toast.error("Failed to delete recharge plan. Please try again.");
      }
    }
  };

  const handleEditRechargePlan = (plan) => {
    setEditingRecharge(plan);
    rechargeForm.reset({
      name: plan.name || "",
      price: plan.price || 0,
      value: plan.value || 0,
      note: plan.note || "",
      status: plan.status || "Active",
      base_rate: plan.base_rate || 0,
      total_hours: plan.total_hours || 0
    });
    setOpenRechargeDialog(true);
  };

  // Customer recharge functions
  const onCustomerRechargeSubmit = async (data) => {
    try {
      console.log("Processing customer recharge:", data);

      // Get the recharge plan details
      const plan = rechargePlans.find(p => p.id === data.recharge_id);
      if (!plan) {
        toast.error("Invalid recharge plan selected");
        return;
      }

      // Create recharge log
      const rechargeLogData = {
        customer_id: data.customer_id,
        recharge_id: data.recharge_id,
        recharged_on: data.recharged_on,
        recharged_by: pb.authStore.model?.id,
        note: data.note,
        available_time: plan.total_hours || 0
      };

      const rechargeResult = await pb.collection('recharge_logs').create(rechargeLogData);
      console.log("Recharge log created:", rechargeResult);

      // Update customer wallet
      const customer = customers.find(c => c.id === data.customer_id);
      if (customer) {
        const newWalletBalance = (customer.wallet || 0) + (plan.value || 0);
        await pb.collection('customers').update(data.customer_id, {
          wallet: newWalletBalance
        });
        console.log("Customer wallet updated");
      }

      toast.success(`Customer recharged successfully! Added ₹${plan.value} to wallet.`);

      setOpenCustomerRechargeDialog(false);
      setSelectedCustomerForRecharge(null);
      customerRechargeForm.reset();
    } catch (error) {
      console.error("Error processing customer recharge:", error);
      toast.error("Failed to process recharge. Please try again.");
    }
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="happy-hours">Happy Hours</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="membership">Membership</TabsTrigger>
              <TabsTrigger value="recharge">Recharge</TabsTrigger>
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
            <TabsContent value="pricing" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Group Pricing Management</h3>
              </div>

              {groupsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : groupsError ? (
                <div className="text-destructive text-center py-8">
                  Error loading groups
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No groups found
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Current Price (₹/hour)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>{group.type}</TableCell>
                          <TableCell>₹{group.price || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditGroupPricing(group)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Device Management</h3>
                <Button onClick={() => {
                  setEditingDevice(null);
                  deviceForm.reset();
                  setOpenDeviceDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Device
                </Button>
              </div>

              {devicesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : devicesError ? (
                <div className="text-destructive text-center py-8">
                  Error loading devices
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No devices found
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.map((device) => {
                        const group = groups.find(g => g.id === device.group);
                        return (
                          <TableRow key={device.id}>
                            <TableCell className="font-medium">{device.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {device.type || 'PC'}
                              </Badge>
                            </TableCell>
                            <TableCell>{group?.name || 'No Group'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                device.status === 'Available' ? 'default' :
                                device.status === 'Occupied' ? 'destructive' :
                                device.status === 'Maintainence' ? 'secondary' : 'outline'
                              }>
                                {device.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {device.ip_address || 'Not set'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditDevice(device)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteDevice(device.id)}
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

            {/* Membership Tab */}
            <TabsContent value="membership" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Membership Management</h3>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setEditingMembership(null);
                    membershipForm.reset();
                    setOpenMembershipDialog(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Plan
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedCustomerForMembership(null);
                    assignMembershipForm.reset();
                    setOpenAssignMembershipDialog(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Assign Membership
                  </Button>
                </div>
              </div>

              {/* Membership Plans */}
              <div className="space-y-4">
                <h4 className="text-md font-medium">Membership Plans</h4>
                {membershipPlansLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : membershipPlansError ? (
                  <div className="text-destructive text-center py-8">
                    Error loading membership plans
                  </div>
                ) : membershipPlans.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No membership plans found
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan Name</TableHead>
                          <TableHead>Price (₹)</TableHead>
                          <TableHead>Duration (Days)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {membershipPlans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>₹{plan.price || 0}</TableCell>
                            <TableCell>{plan.duration || 0} days</TableCell>
                            <TableCell>
                              <Badge variant={plan.status === 'Active' ? 'default' : 'secondary'}>
                                {plan.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditMembershipPlan(plan)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteMembershipPlan(plan.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Active Memberships */}
              <div className="space-y-4">
                <h4 className="text-md font-medium">Active Memberships</h4>
                {membershipLogsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : membershipLogsError ? (
                  <div className="text-destructive text-center py-8">
                    Error loading membership logs
                  </div>
                ) : membershipLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No active memberships found
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Activated On</TableHead>
                          <TableHead>Expires On</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {membershipLogs.map((log) => {
                          const isExpired = new Date(log.expires_on) < new Date();
                          const customer = customers.find(c => c.id === log.customer_id);
                          const plan = membershipPlans.find(p => p.id === log.plan_id);

                          return (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">
                                {customer?.expand?.user?.name || 'Unknown Customer'}
                              </TableCell>
                              <TableCell>{plan?.name || 'Unknown Plan'}</TableCell>
                              <TableCell>{new Date(log.activated_on).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(log.expires_on).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge variant={isExpired ? 'destructive' : 'default'}>
                                  {isExpired ? 'Expired' : 'Active'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Recharge Tab */}
            <TabsContent value="recharge" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Recharge Management</h3>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setEditingRecharge(null);
                    rechargeForm.reset();
                    setOpenRechargeDialog(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Plan
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedCustomerForRecharge(null);
                    customerRechargeForm.reset();
                    setOpenCustomerRechargeDialog(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Recharge Customer
                  </Button>
                </div>
              </div>

              {/* Recharge Plans */}
              <div className="space-y-4">
                <h4 className="text-md font-medium">Recharge Plans</h4>
                {rechargePlansLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : rechargePlansError ? (
                  <div className="text-destructive text-center py-8">
                    Error loading recharge plans
                  </div>
                ) : rechargePlans.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No recharge plans found
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan Name</TableHead>
                          <TableHead>Price (₹)</TableHead>
                          <TableHead>Value (₹)</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rechargePlans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>₹{plan.price || 0}</TableCell>
                            <TableCell>₹{plan.value || 0}</TableCell>
                            <TableCell>{plan.total_hours || 0}h</TableCell>
                            <TableCell>
                              <Badge variant={plan.status === 'Active' ? 'default' : 'secondary'}>
                                {plan.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditRechargePlan(plan)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteRechargePlan(plan.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Recent Recharges */}
              <div className="space-y-4">
                <h4 className="text-md font-medium">Recent Recharges</h4>
                {rechargeLogsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : rechargeLogsError ? (
                  <div className="text-destructive text-center py-8">
                    Error loading recharge logs
                  </div>
                ) : rechargeLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No recharge history found
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount (₹)</TableHead>
                          <TableHead>Recharged On</TableHead>
                          <TableHead>Recharged By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rechargeLogs.slice(0, 10).map((log) => {
                          const customer = customers.find(c => c.id === log.customer_id);
                          const plan = rechargePlans.find(p => p.id === log.recharge_id);

                          return (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">
                                {customer?.expand?.user?.name || 'Unknown Customer'}
                              </TableCell>
                              <TableCell>{plan?.name || 'Unknown Plan'}</TableCell>
                              <TableCell>₹{plan?.value || 0}</TableCell>
                              <TableCell>{new Date(log.recharged_on).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {log.expand?.recharged_by?.name || 'Unknown'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
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

      {/* Device Dialog */}
      <Dialog open={openDeviceDialog} onOpenChange={setOpenDeviceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDevice ? 'Edit Device' : 'Add New Device'}
            </DialogTitle>
            <DialogDescription>
              Configure device settings and assign to groups
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={deviceForm.handleSubmit(onDeviceSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Device Name */}
              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name *</Label>
                <Input
                  id="device-name"
                  placeholder="Enter device name"
                  {...deviceForm.register('name', { required: 'Device name is required' })}
                />
                {deviceForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{deviceForm.formState.errors.name.message}</p>
                )}
              </div>

              {/* Device Type and Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="device-type">Device Type</Label>
                  <Select
                    value={deviceForm.watch('type')}
                    onValueChange={(value) => deviceForm.setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PC">PC</SelectItem>
                      <SelectItem value="PS">PlayStation</SelectItem>
                      <SelectItem value="SIM">Simulator</SelectItem>
                      <SelectItem value="VR">VR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="device-group">Device Group</Label>
                  <Select
                    value={deviceForm.watch('group')}
                    onValueChange={(value) => deviceForm.setValue('group', value)}
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
                </div>
              </div>

              {/* Network Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mac-address">MAC Address</Label>
                  <Input
                    id="mac-address"
                    placeholder="00:00:00:00:00:00"
                    {...deviceForm.register('mac_address')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ip-address">IP Address</Label>
                  <Input
                    id="ip-address"
                    placeholder="192.168.1.100"
                    {...deviceForm.register('ip_address')}
                  />
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="device-status">Status</Label>
                <Select
                  value={deviceForm.watch('status')}
                  onValueChange={(value) => deviceForm.setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Maintainence">Maintenance</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Power and Control Settings */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Device Control Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="powerOff"
                      {...deviceForm.register('powerOff')}
                      className="rounded border border-input"
                    />
                    <Label htmlFor="powerOff" className="text-sm">Power Off</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lock"
                      {...deviceForm.register('lock')}
                      className="rounded border border-input"
                    />
                    <Label htmlFor="lock" className="text-sm">Locked</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sleep"
                      {...deviceForm.register('sleep')}
                      className="rounded border border-input"
                    />
                    <Label htmlFor="sleep" className="text-sm">Sleep Mode</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="reboot"
                      {...deviceForm.register('reboot')}
                      className="rounded border border-input"
                    />
                    <Label htmlFor="reboot" className="text-sm">Reboot Required</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                {editingDevice ? 'Update Device' : 'Add Device'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Group Pricing Dialog */}
      <Dialog open={openPricingDialog} onOpenChange={setOpenPricingDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Group Pricing</DialogTitle>
            <DialogDescription>
              Update the hourly rate for {editingGroup?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={pricingForm.handleSubmit(onPricingSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-price">Price per Hour (₹)</Label>
              <Input
                id="group-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter price per hour"
                {...pricingForm.register('price', {
                  required: 'Price is required',
                  valueAsNumber: true,
                  min: 0
                })}
              />
              {pricingForm.formState.errors.price && (
                <p className="text-sm text-destructive">{pricingForm.formState.errors.price.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit">
                Update Price
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Membership Plan Dialog */}
      <Dialog open={openMembershipDialog} onOpenChange={setOpenMembershipDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMembership ? 'Edit Membership Plan' : 'Add New Membership Plan'}
            </DialogTitle>
            <DialogDescription>
              Create or edit membership plans with features and pricing
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={membershipForm.handleSubmit(onMembershipSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="membership-name">Plan Name *</Label>
                  <Input
                    id="membership-name"
                    placeholder="Enter plan name"
                    {...membershipForm.register('name', { required: 'Plan name is required' })}
                  />
                  {membershipForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{membershipForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="membership-price">Price (₹) *</Label>
                  <Input
                    id="membership-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                    {...membershipForm.register('price', {
                      required: 'Price is required',
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                  {membershipForm.formState.errors.price && (
                    <p className="text-sm text-destructive">{membershipForm.formState.errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="membership-duration">Duration (Days) *</Label>
                  <Input
                    id="membership-duration"
                    type="number"
                    min="1"
                    placeholder="Enter duration in days"
                    {...membershipForm.register('duration', {
                      required: 'Duration is required',
                      valueAsNumber: true,
                      min: 1
                    })}
                  />
                  {membershipForm.formState.errors.duration && (
                    <p className="text-sm text-destructive">{membershipForm.formState.errors.duration.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="membership-status">Status</Label>
                  <Select
                    value={membershipForm.watch('status')}
                    onValueChange={(value) => membershipForm.setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership-description">Description</Label>
                <Input
                  id="membership-description"
                  placeholder="Enter plan description"
                  {...membershipForm.register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership-features">Features (comma-separated)</Label>
                <Input
                  id="membership-features"
                  placeholder="e.g., Priority booking, Discounts, Extended hours"
                  {...membershipForm.register('features')}
                />
                <p className="text-xs text-muted-foreground">
                  Enter features separated by commas
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                {editingMembership ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Membership Dialog */}
      <Dialog open={openAssignMembershipDialog} onOpenChange={setOpenAssignMembershipDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Membership to Customer</DialogTitle>
            <DialogDescription>
              Select a customer and membership plan to assign
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={assignMembershipForm.handleSubmit(onAssignMembershipSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assign-customer">Customer *</Label>
                <Select
                  value={assignMembershipForm.watch('customer_id')}
                  onValueChange={(value) => assignMembershipForm.setValue('customer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.expand?.user?.name || customer.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assign-plan">Membership Plan *</Label>
                <Select
                  value={assignMembershipForm.watch('plan_id')}
                  onValueChange={(value) => assignMembershipForm.setValue('plan_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipPlans.filter(plan => plan.status === 'Active').map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ₹{plan.price} ({plan.duration} days)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assign-activated-on">Activation Date *</Label>
                <Input
                  id="assign-activated-on"
                  type="date"
                  {...assignMembershipForm.register('activated_on', { required: 'Activation date is required' })}
                />
                {assignMembershipForm.formState.errors.activated_on && (
                  <p className="text-sm text-destructive">{assignMembershipForm.formState.errors.activated_on.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                Assign Membership
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recharge Plan Dialog */}
      <Dialog open={openRechargeDialog} onOpenChange={setOpenRechargeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingRecharge ? 'Edit Recharge Plan' : 'Add New Recharge Plan'}
            </DialogTitle>
            <DialogDescription>
              Create or edit recharge plans with pricing and value
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={rechargeForm.handleSubmit(onRechargeSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recharge-name">Plan Name *</Label>
                  <Input
                    id="recharge-name"
                    placeholder="Enter plan name"
                    {...rechargeForm.register('name', { required: 'Plan name is required' })}
                  />
                  {rechargeForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{rechargeForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recharge-price">Price (₹) *</Label>
                  <Input
                    id="recharge-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                    {...rechargeForm.register('price', {
                      required: 'Price is required',
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                  {rechargeForm.formState.errors.price && (
                    <p className="text-sm text-destructive">{rechargeForm.formState.errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recharge-value">Wallet Value (₹) *</Label>
                  <Input
                    id="recharge-value"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter wallet value"
                    {...rechargeForm.register('value', {
                      required: 'Wallet value is required',
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                  {rechargeForm.formState.errors.value && (
                    <p className="text-sm text-destructive">{rechargeForm.formState.errors.value.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recharge-hours">Total Hours</Label>
                  <Input
                    id="recharge-hours"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter total hours"
                    {...rechargeForm.register('total_hours', {
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recharge-base-rate">Base Rate (₹/hour)</Label>
                  <Input
                    id="recharge-base-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter base rate"
                    {...rechargeForm.register('base_rate', {
                      valueAsNumber: true,
                      min: 0
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recharge-status">Status</Label>
                  <Select
                    value={rechargeForm.watch('status')}
                    onValueChange={(value) => rechargeForm.setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recharge-note">Note</Label>
                <Input
                  id="recharge-note"
                  placeholder="Enter plan description or note"
                  {...rechargeForm.register('note')}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                {editingRecharge ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Recharge Dialog */}
      <Dialog open={openCustomerRechargeDialog} onOpenChange={setOpenCustomerRechargeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Recharge Customer Wallet</DialogTitle>
            <DialogDescription>
              Select a customer and recharge plan to add funds to their wallet
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={customerRechargeForm.handleSubmit(onCustomerRechargeSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recharge-customer">Customer *</Label>
                <Select
                  value={customerRechargeForm.watch('customer_id')}
                  onValueChange={(value) => customerRechargeForm.setValue('customer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.expand?.user?.name || customer.id} (₹{customer.wallet || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recharge-plan">Recharge Plan *</Label>
                <Select
                  value={customerRechargeForm.watch('recharge_id')}
                  onValueChange={(value) => customerRechargeForm.setValue('recharge_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recharge plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {rechargePlans.filter(plan => plan.status === 'Active').map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - Pay ₹{plan.price} Get ₹{plan.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recharge-date">Recharge Date *</Label>
                <Input
                  id="recharge-date"
                  type="date"
                  {...customerRechargeForm.register('recharged_on', { required: 'Recharge date is required' })}
                />
                {customerRechargeForm.formState.errors.recharged_on && (
                  <p className="text-sm text-destructive">{customerRechargeForm.formState.errors.recharged_on.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recharge-note">Note (Optional)</Label>
                <Input
                  id="recharge-note"
                  placeholder="Enter any additional notes"
                  {...customerRechargeForm.register('note')}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                Process Recharge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
