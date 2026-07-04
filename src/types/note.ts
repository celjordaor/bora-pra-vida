export interface QuickNote {
  id: string
  user_id: string
  content: string
  photo_url: string | null
  converted_to_activity_id: string | null
  created_at: string
}
