'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { ConversationListItem } from '@/components/messages/conversation-list-item';
import { createClient } from '@/lib/supabase/client';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function fetchConversations() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      // Fetch conversations with pet and shelter info
      const { data: convos } = await supabase
        .from('conversations')
        .select('*, pet:pets(id, name, photos), shelter:shelters(name)')
        .eq('adopter_id', user.id)
        .order('updated_at', { ascending: false });

      if (!convos || convos.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch last message and unread count for each conversation
      const enriched = await Promise.all(
        convos.map(async (convo) => {
          const [lastMsgRes, unreadRes] = await Promise.all([
            supabase
              .from('messages')
              .select('content, created_at, sender_id')
              .eq('conversation_id', convo.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single(),
            supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', convo.id)
              .eq('is_read', false)
              .neq('sender_id', user.id),
          ]);

          return {
            ...convo,
            lastMessage: lastMsgRes.data || null,
            unreadCount: unreadRes.count || 0,
          };
        })
      );

      setConversations(enriched);
      setIsLoading(false);
    }

    fetchConversations();
  }, []);

  return (
    <main className="min-h-dvh pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-xl font-bold">
          <MessageSquare className="mr-2 inline-block h-5 w-5 text-orange-500" />
          Messages
        </h1>
        <p className="text-sm text-gray-500">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="mx-auto max-w-2xl p-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h2 className="mb-2 text-lg font-semibold text-gray-700">No messages yet</h2>
            <p className="mb-4 text-gray-500">
              Find a pet you love and message the shelter!
            </p>
            <Link href="/browse">
              <Button>Browse Pets</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo) => (
              <ConversationListItem
                key={convo.id}
                conversation={convo}
                href={`/messages/${convo.id}`}
                otherPartyName={convo.shelter?.name || 'Shelter'}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
