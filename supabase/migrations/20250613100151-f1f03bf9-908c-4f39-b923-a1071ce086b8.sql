
-- Ensure nextarmain@gmail.com has admin role
-- First, get the user ID for nextarmain@gmail.com from auth.users
-- Then insert admin role if it doesn't exist

-- Insert admin role for nextarmain@gmail.com (Google OAuth user)
-- We'll use the email to find the user and assign admin role
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin'::app_role
FROM auth.users au
WHERE au.email = 'nextarmain@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = au.id AND ur.role = 'admin'::app_role
);

-- Also ensure the profile exists for this user
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name') as full_name,
  COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture') as avatar_url,
  au.created_at,
  now() as updated_at
FROM auth.users au
WHERE au.email = 'nextarmain@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
  updated_at = now();
