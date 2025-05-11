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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  MoreVertical,
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
  ComputerIcon
} from 'lucide-react'
import { usePocketBase } from '@/hooks/usePocketBase'
import { useRealTime, useRealTimeRecord } from '@/hooks/useRealTime'

export default function IndexPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceGroups, setDeviceGroups] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionDevice, setSessionDevice] = useState(null);
  const [activeTab, setActiveTab] = useState("session");
  const { updateRecord } = usePocketBase();
  const [session, setSession] = useState({
    device: "",
    in_time: "",
    out_time: "",
    payment_mode: "",
    payment_type: "",
    status: "",
    duration: 0,
  })

  // Use real-time hooks for customers and devices
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

  // Combine loading and error states
  const loading = customersLoading || devicesLoading;
  const error = customersError || devicesError;

  // Group devices by type
  const groupDevicesByType = (devices) => {
    const groups = {};

    devices.forEach(device => {
      const type = device.type || 'Other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(device);
    });

    return Object.keys(groups).map(type => ({
      type,
      devices: groups[type]
    }));
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

    setSessionDevice(device);
    setDialogOpen(true);
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

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
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
                <ScrollArea className="flex-1">
                  <div className="border-b">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-9 py-0 px-2 w-[30%]">Name</TableHead>
                          <TableHead className="h-9 py-0 px-2 w-[20%]">Contact</TableHead>
                          <TableHead className="h-9 py-0 px-2 w-[15%]">Type</TableHead>
                          <TableHead className="h-9 py-0 px-2 w-[15%]">Membership</TableHead>
                          <TableHead className="h-9 py-0 px-2 w-[20%] text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>
                  </div>
                  <Table className={'w-full'}>
                    <TableBody>
                      {customers.map((customer) => (
                        <ContextMenu key={customer.id}>
                          <ContextMenuTrigger>
                            <TableRow
                              className={`cursor-pointer h-10 hover:bg-accent ${selectedCustomer?.id === customer.id ? 'bg-accent' : ''}`}
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <TableCell className="py-2 px-2 w-[30%]">
                                <div className="font-medium truncate">{customer.name || 'Unknown'}</div>
                              </TableCell>
                              <TableCell className="py-2 px-2 w-[20%]">
                                <div className="text-sm truncate">{customer.contact || 'No contact'}</div>
                              </TableCell>
                              <TableCell className="py-2 px-2 w-[15%]">
                                <div className="text-sm">{customer.type || '-'}</div>
                              </TableCell>
                              <TableCell className="py-2 px-2 w-[15%]">
                                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                  {customer.membership || 'Standard'}
                                </span>
                              </TableCell>
                              <TableCell className="py-2 px-2 text-right w-[20%]">
                                <div className="font-medium">${customer.wallet || 0}</div>
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
                </ScrollArea>
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
                      <div key={group.type} className="">
                        <h3 className="font-medium text-lg mb-1 px-1 py-4">{group.type}</h3>
                        <div className="grid grid-cols-10 gap-1">
                          {group.devices.map((device) => {
                            // Determine device card styling based on status
                            let cardStyle = "border";
                            let isDisabled = false;

                            if (device.status === 'Occupied') {
                              cardStyle = "border border-red-200 bg-red-50/50";
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
                              cardStyle += "";
                            }

                            return (
                              <ContextMenu key={device.id}>
                                <ContextMenuTrigger>
                                  <div
                                    className={`${cardStyle} inline-flex flex-col gap-2 justify-center items-center rounded py-3 px-5 text-center ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-accent/50'}`}
                                    onClick={() => !isDisabled && handleDeviceSelect(device)}
                                    onDoubleClick={() => !isDisabled && handleDeviceDoubleClick(device)}
                                  >
                                    <ComputerIcon className="h-8 w-8" />
                                    <div className="font-medium text-sm truncate">{device.name}</div>
                                  </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                  <ContextMenuItem onClick={() => handleDevicePower(device, false)} disabled={device.status === 'Occupied' || device.status === 'Maintainence'}>
                                    <Power className="mr-2 h-4 w-4 text-green-500" />
                                    Start
                                  </ContextMenuItem>
                                  <ContextMenuItem onClick={() => handleDevicePower(device, true)} disabled={device.status === 'Maintainence'}>
                                    <Power className="mr-2 h-4 w-4 text-red-500" />
                                    Stop
                                  </ContextMenuItem>
                                  <ContextMenuItem onClick={() => handleDeviceReboot(device)} disabled={device.status === 'Maintainence'}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reboot
                                  </ContextMenuItem>
                                  <ContextMenuItem disabled={device.status === 'Maintainence' || device.status !== 'Occupied'}>
                                    <User className="mr-2 h-4 w-4" />
                                    Client Login
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
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
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">{selectedDevice.type || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Price:</span>
                      <span className="ml-2 font-medium">${selectedDevice.price || 0}/hour</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedDevice.updated)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Actions</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDevicePower(selectedDevice)}
                      >
                        <Power className="h-4 w-4 mr-2" />
                        {selectedDevice.powerOff ? 'Power On' : 'Power Off'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDeviceReboot(selectedDevice)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reboot
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : selectedCustomer ? (
              <ScrollArea className="h-full w-full">
                <div className="p-2">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold">{selectedCustomer.user?.name || 'Unknown'}</h2>
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
                      <span className="ml-1 font-medium text-xs">${selectedCustomer.wallet || 0}</span>
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

      {/* Session Dialog - Based on PocketBase Schema */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              New Session - {sessionDevice?.name || 'PC'}
            </DialogTitle>
            <DialogDescription>
              Create a new session for this device
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Customer Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
            </div>

            {/* Payment Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-paid">Pre-paid</SelectItem>
                    <SelectItem value="Post-paid">Post-paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_mode">Payment Mode</Label>
                <Select defaultValue="Cash">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Membership">Membership</SelectItem>
                    <SelectItem value="Pre-paid">Pre-paid</SelectItem>
                    <SelectItem value="Post-paid">Post-paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Start Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
