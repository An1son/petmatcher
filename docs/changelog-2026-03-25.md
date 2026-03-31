# PetMatcher Changelog - March 25, 2026

## Features Added

### 1. Location & Price Filtering

Adopters can now filter pets by location and adoption fee, both on the browse page and in their saved preferences.

**Database changes:**
- Added `adoption_fee` column (NUMERIC, nullable) to `pets` table
- Added `preferred_province` (TEXT) and `max_adoption_fee` (NUMERIC) columns to `profiles` table
- Migration file: `supabase/add-filters-migration.sql`
- Seed data file: `supabase/add-adoption-fees.sql` (populates fees for all 16 existing pets)

**Browse page (`src/app/browse/page.jsx`):**
- Added a collapsible filter bar below the header with Province dropdown, City text input, and Max Adoption Fee input
- Filters apply before the matching algorithm scores and sorts pets
- Saved filter preferences load automatically on page load
- "Apply Filters" button saves preferences to the user's profile for persistence across sessions
- "Clear" button resets all filters
- Active filter indicator badge shows when filters are applied
- Adoption fee displayed on pet card overlay next to location
- "Start Over" respects active filters

**Shelter pet forms:**
- `src/app/dashboard/pets/new/page.jsx` - Added "Adoption Fee ($)" input field and Zod validation
- `src/app/dashboard/pets/[id]/edit/page.jsx` - Same adoption fee field, pre-fills existing value

**Pet detail page (`src/app/pet/[id]/page.jsx`):**
- Adoption fee displayed next to location with a dollar sign icon

**Favorites page (`src/app/favorites/page.jsx`):**
- Adoption fee shown in pet info line

**Preferences page (`src/app/profile/preferences/page.jsx`):**
- Added "Location & Budget" section with preferred province and max adoption fee inputs
- Values saved to profile and used as default filters on the browse page

---

### 2. Chat / Messaging System

Full bidirectional messaging between adopters and shelters, with real-time updates powered by Supabase Realtime.

**Database changes (`supabase/add-chat-system.sql`):**
- `conversations` table - Links an adopter, shelter, and pet with a unique constraint per triple
- `messages` table - Stores message content, sender, read status, and timestamps
- Indexes on conversation lookups and message ordering
- Trigger to auto-update `conversations.updated_at` when a new message is inserted
- Row Level Security policies:
  - Adopters see only their own conversations
  - Shelters see only conversations directed to their shelter
  - Only conversation participants can read/send messages
  - Only recipients can mark messages as read
- Realtime enabled on `messages` table via `ALTER PUBLICATION supabase_realtime ADD TABLE messages`

**Shared components (`src/components/messages/`):**
- `message-bubble.jsx` - Chat bubble (orange for own messages, gray for received)
- `message-input.jsx` - Text input with send button, supports Enter key to send and Shift+Enter for newlines
- `conversation-list-item.jsx` - Conversation preview with pet photo thumbnail, other party's name, pet name, last message preview, timestamp, and unread count badge

**Adopter pages:**
- `src/app/messages/page.jsx` - Conversation list showing all chats, ordered by most recently updated, with unread badges
- `src/app/messages/[id]/page.jsx` - Chat thread with header (shelter name, pet photo), scrollable message list, real-time subscription for live updates, auto-marks messages as read

**Shelter pages:**
- `src/app/dashboard/messages/page.jsx` - Conversation list for shelter staff showing adopter names and pet context
- `src/app/dashboard/messages/[id]/page.jsx` - Chat thread identical in functionality to adopter side, with shelter-appropriate styling

**Integration points:**
- `src/app/pet/[id]/page.jsx` - Added orange "Message" button in shelter info section; creates or opens an existing conversation scoped to the specific pet
- `src/app/favorites/page.jsx` - Added message icon button on each pet card; creates or opens a conversation with that pet's shelter
- `src/components/layout/bottom-nav.jsx` - Added "Messages" nav item with unread notification badge (polls every 30 seconds)
- `src/app/dashboard/page.jsx` - Added "Messages" quick action card alongside "Manage Pets" on the shelter dashboard
- `src/middleware.js` - Added `/messages` to protected routes requiring authentication

