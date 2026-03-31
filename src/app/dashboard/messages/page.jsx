'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { ConversationListItem } from '@/components/messages/conversation-list-item';
import { createClient } from '@/lib/supabase/client';

export default function ShelterMessagesPage() {
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

      // Get shelter
      const { data: shelter } = await supabase
        .from('shelters')
        .select('id')
        .eq('owner_user_id', user.id)
        .single();

      if (!shelter) {
        setIsLoading(false);
        return;
      }

      // Fetch conversations with pet and adopter info
      const { data: convos } = await supabase
        .from('conversations')
        .select('*, pet:pets(id, name, photos), adopter:profiles!adopter_id(name)')
        .eq('shelter_id', shelter.id)
        .order('updated_at', { ascending: false });

      if (!convos || convos.length === 0) {
        setIsLoading(false);
        return;
      }

      // Enrich with last message and unread count
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
    <main className="min-h-dvh bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h2 className="mb-2 text-lg font-semibold text-gray-700">No messages yet</h2>
            <p className="text-gray-500">
              When adopters message you about a pet, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo) => (
              <ConversationListItem
                key={convo.id}
                conversation={convo}
                href={`/dashboard/messages/${convo.id}`}
                otherPartyName={convo.adopter?.name || 'Adopter'}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
