'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { MessageBubble } from '@/components/messages/message-bubble';
import { MessageInput } from '@/components/messages/message-input';
import { createClient } from '@/lib/supabase/client';

export default function ShelterChatPage({ params }) {
  const { id: conversationId } = use(params);
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadChat() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Fetch conversation with pet and adopter info
      const { data: convo, error: convoError } = await supabase
        .from('conversations')
        .select('*, pet:pets(id, name, photos), adopter:profiles!adopter_id(name, email)')
        .eq('id', conversationId)
        .single();

      if (convoError || !convo) {
        setIsLoading(false);
        return;
      }
      setConversation(convo);

      // Fetch messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      setMessages(msgs || []);

      // Mark unread messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      setIsLoading(false);
    }

    loadChat();
  }, [conversationId]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId || !userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender_id !== userId) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content) => {
    if (!userId || !conversationId) return;
    setSending(true);

    const supabase = createClient();
    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content,
      })
      .select()
      .single();

    if (!error && newMsg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    }

    setSending(false);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-bold">Conversation not found</h1>
          <button onClick={() => router.back()} className="text-orange-500 hover:underline">
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={() => router.push('/dashboard/messages')}
          className="rounded-full p-1 text-gray-600 hover:bg-gray-100"
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {conversation.pet?.photos?.[0] && (
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={conversation.pet.photos[0]}
              alt={conversation.pet.name}
              fill
              className="object-cover"
              sizes="40px"
              unoptimized
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold text-gray-900">
            {conversation.adopter?.name}
          </h1>
          <p className="truncate text-xs text-orange-600">
            Re: {conversation.pet?.name}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={msg.sender_id === userId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={sending} />
    </main>
  );
}
