
export interface ContentModerationItem {
  id: string;
  article_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  moderator_id: string | null;
  moderated_at: string | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  articles: {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    created_at: string;
    user_id: string;
    profiles: {
      id: string;
      full_name: string | null;
      email: string | null;
    } | null;
  } | null;
}
