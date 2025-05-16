import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from '@/components/ui/context-menu'
// Dropdown menu components are not currently used
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Not currently used
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  // SheetTrigger, // Not currently used
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Edit,
  Trash,
  Plus,
  Power,
  RefreshCw,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  CreditCard,
  Tag,
  Calendar,
  Loader2,
  X,
  Play,
  StopCircle,
  Camera,
  Monitor as ComputerIcon
} from 'lucide-react'
import { usePocketBase } from '@/hooks/usePocketBase'
import { useRealTime, useRealTimeRecord } from '@/hooks/useRealTime'
import { usePendingPayments } from '@/contexts/PendingPaymentsContext'
import { toast, Toaster } from "sonner"

export default function IndexPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceGroups, setDeviceGroups] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionDevice, setSessionDevice] = useState(null);
  const [activeTab, setActiveTab] = useState("login");
  const [clientLoggedIn, setClientLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [clientUsername, setClientUsername] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const { updateRecord, pb } = usePocketBase();
  const [session, setSession] = useState({
    device: "",
    customer: "",
    in_time: new Date().toISOString(),
    out_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    payment_mode: "Cash",
    payment_type: "Pre-paid",
    status: "Active",
    duration: 60,
    amount_paid: 0,
    discount_rate: 0
  });

  const [sessionFormError, setSessionFormError] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Use pending payments context
  const { pendingPaymentsOpen, setPendingPaymentsOpen } = usePendingPayments();

  // Use real-time hooks for customers, devices, and groups
  const {
    data: customers = [],
    loading: customersLoading,
    error: customersError
  } = useRealTime('customers', {
    // Handle errors gracefully
    fetchInitial: true
  });

  const {
    data: devices = [],
    loading: devicesLoading,
    error: devicesError
  } = useRealTime('devices', {
    // Handle errors gracefully
    fetchInitial: true
  });

  const {
    data: groups = [],
    loading: groupsLoading,
    error: groupsError
  } = useRealTime('groups', {
    // Handle errors gracefully
    fetchInitial: true
  });

  // Fetch pending payments (post-paid active sessions and closed sessions with pending balances)
  const {
    data: pendingPayments = [],
    loading: pendingPaymentsLoading,
    error: pendingPaymentsError
  } = useRealTime('sessions', {
    fetchInitial: true,
    filter: '(payment_type = "Post-paid" && status = "Active") || (status = "Closed" && amount_paid < total_amount)'
  });

  // Use real-time hook for selected customer if one is selected
  const {
    data: selectedCustomerData,
    error: selectedCustomerError
  } = useRealTimeRecord(
    'customers',
    selectedCustomer?.id,
    {
      fetchInitial: !!selectedCustomer?.id,
      // Don't try to fetch if there's no ID
      autoCancel: true
    }
  );

  // Use real-time hook for selected device if one is selected
  const {
    data: selectedDeviceData,
    error: selectedDeviceError
  } = useRealTimeRecord(
    'devices',
    selectedDevice?.id,
    {
      fetchInitial: !!selectedDevice?.id,
      // Don't try to fetch if there's no ID
      autoCancel: true
    }
  );

  // Fetch screenshots for selected device - only get the latest one
  const {
    data: deviceScreenshots = [],
    loading: screenshotsLoading,
    error: screenshotsError
  } = useRealTime('screenshots', {
    fetchInitial: !!selectedDevice?.id,
    filter: selectedDevice?.id ? `device = "${selectedDevice.id}"` : '',
    sort: '-created',
    expand: 'device',
    autoCancel: true,
    limit: 1 // Only get the latest screenshot
  });

  // Update selected customer when real-time data changes
  useEffect(() => {
    if (selectedCustomerData && selectedCustomer?.id === selectedCustomerData.id) {
      setSelectedCustomer(selectedCustomerData);
    }
  }, [selectedCustomerData]);

  // Update selected device when real-time data changes
  useEffect(() => {
    if (selectedDeviceData && selectedDevice?.id === selectedDeviceData.id) {
      setSelectedDevice(selectedDeviceData);
    }
  }, [selectedDeviceData]);

  // Group devices by type whenever devices change
  useEffect(() => {
    if (devices && devices.length > 0) {
      const groupedDevices = groupDevicesByType(devices);
      setDeviceGroups(groupedDevices);
    }
  }, [devices]);

  // Check for existing client login in localStorage
  useEffect(() => {
    const checkExistingLogin = () => {
      try {
        const storedLoginInfo = localStorage.getItem('clientLoginInfo');
        if (storedLoginInfo) {
          const loginInfo = JSON.parse(storedLoginInfo);

          // Check if login is still valid (you might want to add expiration logic)
          const loginTime = new Date(loginInfo.loginTime);
          const currentTime = new Date();
          const hoursSinceLogin = (currentTime - loginTime) / (1000 * 60 * 60);

          // If login is less than 24 hours old, consider it valid
          if (hoursSinceLogin < 24) {
            console.log("Found existing client login:", loginInfo.username);
            // You could pre-fill the login form or auto-login here if needed
          } else {
            // Login too old, remove it
            localStorage.removeItem('clientLoginInfo');
          }
        }
      } catch (error) {
        console.error("Error checking existing login:", error);
        // If there's an error parsing the stored login, remove it
        localStorage.removeItem('clientLoginInfo');
      }
    };

    checkExistingLogin();
  }, []);

  // Combine loading and error states
  const loading = customersLoading || devicesLoading || groupsLoading || pendingPaymentsLoading;
  const error = customersError || devicesError || groupsError || pendingPaymentsError;

  // Group devices by group from the groups collection
  const groupDevicesByType = (devices) => {
    // Create a map of group IDs to group objects
    const groupMap = {};
    groups.forEach(group => {
      groupMap[group.id] = {
        id: group.id,
        name: group.name,
        price: group.price || 0,
        devices: []
      };
    });

    // Add devices to their respective groups
    devices.forEach(device => {
      const groupId = device.group || '';
      if (groupId && groupMap[groupId]) {
        groupMap[groupId].devices.push({
          ...device,
          // Use the group's price for the device if not specified
          price: device.price || groupMap[groupId].price || 0
        });
      } else {
        // If no group or group not found, add to "Other" group
        if (!groupMap['other']) {
          groupMap['other'] = {
            id: 'other',
            name: 'Other',
            price: 0,
            devices: []
          };
        }
        groupMap['other'].devices.push(device);
      }
    });

    // Convert the map to an array
    return Object.values(groupMap).filter(group => group.devices.length > 0);
  };

  // Function to handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSelectedDevice(null);
  };

  // Function to handle device selection
  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    setSelectedCustomer(null);
  };

  // Function to handle device double-click
  const handleDeviceDoubleClick = (device) => {
    if (device.status === 'Maintainence') return; // Don't open dialog for maintenance devices

    // Reset login state when opening dialog
    setClientLoggedIn(false);
    setLoginError("");
    setClientUsername("");
    setClientPassword("");
    setActiveTab("login");

    setSessionDevice(device);
    setDialogOpen(true);
  };

  // Function to handle client login
  const handleClientLogin = async () => {
    if (!clientUsername || !clientPassword) {
      setLoginError("Please enter both username and password");
      return;
    }

    try {
      setLoginError("");

      // Authenticate with PocketBase clients collection
      const authData = await pb.collection('clients').authWithPassword(clientUsername, clientPassword);

      // Create login info object with comprehensive client information
      const loginInfo = {
        token: authData.token || `client_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        username: clientUsername,
        loginTime: new Date().toISOString(),
        deviceId: sessionDevice?.id,
        clientId: authData.record.id,
        clientName: authData.record.name || clientUsername,
        clientEmail: authData.record.email || '',
        clientType: authData.record.type || 'Regular',
        clientMembership: authData.record.membership || 'Standard',
        clientRecord: authData.record // Store the full client record for reference
      };

      // Store login info in localStorage
      localStorage.setItem('clientLoginInfo', JSON.stringify(authData.record));

      // Update the device with token and client information in PocketBase
      if (sessionDevice?.id) {
        try {
          // Extract relevant client information from the auth result
          const clientInfo = {
            token: loginInfo.token,
            record: JSON.stringify(authData.record)
          };

          // Update the device record with client information
          await updateRecord('devices', sessionDevice.id, clientInfo);

          console.log(`Updated device ${sessionDevice.id} with client information:`, clientInfo);
        } catch (deviceUpdateError) {
          console.error("Error updating device with client information:", deviceUpdateError);
          // Continue with login process even if device update fails
        }
      }

      // Update UI state
      setClientLoggedIn(true);
      setActiveTab("session");

    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Invalid username or password");
    }
  };

  // Function to handle device power toggle
  const handleDevicePower = async (device, forceState = null) => {
    try {
      // If forceState is provided, use it; otherwise toggle the current state
      const newPowerState = forceState !== null ? forceState : !device.powerOff;

      await updateRecord('devices', device.id, {
        powerOff: newPowerState
      });
      // No need to update state manually - real-time updates will handle it
    } catch (err) {
      console.error("Error toggling device power:", err);
    }
  };

  // Function to handle device reboot
  const handleDeviceReboot = async (device) => {
    try {
      await updateRecord('devices', device.id, {
        reboot: true
      });
      // No need to update state manually - real-time updates will handle it
    } catch (err) {
      console.error("Error rebooting device:", err);
    }
  };

  // Function to trigger screenshot for a device
  const handleTakeScreenshot = async (device) => {
    try {
      console.log("Requesting screenshot for device:", device.id);

      // First, check if the field exists by logging the current device data
      console.log("Current device data:", device);

      // Update with the screenshot flag
      const result = await updateRecord('devices', device.id, {
        take_screenshot: true
      });

      console.log("Update result:", result);
      console.log(`Screenshot requested for device ${device.id}`);

      // Show a toast notification
      toast.success("Screenshot Requested", {
        description: `Screenshot requested for ${device.name}`,
      });

      // Reset the flag after a short delay to allow for future screenshot requests
      setTimeout(async () => {
        try {
          await updateRecord('devices', device.id, {
            take_screenshot: false
          });
          console.log(`Screenshot flag reset for device ${device.id}`);
        } catch (resetErr) {
          console.error("Error resetting screenshot flag:", resetErr);
        }
      }, 5000); // Reset after 5 seconds
    } catch (err) {
      console.error("Error requesting screenshot:", err);

      // Show error toast
      toast.error("Screenshot Error", {
        description: "Failed to request screenshot. The field may not exist in the database schema.",
      });
    }
  };

  // Function to handle stopping a session
  const handleStopSession = async (device) => {
    try {
      if (!device.current_session) {
        console.error("No active session found for this device");
        return;
      }

      // Get the current time for session end time
      const currentTime = new Date().toISOString();

      // Update the session to Closed status
      await updateRecord('sessions', device.current_session, {
        status: 'Closed',
        out_time: currentTime
      });

      // Update the device status back to Available
      await updateRecord('devices', device.id, {
        status: 'Available',
        current_session: null
      });

      console.log(`Session ${device.current_session} stopped successfully`);
    } catch (err) {
      console.error("Error stopping session:", err);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to handle session form changes
  const handleSessionChange = (field, value) => {
    setSession(prev => {
      const updated = { ...prev, [field]: value };

      // If duration or in_time changes, recalculate out_time
      if (field === 'duration' || field === 'in_time') {
        const inTime = field === 'in_time' ? new Date(value) : new Date(prev.in_time);
        const durationMinutes = field === 'duration' ? parseInt(value) : parseInt(prev.duration);

        if (!isNaN(inTime.getTime()) && !isNaN(durationMinutes)) {
          const outTime = new Date(inTime.getTime() + durationMinutes * 60 * 1000);
          updated.out_time = outTime.toISOString();
        }
      }

      return updated;
    });
  };

  // Function to calculate session price
  const calculateSessionPrice = () => {
    if (!sessionDevice) return 0;

    // Get the device's group to find the price
    const deviceGroup = groups.find(g => g.id === sessionDevice.group);

    // Use device price if available, otherwise use group price, or default to 0
    const pricePerHour = sessionDevice.price || (deviceGroup?.price || 0);
    const durationHours = session.duration / 60;
    let totalPrice = pricePerHour * durationHours;

    // Apply discount if any
    if (session.discount_rate > 0) {
      totalPrice = totalPrice * (1 - session.discount_rate / 100);
    }

    return totalPrice.toFixed(2);
  };

  // Function to handle payment collection
  const handleCollectPayment = async (sessionId, amount) => {
    try {
      // Get the session
      const session = pendingPayments.find(p => p.id === sessionId);
      if (!session) {
        console.error("Session not found");
        return;
      }

      // Determine if this is a balance payment or full payment
      const isPendingBalance = session.status === "Closed" && session.amount_paid < session.total_amount;

      if (isPendingBalance) {
        // For sessions with pending balance, just update the amount paid
        const newAmountPaid = parseFloat(session.amount_paid || 0) + parseFloat(amount);

        await updateRecord('sessions', sessionId, {
          amount_paid: newAmountPaid
        });

        console.log(`Balance payment of ₹${amount} collected successfully. Total paid: ₹${newAmountPaid}`);
      } else {
        // For post-paid active sessions, change to pre-paid
        await updateRecord('sessions', sessionId, {
          payment_type: "Pre-paid", // Change to pre-paid since payment is collected
          amount_paid: amount,
          total_amount: amount
        });

        console.log(`Full payment of ₹${amount} collected successfully`);
      }
    } catch (error) {
      console.error("Error collecting payment:", error);
    }
  };

  // Function to create a new session
  const handleCreateSession = async () => {
    if (!sessionDevice?.id) {
      setSessionFormError("No device selected");
      return;
    }

    if (!session.customer) {
      setSessionFormError("Please select a customer");
      return;
    }

    try {
      setSessionFormError("");
      setIsCreatingSession(true);

      // Get client login info from localStorage
      const storedLoginInfo = localStorage.getItem('clientLoginInfo');
      if (!storedLoginInfo) {
        setSessionFormError("Client login information not found");
        setIsCreatingSession(false);
        return;
      }

      const loginInfo = JSON.parse(storedLoginInfo);

      // Prepare session data with comprehensive client information
      const sessionData = {
        ...session,
        device: sessionDevice.id,
        client_token: loginInfo.token,
        client_id: loginInfo.clientId,
        client_name: loginInfo.clientName,
        client_email: loginInfo.clientEmail,
        total_amount: calculateSessionPrice(),
        created_by: loginInfo.clientId
      };

      // Create session in PocketBase
      const createdSession = await pb.collection('sessions').create(sessionData);

      // Update device status to Occupied
      await updateRecord('devices', sessionDevice.id, {
        status: 'Occupied',
        current_session: createdSession.id
      });

      // Close dialog and reset form
      setDialogOpen(false);
      setSession({
        device: "",
        customer: "",
        in_time: new Date().toISOString(),
        out_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        payment_mode: "Cash",
        payment_type: "Pre-paid",
        status: "Active",
        duration: 60,
        amount_paid: 0,
        discount_rate: 0
      });

      console.log("Session created successfully:", createdSession);

    } catch (error) {
      console.error("Error creating session:", error);
      setSessionFormError("Failed to create session: " + (error.message || "Unknown error"));
    } finally {
      setIsCreatingSession(false);
    }
  };

  console.log(deviceGroups);

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors />
      <div className="flex h-full">
        {/* Left Section - Customer Info */}
        <div className="w-1/5 p-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Customers</CardTitle>
                <Button>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow relative">
              {loading ? (
                <div className="flex justify-center items-center absolute inset-0">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : customersError ? (
                <div className="flex flex-col justify-center items-center absolute inset-0 text-destructive p-4">
                  <p className="font-medium">Error loading customers</p>
                  <p className="text-sm mt-1">{customersError}</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  <p>No customers found</p>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {/* Simple table with horizontal scrolling using native scrollbars */}
                  <div className="border-b">
                    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <Table className="max-w-[500px]">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="h-9 py-0 px-2 w-[25%]">Name</TableHead>
                            <TableHead className="h-9 py-0 px-2 w-[20%]">Contact</TableHead>
                            <TableHead className="h-9 py-0 px-2 w-[15%]">Type</TableHead>
                            <TableHead className="h-9 py-0 px-2 w-[20%]">Membership</TableHead>
                            <TableHead className="h-9 py-0 px-2 w-[20%] text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                      </Table>
                    </div>
                  </div>

                  {/* Table body with both horizontal and vertical scrolling */}
                  <div className="overflow-auto flex-grow" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <Table className="max-w-[600px]">
                      <TableBody>
                        {customers.map((customer) => (
                          <ContextMenu key={customer.id}>
                            <ContextMenuTrigger>
                              <TableRow
                                className={`cursor-pointer h-10 hover:bg-accent ${selectedCustomer?.id === customer.id ? 'bg-accent' : ''}`}
                                onClick={() => handleCustomerSelect(customer)}
                              >
                                <TableCell className="py-2 px-2 w-[25%]">
                                  <div className="font-medium">{customer.name || 'Unknown'}</div>
                                </TableCell>
                                <TableCell className="py-2 px-2 w-[20%]">
                                  <div className="text-sm">{customer.contact || 'No contact'}</div>
                                </TableCell>
                                <TableCell className="py-2 px-2 w-[15%]">
                                  <div className="text-sm">{customer.type || '-'}</div>
                                </TableCell>
                                <TableCell className="py-2 px-2 w-[20%]">
                                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                    {customer.membership || 'Standard'}
                                  </span>
                                </TableCell>
                                <TableCell className="py-2 px-2 text-right w-[20%]">
                                  <div className="font-medium">₹{customer.wallet || 0}</div>
                                </TableCell>
                              </TableRow>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Customer
                              </ContextMenuItem>
                              <ContextMenuItem>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Add Balance
                              </ContextMenuItem>
                              <ContextMenuItem>
                                <Clock className="mr-2 h-4 w-4" />
                                View History
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Customer
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Section - Devices Grouped */}
        <div className="w-3/5 p-2">
          <Card className="h-full flex flex-col p-0">
            <CardContent className="flex-grow relative">
              {loading ? (
                <div className="flex justify-center items-center absolute inset-0">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : devicesError ? (
                <div className="flex flex-col justify-center items-center absolute inset-0 text-destructive p-4">
                  <p className="font-medium">Error loading devices</p>
                  <p className="text-sm mt-1">{devicesError}</p>
                </div>
              ) : (
                <ScrollArea className="h-full w-full">
                  <div className="p-1">
                    {deviceGroups.length === 0 ? (
                      <div className="flex justify-center items-center h-32 text-muted-foreground">
                        <p>No devices found</p>
                      </div>
                    ) : (
                      deviceGroups.map((group) => (
                        <div key={group.id} className="mb-6">
                          <div className="border-b border-foreground py-2">
                            <h3 className="text-lg px-2 py-2 text-foreground font-bold">
                              {group.name} {group.price > 0 && <span className="text-sm text-muted-foreground ml-2">(₹{group.price}/hour)</span>}
                            </h3>
                          </div>
                          <div className="grid grid-cols-10 gap-2 px-2 py-4">
                            {group.devices.map((device) => {
                              // Determine device card styling based on status
                              let cardStyle = "border";
                              let isDisabled = false;

                              if (device.status === 'Occupied') {
                                cardStyle = "border border-red-200 bg-red-500/20";
                              } else if (device.status === 'Maintainence') {
                                cardStyle = "border border-yellow-200 bg-yellow-50/30 opacity-60";
                                isDisabled = true;
                              } else if (device.status === 'Lost') {
                                cardStyle = "border border-purple-200 bg-purple-50/30";
                              } else if (device.status === 'Damaged') {
                                cardStyle = "border border-orange-200 bg-orange-50/30";
                              }

                              // Add selection styling
                              if (selectedDevice?.id === device.id) {
                                cardStyle += " ring-2 ring-primary";
                              }

                              return (
                                <ContextMenu key={device.id}>
                                  <ContextMenuTrigger>
                                    <div
                                      className={`${cardStyle} inline-flex flex-col gap-2 justify-center items-center rounded py-3 px-5 text-center bg-accent ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-accent/50'}`}
                                      onClick={() => !isDisabled && handleDeviceSelect(device)}
                                      onDoubleClick={() => !isDisabled && handleDeviceDoubleClick(device)}
                                    >
                                      <ComputerIcon className="h-8 w-8" />
                                      <div className="font-medium text-sm truncate">{device.name}</div>
                                    </div>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent>
                                    <ContextMenuItem
                                      onClick={() => {
                                        // Open session dialog for this device
                                        setSessionDevice(device);
                                        setClientLoggedIn(false);
                                        setLoginError("");
                                        setClientUsername("");
                                        setClientPassword("");
                                        setActiveTab("login");
                                        setDialogOpen(true);
                                      }}
                                      disabled={device.status === 'Occupied' || device.status === 'Maintainence'}
                                    >
                                      <Play className="mr-2 h-4 w-4 text-green-500" />
                                      Start Session
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                      onClick={() => handleStopSession(device)}
                                      disabled={device.status !== 'Occupied' || !device.current_session}
                                    >
                                      <StopCircle className="mr-2 h-4 w-4 text-red-500" />
                                      End Session
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem onClick={() => handleDevicePower(device, false)} disabled={device.status === 'Occupied' || device.status === 'Maintainence'}>
                                      <Power className="mr-2 h-4 w-4 text-green-500" />
                                      Power On
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => handleDevicePower(device, true)} disabled={device.status === 'Maintainence'}>
                                      <Power className="mr-2 h-4 w-4 text-red-500" />
                                      Power Off
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => handleDeviceReboot(device)} disabled={device.status === 'Maintainence'}>
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Reboot
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => handleTakeScreenshot(device)} disabled={device.status !== 'Occupied'}>
                                      <Camera className="mr-2 h-4 w-4" />
                                      Take Screenshot
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem
                                      onClick={() => {
                                        // Open client login dialog for this device
                                        setSessionDevice(device);
                                        setClientLoggedIn(false);
                                        setLoginError("");
                                        setClientUsername("");
                                        setClientPassword("");
                                        setActiveTab("login");
                                        setDialogOpen(true);
                                      }}
                                      disabled={device.status === 'Maintainence'}
                                    >
                                      <User className="mr-2 h-4 w-4" />
                                      Client Login
                                    </ContextMenuItem>
                                    <ContextMenuItem className="text-destructive" disabled={device.status === 'Maintainence' || device.status !== 'Occupied'}>
                                      <X className="mr-2 h-4 w-4" />
                                      Close Client
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Selected Device Details */}
        <div className="w-1/5 p-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow relative">
              {selectedDevice ? (
                <ScrollArea className="h-full w-full">
                  <div className="space-y-4 p-2">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">{selectedDevice.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedDevice.status === 'Available' ? 'bg-green-100 text-green-800' :
                        selectedDevice.status === 'Occupied' ? 'bg-blue-100 text-blue-800' :
                          selectedDevice.status === 'Maintainence' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {selectedDevice.status || 'Unknown'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Group:</span>
                        <span className="ml-2 font-medium">
                          {groups.find(g => g.id === selectedDevice.group)?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Price:</span>
                        <span className="ml-2 font-medium">
                          ₹{selectedDevice.price ||
                            (groups.find(g => g.id === selectedDevice.group)?.price || 0)}/hour
                        </span>
                      </div>
                      {selectedDevice.current_session && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Session:</span>
                          <span className="ml-2 font-medium text-blue-600">Active</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedDevice.updated)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-2">Actions</h3>
                      <div className="flex gap-2">
                        {selectedDevice.status === 'Occupied' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleStopSession(selectedDevice)}
                          >
                            <StopCircle className="h-4 w-4 mr-2 text-red-500" />
                            End Session
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setSessionDevice(selectedDevice);
                              setClientLoggedIn(false);
                              setLoginError("");
                              setClientUsername("");
                              setClientPassword("");
                              setActiveTab("login");
                              setDialogOpen(true);
                            }}
                            disabled={selectedDevice.status === 'Maintainence'}
                          >
                            <Play className="h-4 w-4 mr-2 text-green-500" />
                            Start Session
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDevicePower(selectedDevice)}
                        >
                          <Power className="h-4 w-4 mr-2" />
                          {selectedDevice.powerOff ? 'Power On' : 'Power Off'}
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDeviceReboot(selectedDevice)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reboot
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleTakeScreenshot(selectedDevice)}
                          disabled={selectedDevice.status !== 'Occupied'}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Screenshot
                        </Button>
                      </div>
                    </div>

                    {/* Latest Screenshot Section */}
                    <div className="pt-4">
                      <h3 className="text-sm font-medium mb-2">Latest Screenshot</h3>

                      {/* Show "Device is not in use" message when status is not Occupied */}
                      {selectedDevice.status !== 'Occupied' ? (
                        <div className="text-center py-4 text-sm border border-dashed border-border rounded-md bg-muted/30">
                          <div className="py-6 px-4">
                            <p className="text-muted-foreground font-medium">Device is not in use</p>
                            <p className="text-xs text-muted-foreground mt-1">Screenshots are only available for active sessions</p>
                          </div>
                        </div>
                      ) : screenshotsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : screenshotsError ? (
                        <div className="text-destructive text-center py-4 text-sm">
                          <p>Unable to load screenshot</p>
                          <p className="text-xs mt-1">Please try again later</p>
                        </div>
                      ) : deviceScreenshots.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4 text-sm border border-dashed border-border rounded-md">
                          <p className="py-6">No latest screenshot available</p>
                        </div>
                      ) : (
                        <div className="relative group">
                          {deviceScreenshots[0].image ? (
                            <>
                              <img
                                src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/screenshots/${deviceScreenshots[0].id}/${deviceScreenshots[0].image}`}
                                alt={`Screenshot of ${selectedDevice.name}`}
                                className="w-full h-auto rounded-md border border-border"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image";
                                }}
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2">
                                {new Date(deviceScreenshots[0].created).toLocaleString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </>
                          ) : (
                            <div className="text-center text-muted-foreground py-4 text-sm border border-dashed border-border rounded-md">
                              <p className="py-6">Screenshot file not found</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              ) : selectedCustomer ? (
                <ScrollArea className="h-full w-full">
                  <div className="p-2">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold">{selectedCustomer.name || 'Unknown'}</h2>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {selectedCustomer.membership || 'Standard'}
                      </span>
                    </div>

                    {/* Info grid - 2 columns */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mb-3">
                      <div className="flex items-center text-sm">
                        <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">Type:</span>
                        <span className="ml-1 font-medium text-xs truncate">{selectedCustomer.type || 'Unknown'}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <CreditCard className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">Wallet:</span>
                        <span className="ml-1 font-medium text-xs">₹{selectedCustomer.wallet || 0}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">Contact:</span>
                        <span className="ml-1 font-medium text-xs truncate">{selectedCustomer.contact || 'No contact'}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">Updated:</span>
                        <span className="ml-1 font-medium text-xs truncate">{formatDate(selectedCustomer.updated).split(',')[0]}</span>
                      </div>
                    </div>

                    {/* Email in full width since it's usually longer */}
                    <div className="flex items-center text-sm mb-3">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">Email:</span>
                      <span className="ml-1 font-medium text-xs truncate">{selectedCustomer.user?.email || 'No email'}</span>
                    </div>

                    <div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                          <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                          Add Balance
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <p>Select a customer or device to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments Sheet */}
        <Sheet open={pendingPaymentsOpen} onOpenChange={setPendingPaymentsOpen}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Pending Payments</SheetTitle>
              <SheetDescription>
                Collect payments for post-paid sessions
              </SheetDescription>
            </SheetHeader>
            <div className="py-1">
              <ScrollArea className="h-[calc(90vh-6rem)] pr-4">
                <div className="px-4">
                  {pendingPaymentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : pendingPaymentsError ? (
                    <div className="text-destructive text-center py-8">
                      Error loading pending payments
                    </div>
                  ) : pendingPayments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No pending payments found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingPayments.map(payment => {
                        // Find customer and device info
                        const customer = customers.find(c => c.id === payment.customer);
                        const device = devices.find(d => d.id === payment.device);

                        // Calculate duration in hours
                        const startTime = new Date(payment.in_time);
                        const endTime = new Date(payment.out_time);
                        const durationHours = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);

                        // Calculate pending amount for closed sessions
                        const isPendingBalance = payment.status === "Closed" && payment.amount_paid < payment.total_amount;
                        // Calculate the pending amount (either the balance or the full amount)
                        const pendingAmount = isPendingBalance
                          ? (payment.total_amount - payment.amount_paid)
                          : payment.total_amount;

                        // Determine card style based on payment type
                        const cardStyle = isPendingBalance
                          ? "border-yellow-200 bg-yellow-50/20"
                          : "border-blue-200 bg-blue-50/20";

                        return (
                          <div key={payment.id} className={`border ${cardStyle} rounded-lg p-4`}>
                            {/* Payment type badge */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{customer?.name || 'Unknown Customer'}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${isPendingBalance
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {isPendingBalance ? 'Balance Due' : 'Post-paid'}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{device?.name || 'Unknown Device'}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">₹{pendingAmount.toFixed(2)}</p>
                                {isPendingBalance && (
                                  <p className="text-xs text-muted-foreground">
                                    Paid: ₹{payment.amount_paid} of ₹{payment.total_amount}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {durationHours} hours ({new Date(payment.in_time).toLocaleString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    month: 'short',
                                    day: 'numeric'
                                  })})
                                </p>
                              </div>
                            </div>

                            {/* Session details */}
                            {isPendingBalance && (
                              <div className="bg-yellow-50 p-2 rounded-md mb-3 text-sm">
                                <p className="text-yellow-800">
                                  This session has a pending balance of ₹{pendingAmount.toFixed(2)}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                variant={isPendingBalance ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleCollectPayment(
                                  payment.id,
                                  isPendingBalance ? pendingAmount : payment.amount_total
                                )}
                              >
                                {isPendingBalance ? 'Collect Balance' : 'Collect Payment'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Two-Step Session Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {sessionDevice?.name || 'PC'} - Session Management
              </DialogTitle>
              <DialogDescription>
                Login first, then create a session for this device
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => {
              // Only allow changing to session tab if logged in
              if (value === "session" && !clientLoggedIn) {
                return;
              }
              setActiveTab(value);
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Client Login</TabsTrigger>
                <TabsTrigger value="session" disabled={!clientLoggedIn}>Create Session</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={clientUsername}
                      onChange={(e) => setClientUsername(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleClientLogin();
                        }
                      }}
                    />
                  </div>

                  {loginError && (
                    <div className="text-sm font-medium text-destructive">
                      {loginError}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleClientLogin}>
                      {clientLoggedIn ? 'Continue to Session' : 'Login & Continue'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Session Creation Tab */}
              <TabsContent value="session" className="space-y-4 py-4">
                <div className="space-y-4">
                  {/* Customer Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Select
                        value={session.customer}
                        onValueChange={(value) => handleSessionChange('customer', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name || 'Unknown'}
                              {customer.wallet ? ` (₹${customer.wallet})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Session Status</Label>
                      <Select
                        value={session.status}
                        onValueChange={(value) => handleSessionChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Booked">Booked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Payment Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_type">Payment Type</Label>
                      <Select
                        value={session.payment_type}
                        onValueChange={(value) => handleSessionChange('payment_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pre-paid">Pre-paid</SelectItem>
                          <SelectItem value="Post-paid">Post-paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_mode">Payment Mode</Label>
                      <Select
                        value={session.payment_mode}
                        onValueChange={(value) => handleSessionChange('payment_mode', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="Membership">Membership</SelectItem>
                          <SelectItem value="Wallet">Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Time Settings */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="in_time">Start Time</Label>
                        <Input
                          id="in_time"
                          type="datetime-local"
                          value={session.in_time.slice(0, 16)}
                          onChange={(e) => handleSessionChange('in_time', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="5"
                          step="5"
                          value={session.duration}
                          onChange={(e) => handleSessionChange('duration', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="out_time">End Time (Calculated)</Label>
                        <Input
                          id="out_time"
                          type="datetime-local"
                          value={session.out_time.slice(0, 16)}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Quick Add Time</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSessionChange('duration', parseInt(session.duration) + 60)}
                          >
                            + 60 min
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSessionChange('duration', parseInt(session.duration) + 30)}
                          >
                            + 30 min
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Display */}
                  <div className="bg-green-600 text-white px-3 py-2 rounded-sm text-center">
                    <span className="font-medium">
                      Session Time: {(session.duration / 60).toFixed(1)} hour(s) (
                      {new Date(session.in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                      {new Date(session.out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>

                  {/* Amount Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount_paid">Amount Paid</Label>
                      <Input
                        id="amount_paid"
                        type="number"
                        min="0"
                        step="1"
                        value={session.amount_paid}
                        onChange={(e) => handleSessionChange('amount_paid', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount_rate">Discount (%)</Label>
                      <Input
                        id="discount_rate"
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={session.discount_rate}
                        onChange={(e) => handleSessionChange('discount_rate', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Total Amount Display */}
                  <div className="flex justify-center items-center py-2">
                    <div className="p-3 flex flex-col items-center justify-center shadow-accent shadow rounded-2xl">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="text-2xl font-bold">₹{calculateSessionPrice()}</span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {sessionFormError && (
                    <div className="text-sm font-medium text-destructive text-center">
                      {sessionFormError}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setActiveTab('login')}>
                    Back to Login
                  </Button>
                  <Button
                    onClick={handleCreateSession}
                    disabled={isCreatingSession || !session.customer}
                  >
                    {isCreatingSession ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Start Session'
                    )}
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
