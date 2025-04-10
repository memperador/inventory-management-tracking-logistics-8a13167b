
-- Update the handle_new_user function to create tenants based on company_name metadata
-- and ensure proper user profile creation with email validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_tenant_id uuid;
  company_name text;
  first_name text;
  last_name text;
  user_email text;
BEGIN
  -- Validate that email exists
  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'Email is required for user creation';
  END IF;
  
  user_email := NEW.email;
  
  -- Get company name from user metadata or use a default
  company_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name', 
    CONCAT(COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'), '''s Company')
  );
  
  -- Extract first and last name with proper fallbacks
  first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(user_email, '@', 1));
  last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  
  -- Create a new tenant for this user
  INSERT INTO public.tenants (name) 
  VALUES (company_name) 
  RETURNING id INTO new_tenant_id;

  -- Insert into users table with the new tenant ID and admin role
  INSERT INTO public.users (id, tenant_id, role)
  VALUES (NEW.id, new_tenant_id, 'admin');
  
  -- Then insert into profiles table with guaranteed values
  INSERT INTO public.profiles (id, first_name, last_name, tenant_id)
  VALUES (
    NEW.id, 
    first_name,
    last_name,
    new_tenant_id
  );
  
  RETURN NEW;
END;
$function$;
