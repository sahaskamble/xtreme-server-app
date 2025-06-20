import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRealTime } from '@/hooks/useRealTime';
import { usePocketBase } from '@/hooks/usePocketBase';
import { toast } from 'sonner';
import { Send, MessageCircle, Users, Monitor, CheckCheck, Check } from 'lucide-react';
import pb from '@/lib/pocketbase/pb';

export default function ChatPage() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch messages with real-time updates
  const {
    data: messages = [],
    loading: messagesLoading,
    error: messagesError
  } = useRealTime('message', {
    fetchInitial: true,
    queryParams: { 
      sort: 'created',
      expand: 'sender,device'
    }
  });

  // Fetch devices for device selection
  const {
    data: devices = [],
    loading: devicesLoading
  } = useRealTime('devices', {
    fetchInitial: true
  });

  // Fetch clients for client selection
  const {
    data: clients = [],
    loading: clientsLoading
  } = useRealTime('clients', {
    fetchInitial: true
  });

  // Form for sending messages
  const messageForm = useForm({
    defaultValues: {
      message: '',
      device: '',
      sender: ''
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter messages based on selected device or client
  const filteredMessages = messages.filter(msg => {
    if (selectedDevice) {
      return msg.device === selectedDevice;
    }
    if (selectedClient) {
      return msg.sender === selectedClient;
    }
    return true;
  });

  // Send message function
  const onSendMessage = async (data) => {
    try {
      if (!data.message.trim()) {
        toast.error("Please enter a message");
        return;
      }

      const messageData = {
        message: data.message.trim(),
        device: selectedDevice || data.device,
        sender: null, // Server messages don't have a sender (client)
        is_from_client: false,
        is_read: true
      };

      await pb.collection('message').create(messageData);
      console.log("Message sent successfully");
      toast.success("Message sent successfully!");
      
      messageForm.reset({ message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      await pb.collection('message').update(messageId, { is_read: true });
      console.log("Message marked as read");
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Get unread message count
  const unreadCount = messages.filter(msg => msg.is_from_client && !msg.is_read).length;

  return (
    <div className="flex flex-col h-screen p-6 gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chat System</h1>
          <p className="text-muted-foreground">
            Communicate with clients and manage device messages
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {unreadCount} Unread
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar */}
        <Card className="w-80 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter messages by device or client
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {/* Device Filter */}
            <div className="space-y-2">
              <Label>Filter by Device</Label>
              <Select value={selectedDevice || ""} onValueChange={(value) => {
                setSelectedDevice(value || null);
                setSelectedClient(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All devices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All devices</SelectItem>
                  {devices.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        {device.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Filter */}
            <div className="space-y-2">
              <Label>Filter by Client</Label>
              <Select value={selectedClient || ""} onValueChange={(value) => {
                setSelectedClient(value || null);
                setSelectedDevice(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {client.name || client.username}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(selectedDevice || selectedClient) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedDevice(null);
                  setSelectedClient(null);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
              {selectedDevice && (
                <Badge variant="outline">
                  Device: {devices.find(d => d.id === selectedDevice)?.name}
                </Badge>
              )}
              {selectedClient && (
                <Badge variant="outline">
                  Client: {clients.find(c => c.id === selectedClient)?.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          {/* Messages */}
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading messages...
                  </div>
                ) : messagesError ? (
                  <div className="text-center text-destructive py-8">
                    Error loading messages
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages found
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_from_client ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.is_from_client
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm">{message.message}</p>
                          {!message.is_from_client && (
                            <div className="flex items-center">
                              {message.is_read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>
                            {message.is_from_client ? 'Client' : 'Server'}
                            {message.expand?.device && ` • ${message.expand.device.name}`}
                          </span>
                          <span>{new Date(message.created).toLocaleTimeString()}</span>
                        </div>
                        {message.is_from_client && !message.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(message.id)}
                            className="mt-1 h-6 text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="mt-4">
              <div className="flex gap-2">
                {!selectedDevice && (
                  <Select
                    value={messageForm.watch('device')}
                    onValueChange={(value) => messageForm.setValue('device', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map(device => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Input
                  placeholder="Type your message..."
                  {...messageForm.register('message')}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
