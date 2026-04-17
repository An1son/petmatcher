'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Trash2 } from 'lucide-react';

export function ConversationListItem({ conversation, href, otherPartyName, onDelete }) {
  const pet = conversation.pet;
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount || 0;
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const timeLabel = lastMessage
    ? new Date(lastMessage.created_at).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })
    : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(conversation.id);
    }
    setShowDropdown(false);
  };

  return (
    <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
      <Link href={href} className="flex flex-1 items-center gap-3 min-w-0">
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

      {/* Dropdown menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleDropdownToggle}
          className="flex-shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
          aria-label="Message options"
        >
          <ChevronDown className={`h-4 w-4 transition ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
