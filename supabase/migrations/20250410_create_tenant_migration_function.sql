
-- Create a stored function that can bypass RLS to create a tenant and migrate a user
CREATE OR REPLACE FUNCTION public.create_tenant_and_migrate_user(p_tenant_name TEXT, p_user_id UUID) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Create the new tenant (will bypass RLS due to SECURITY DEFINER)
  INSERT INTO public.tenants (name, subscription_status, subscription_tier)
  VALUES (p_tenant_name, 'trialing', 'premium')
  RETURNING id INTO new_tenant_id;

  -- Update the user record to point to the new tenant
  UPDATE public.users SET tenant_id = new_tenant_id, role = 'admin'
  WHERE id = p_user_id;
  
  -- Also update the user's profile if it exists
  UPDATE public.profiles SET tenant_id = new_tenant_id 
  WHERE id = p_user_id;
  
  -- Set the trial end date (7 days from now)
  UPDATE public.tenants 
  SET trial_ends_at = NOW() + INTERVAL '7 days'
  WHERE id = new_tenant_id;
  
  -- Return success with the tenant ID
  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', new_tenant_id
  );
END;
$$;

-- Add comment to the function for documentation
COMMENT ON FUNCTION public.create_tenant_and_migrate_user(TEXT, UUID) IS 'Creates a new tenant and migrates a user to it while bypassing RLS policies';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_tenant_and_migrate_user(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_and_migrate_user(TEXT, UUID) TO service_role;
