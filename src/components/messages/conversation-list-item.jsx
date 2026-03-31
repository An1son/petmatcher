'use client';

import Link from 'next/link';
import Image from 'next/image';

export function ConversationListItem({ conversation, href, otherPartyName }) {
  const pet = conversation.pet;
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount || 0;

  const timeLabel = lastMessage
    ? new Date(lastMessage.created_at).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      {/* Pet thumbnail */}
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
        {pet?.photos?.[0] ? (
          <Image
            src={pet.photos[0]}
            alt={pet.name}
            fill
            className="object-cover"
            sizes="56px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 text-lg">
            🐾
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{otherPartyName}</h3>
          {timeLabel && (
            <span className="ml-2 flex-shrink-0 text-xs text-gray-400">{timeLabel}</span>
          )}
        </div>
        <p className="text-xs text-orange-600 font-medium">Re: {pet?.name}</p>
        {lastMessage && (
          <p className="mt-0.5 truncate text-sm text-gray-500">
            {lastMessage.content}
          </p>
        )}
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
