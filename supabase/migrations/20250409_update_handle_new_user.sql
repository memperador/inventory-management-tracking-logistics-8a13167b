
-- Update the handle_new_user function to create tenants based on company_name metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_tenant_id uuid;
  company_name text;
BEGIN
  -- Get company name from user metadata or use a default
  company_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name', 
    CONCAT(NEW.raw_user_meta_data->>'first_name', '''s Company')
  );
  
  -- Create a new tenant for this user
  INSERT INTO public.tenants (name) 
  VALUES (company_name) 
  RETURNING id INTO new_tenant_id;

  -- Insert into users table with the new tenant ID and admin role
  INSERT INTO public.users (id, tenant_id, role)
  VALUES (NEW.id, new_tenant_id, 'admin');
  
  -- Then insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name, tenant_id)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',
    new_tenant_id
  );
  
  RETURN NEW;
END;
$function$;
