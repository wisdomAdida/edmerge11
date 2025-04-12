import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { encrypt, decrypt } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: number;
  content: string;
  senderId: number;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
};

type RecipientDetails = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string | null;
  role: string;
  studentLevel: string | null;
  isOnline: boolean;
};

/**
 * Hook to manage chat functionality
 * @param roomId The ID of the chat room
 */
export function useChat(roomId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientDetails, setRecipientDetails] = useState<RecipientDetails | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Set up WebSocket connection
  useEffect(() => {
    if (!roomId || !user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Join the room - make sure to match the server-side event type
      ws.send(JSON.stringify({
        type: 'join_room',
        roomId,
        userId: user.id,
        username: `${user.firstName} ${user.lastName}`
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket received:', data);
        
        // Handle different message types - make sure it matches the server-side message types
        if (data.type === 'chat_message' || data.type === 'message') {
          // Decrypt the message if it's a chat message
          if (data.messageType !== 'system') {
            data.content = await decrypt(data.content);
          }
          
          // Add the new message to the state
          setMessages(prev => [
            ...prev,
            {
              id: data.id,
              content: data.content,
              senderId: data.senderId,
              timestamp: data.timestamp,
              type: data.messageType,
              fileUrl: data.fileUrl,
              fileName: data.fileName
            }
          ]);
          
          // Mark the message as read if it's not from the current user
          if (data.senderId !== user.id) {
            markMessageAsRead(data.id);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      toast({
        title: 'Connection Error',
        description: 'Failed to establish real-time connection. Messages may be delayed.',
        variant: 'destructive'
      });
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    setSocket(ws);

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        // Make sure to use the same message type expected by the server
        ws.send(JSON.stringify({
          type: 'leave_room',
          roomId,
          userId: user.id,
          username: `${user.firstName} ${user.lastName}`
        }));
        ws.close();
      }
      setSocket(null);
    };
  }, [roomId, user, toast]);

  // Fetch chat messages
  const fetchMessages = useCallback(async () => {
    if (!roomId || !user) return;

    setIsLoadingMessages(true);
    setError(null);

    try {
      const response = await apiRequest('GET', `/api/messaging/messages/${roomId}`);
      
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Decrypt the messages
      const decryptedMessages = await Promise.all(data.map(async (message: Message) => {
        if (message.type !== 'system') {
          try {
            message.content = await decrypt(message.content);
          } catch (error) {
            console.error('Error decrypting message:', error);
            message.content = '[Encrypted Message]';
          }
        }
        return message;
      }));
      
      setMessages(decryptedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load messages. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [roomId, user, toast]);

  // Fetch recipient details
  const fetchRecipientDetails = useCallback(async () => {
    if (!roomId || !user) return;

    setIsLoadingRecipient(true);

    try {
      const response = await apiRequest('GET', `/api/messaging/recipient/${roomId}`);
      
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to fetch recipient details');
      }
      
      const data = await response.json();
      setRecipientDetails(data);
    } catch (error) {
      console.error('Error fetching recipient details:', error);
      // Don't set the main error state for this failure
    } finally {
      setIsLoadingRecipient(false);
    }
  }, [roomId, user]);

  // Load data when roomId changes
  useEffect(() => {
    if (roomId) {
      fetchMessages();
      fetchRecipientDetails();
    }
  }, [roomId, fetchMessages, fetchRecipientDetails]);

  // Send a message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!roomId || !user || !content.trim()) return false;

    try {
      // Encrypt the message
      const encryptedContent = await encrypt(content);
      
      const response = await apiRequest('POST', `/api/messaging/messages/${roomId}`, {
        content: encryptedContent,
        type: 'text'
      });
      
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to send message');
      }
      
      // The new message will be received through the WebSocket
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  }, [roomId, user, toast]);

  // Send a file message
  const sendFileMessage = useCallback(async (file: File): Promise<boolean> => {
    if (!roomId || !user || !file) return false;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);
      
      // Determine the message type based on the file type
      const isImage = file.type.startsWith('image/');
      formData.append('type', isImage ? 'image' : 'file');
      
      // Encrypt the file name or caption
      const encryptedCaption = await encrypt(file.name);
      formData.append('content', encryptedCaption);
      
      const response = await fetch('/api/messaging/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to upload file');
      }
      
      // The new message will be received through the WebSocket
      return true;
    } catch (error) {
      console.error('Error sending file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  }, [roomId, user, toast]);

  // Mark a message as read
  const markMessageAsRead = async (messageId: number) => {
    if (!user) return;
    
    try {
      await apiRequest('POST', `/api/messaging/read/${messageId}`);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all messages in this room as read
  const markMessagesAsRead = useCallback(async () => {
    if (!roomId || !user) return;
    
    try {
      await apiRequest('POST', `/api/messaging/read-all/${roomId}`);
      // Invalidate recent chats query to update unread counts
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/recent'] });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [roomId, user]);

  // Create a room ID for a new conversation
  const createRoomId = useCallback((userId1: number, userId2: number): string => {
    const sortedIds = [userId1, userId2].sort((a, b) => a - b);
    return `${sortedIds[0]}-${sortedIds[1]}`;
  }, []);

  return {
    messages,
    isLoadingMessages,
    isLoadingRecipient,
    recipientDetails,
    error,
    sendMessage,
    sendFileMessage,
    markMessagesAsRead,
    createRoomId
  };
}