-- Chat System Migration
-- Run this in your Supabase SQL Editor
-- Creates conversations and messages tables for adopter-shelter messaging

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adopter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(adopter_id, shelter_id, pet_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_conversations_adopter ON conversations(adopter_id);
CREATE INDEX idx_conversations_shelter ON conversations(shelter_id);
CREATE INDEX idx_conversations_pet ON conversations(pet_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(conversation_id, created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Reuse the existing update_updated_at_column() function
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update conversation.updated_at when a new message is inserted
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations: adopters see their own, shelters see their shelter's
CREATE POLICY "Adopters can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = adopter_id);

CREATE POLICY "Shelters can view their conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shelters
      WHERE shelters.id = conversations.shelter_id
      AND shelters.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Adopters can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = adopter_id);

-- Messages: only conversation participants can read/write
CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.adopter_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM shelters s
          WHERE s.id = c.shelter_id
          AND s.owner_user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.adopter_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM shelters s
          WHERE s.id = c.shelter_id
          AND s.owner_user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Recipients can mark messages as read" ON messages
  FOR UPDATE USING (
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.adopter_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM shelters s
          WHERE s.id = c.shelter_id
          AND s.owner_user_id = auth.uid()
        )
      )
    )
  );

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
