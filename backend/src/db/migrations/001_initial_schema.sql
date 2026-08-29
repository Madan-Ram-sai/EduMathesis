-- Enable pgcrypto extension for gen_random_uuid() if required in older postgres versions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    avatar_url TEXT DEFAULT '',
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    oauth_provider VARCHAR(50) DEFAULT NULL,
    oauth_id VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. EMAIL VERIFICATIONS
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. PASSWORD RESETS
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. REFRESH TOKENS
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jti VARCHAR(255) UNIQUE NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    replaced_by VARCHAR(255) DEFAULT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. TEACHER REQUESTS
CREATE TABLE IF NOT EXISTS teacher_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. COMMUNITIES
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 7. COMMUNITY MEMBERS
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_community VARCHAR(50) DEFAULT 'student' CHECK (role_in_community IN ('student', 'teacher')),
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (community_id, user_id)
);

-- 8. INVITE LINKS
CREATE TABLE IF NOT EXISTS invite_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    max_uses INTEGER DEFAULT NULL,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. CONTENTS (shared parent for videos + posts)
-- Every video and every post has a matching row here with the SAME id.
-- This is what comments reference — one real FK instead of parent_type/parent_id.
CREATE TABLE IF NOT EXISTS contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'post')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 10. VIDEOS (subtype of contents — video-specific fields only)
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    video_url TEXT NOT NULL,
    thumbnail_url TEXT DEFAULT ''
);

-- 11. POSTS (subtype of contents — post-specific fields only)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
    post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('announcement', 'doubt', 'general')),
    content TEXT NOT NULL
);

-- 12. COMMENTS (references contents — works for both videos AND posts automatically)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE DEFAULT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 11. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    file_url TEXT DEFAULT '',
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 12. ASSIGNMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'graded')),
    grade VARCHAR(50) DEFAULT '',
    feedback TEXT DEFAULT '',
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (assignment_id, student_id)
);

-- 13. CHAT REQUESTS
CREATE TABLE IF NOT EXISTS chat_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    responded_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_sender_receiver_different CHECK (sender_id <> receiver_id)
);

-- 14. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_two_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_one_id, user_two_id),
    CONSTRAINT check_conversation_users_different CHECK (user_one_id <> user_two_id)
);

-- 15. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('new_assignment', 'new_video', 'doubt_reply', 'chat_request', 'teacher_approved')),
    ref_type VARCHAR(50) NOT NULL,
    ref_id UUID NOT NULL,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE DEFAULT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Keep audit timestamps in the database so every SQL writer gets consistent
-- behaviour. PostgreSQL has no automatic ON UPDATE timestamp column.
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'users', 'email_verifications', 'password_resets', 'refresh_tokens',
        'teacher_requests', 'communities', 'community_members', 'invite_links',
        'contents', 'assignments', 'assignment_submissions', 'comments',
        'chat_requests', 'conversations', 'chat_messages', 'notifications'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 'set_updated_at', table_name);
        EXECUTE format(
            'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            'set_updated_at',
            table_name
        );
    END LOOP;
END;
$$;

-- Foreign-key columns are not indexed automatically by PostgreSQL.
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contents_community_id ON contents(community_id);
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(content_type);
CREATE INDEX IF NOT EXISTS idx_assignments_community_id ON assignments(community_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_comments_content_id ON comments(content_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);