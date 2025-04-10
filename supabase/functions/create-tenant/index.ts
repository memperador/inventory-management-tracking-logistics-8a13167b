
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      throw new Error(`Error getting user: ${userError.message}`);
    }

    if (!user) {
      throw new Error("No user found");
    }

    // Extract company name and email domain from user metadata
    const companyName = user.user_metadata.company_name || `${user.user_metadata.first_name}'s Company`;
    const emailDomain = user.email ? user.email.split('@')[1] : null;

    // Check if a tenant with the same company name already exists
    const { data: existingCompanyTenants, error: companyTenantError } = await supabaseClient
      .from('tenants')
      .select('id, name')
      .ilike('name', companyName)
      .limit(1);

    if (companyTenantError) {
      throw new Error(`Error checking existing tenants: ${companyTenantError.message}`);
    }

    // If domain exists, check if any tenant has users with the same email domain
    let existingDomainTenant = null;
    if (emailDomain) {
      // Get users with the same email domain
      const { data: usersWithSameDomain, error: domainError } = await supabaseClient
        .from('users')
        .select('tenant_id')
        .join('tenants', { 'tenants.id': 'users.tenant_id' })
        .filter('email', 'ilike', `%@${emailDomain}`)
        .limit(1);

      if (domainError && domainError.code !== 'PGRST116') {
        throw new Error(`Error checking domain users: ${domainError.message}`);
      }

      if (usersWithSameDomain && usersWithSameDomain.length > 0) {
        existingDomainTenant = usersWithSameDomain[0].tenant_id;
      }
    }

    // If tenant with same company name or domain exists, return that information
    if (existingCompanyTenants && existingCompanyTenants.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          conflict: true,
          message: "A tenant with this company name already exists",
          existingTenantName: existingCompanyTenants[0].name
        }),
        { 
          status: 409, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    if (existingDomainTenant) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          conflict: true,
          message: "Users from your organization already exist in our system",
          existingTenantId: existingDomainTenant
        }),
        { 
          status: 409, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Use service role for tenant creation to bypass RLS
    const serviceRoleClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create a new tenant with service role to bypass RLS
    const { data: tenantData, error: tenantError } = await serviceRoleClient
      .from('tenants')
      .insert({ name: companyName })
      .select('id')
      .single();

    if (tenantError) {
      throw new Error(`Error creating tenant: ${tenantError.message}`);
    }

    // Associate the user with the tenant using service role
    const { error: userUpdateError } = await serviceRoleClient
      .from('users')
      .update({ tenant_id: tenantData.id, role: 'admin' })
      .eq('id', user.id);

    if (userUpdateError) {
      throw new Error(`Error associating user with tenant: ${userUpdateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Tenant created and associated with user",
        tenant_id: tenantData.id 
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
