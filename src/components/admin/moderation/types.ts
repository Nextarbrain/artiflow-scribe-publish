
export interface ContentModerationItem {
  id: string;
  article_id: string;
  moderator_id: string | null;
  status: string;
  feedback: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
  articles?: {
    title: string;
    content: string;
    user_id: string;
    profiles?: {
      full_name: string | null;
      email: string | null;
    } | null;
  } | null;
}
