
-- Create a function to get user profiles with usernames for the organizer panel
CREATE OR REPLACE VIEW public.user_list AS
SELECT 
    p.id,
    p.username,
    u.email,
    u.created_at,
    u.last_sign_in_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.user_list TO authenticated;

-- Create RLS policy for the view (only for reference, views inherit from base tables)
-- The organizer will be able to see this through the application logic