---

### 3. Google Maps Integration

Embedded Google Maps on the pet detail page showing the shelter's location.

**Environment variable:**
- Added `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`

**Pet detail page (`src/app/pet/[id]/page.jsx`):**
- Google Maps iframe embed placed to the right of shelter information (side-by-side on desktop, stacked on mobile)
- Uses the shelter's full address for the map pin
- Lazy-loaded for performance
- Only renders if the API key environment variable is set

---

### 4. UI / Layout Improvements

**Centered content on wide screens:**
- `src/app/pet/[id]/page.jsx` - Pet info section wrapped in `max-w-2xl mx-auto`
- `src/app/favorites/page.jsx` - Favorites list wrapped in `max-w-2xl mx-auto`
- `src/app/messages/page.jsx` - Messages list wrapped in `max-w-2xl mx-auto`
- `src/app/profile/page.jsx` - Stats, menu items, and logout button wrapped in `max-w-2xl mx-auto`

**Bottom navigation (`src/components/layout/bottom-nav.jsx`):**
- Expanded from 3 items (Browse, Favorites, Profile) to 4 items (Browse, Favorites, Messages, Profile)
- Active state detection improved to match sub-routes (e.g., `/messages/123` highlights Messages)
- Unread message count badge with orange indicator (caps at "9+")

**Shelter dashboard (`src/app/dashboard/page.jsx`):**
- Quick actions changed from single card to 2-column grid (Manage Pets + Messages)

---

## Files Changed

### New Files
| File | Description |
|------|-------------|
| `supabase/add-filters-migration.sql` | Migration for adoption_fee and filter preference columns |
| `supabase/add-adoption-fees.sql` | Seed data with adoption fees for all 16 existing pets |
| `supabase/add-chat-system.sql` | Migration for conversations and messages tables with RLS |
| `src/components/messages/message-bubble.jsx` | Chat message bubble component |
| `src/components/messages/message-input.jsx` | Chat text input with send button |
| `src/components/messages/conversation-list-item.jsx` | Conversation list item component |
| `src/app/messages/page.jsx` | Adopter conversation list page |
| `src/app/messages/[id]/page.jsx` | Adopter chat thread page |
| `src/app/dashboard/messages/page.jsx` | Shelter conversation list page |
| `src/app/dashboard/messages/[id]/page.jsx` | Shelter chat thread page |

### Modified Files
| File | Changes |
|------|---------|
| `.env.local` | Added `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| `src/middleware.js` | Added `/messages` to protected routes |
| `src/components/layout/bottom-nav.jsx` | Added Messages icon, unread badge, polling |
| `src/app/browse/page.jsx` | Added filter bar, filter logic, adoption fee display |
| `src/app/pet/[id]/page.jsx` | Added adoption fee, Message button, Google Maps, centered layout |
| `src/app/favorites/page.jsx` | Added adoption fee display, message button, centered layout |
| `src/app/messages/page.jsx` | Centered layout |
| `src/app/profile/page.jsx` | Centered layout |
| `src/app/profile/preferences/page.jsx` | Added province and max fee preferences |
| `src/app/dashboard/page.jsx` | Added Messages quick action card |
| `src/app/dashboard/pets/new/page.jsx` | Added adoption fee field |
| `src/app/dashboard/pets/[id]/edit/page.jsx` | Added adoption fee field |

---

## Setup Instructions

Run the following SQL scripts in your Supabase SQL Editor in order:

1. `supabase/add-filters-migration.sql` - Adds new columns
2. `supabase/add-adoption-fees.sql` - Populates adoption fees for existing pets
3. `supabase/add-chat-system.sql` - Creates chat tables and enables realtime

Then in Supabase Dashboard:
- Go to **Database > Publications** and verify `messages` is listed under `supabase_realtime`
