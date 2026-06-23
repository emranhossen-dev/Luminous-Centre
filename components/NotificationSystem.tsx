'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// Note: Since we are using a custom auth mechanism in some places, 
// a direct supabase-js client could also be used here if you pass the ANON key.
import { createClient } from '@supabase/supabase-js';

// We initialize the client using the anon key. 
// For real RLS, you'd want the user's auth token injected here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export function NotificationSystem({ userId }: { userId?: string }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId || !supabaseUrl) return;

    // Set up Realtime subscription on the 'notifications' table
    // Filter specifically for this user's notifications if possible
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new;
          console.log('Realtime Notification Received!', newNotification);
          
          // Display the toast notification
          toast.info(
            <div>
              <strong>{newNotification.title}</strong>
              <p className="text-sm">{newNotification.message}</p>
            </div>,
            {
              position: "top-right",
              autoClose: 5000,
            }
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // This is a headless component, it just renders null but maintains the websocket connection
  return null;
}
