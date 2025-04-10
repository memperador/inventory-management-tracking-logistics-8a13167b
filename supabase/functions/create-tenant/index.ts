
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`${req.method} request received to create-tenant function`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    let requestData;
    try {
      const bodyText = await req.text();
      console.log("Request body:", bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error("Empty request body");
      }
      
      requestData = JSON.parse(bodyText);
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error parsing request body: ${e.message}` 
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
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error: Missing environment variables"
        }),
        { 
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Service role client for admin operations
    const serviceRoleClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    // Handle different actions
    if (requestData.action === 'setTrial' && requestData.tenantId) {
      console.log("Setting trial for tenant:", requestData.tenantId);
      // Set trial for existing tenant
      const { error: trialError } = await serviceRoleClient
        .from('tenants')
        .update(requestData.trialData)
        .eq('id', requestData.tenantId);
        
      if (trialError) {
        console.error("Error setting trial:", trialError);
        throw new Error(`Error setting trial: ${trialError.message}`);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Trial settings updated successfully" 
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }
    
    // Handle user migration case
    if (requestData.isMigration && requestData.userId && requestData.tenantName) {
      console.log(`Migrating user ${requestData.userId} to new tenant ${requestData.tenantName}`);
      
      // Create a new tenant with service role to bypass RLS
      const { data: tenantData, error: tenantError } = await serviceRoleClient
        .from('tenants')
        .insert({ name: requestData.tenantName })
        .select('id')
        .single();

      if (tenantError) {
        console.error("Error creating tenant:", tenantError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Error creating tenant: ${tenantError.message}` 
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

      if (!tenantData || !tenantData.id) {
        console.error("No tenant data returned");
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to create tenant: No ID returned" 
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

      console.log(`New tenant created with ID: ${tenantData.id}`);

      // Associate the user with the tenant using service role
      const { error: userUpdateError } = await serviceRoleClient
        .from('users')
        .update({ tenant_id: tenantData.id })
        .eq('id', requestData.userId);

      if (userUpdateError) {
        console.error("Error associating user with tenant:", userUpdateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Error associating user with tenant: ${userUpdateError.message}` 
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

      console.log(`User ${requestData.userId} associated with tenant ${tenantData.id}`);
      
      // Update the profile's tenant_id if it exists
      const { error: profileUpdateError } = await serviceRoleClient
        .from('profiles')
        .update({ tenant_id: tenantData.id })
        .eq('id', requestData.userId);
      
      if (profileUpdateError) {
        console.warn(`Warning: Failed to update profile tenant: ${profileUpdateError.message}`);
      } else {
        console.log(`User profile updated with tenant ${tenantData.id}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User migrated to new tenant successfully",
          tenant_id: tenantData.id 
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }
    
    // Get the current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error getting user: ${userError.message}` 
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

    if (!user) {
      console.error("No user found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No user found" 
        }),
        { 
          status: 401, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Extract company name and email domain from user metadata
    const companyName = requestData.tenantName || user.user_metadata.company_name || `${user.user_metadata.first_name}'s Company`;
    const emailDomain = user.email ? user.email.split('@')[1] : null;

    // Check if a tenant with the same company name already exists
    const { data: existingCompanyTenants, error: companyTenantError } = await supabaseClient
      .from('tenants')
      .select('id, name')
      .ilike('name', companyName)
      .limit(1);

    if (companyTenantError) {
      console.error("Error checking existing tenants:", companyTenantError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error checking existing tenants: ${companyTenantError.message}` 
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
        console.error("Error checking domain users:", domainError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Error checking domain users: ${domainError.message}` 
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

      if (usersWithSameDomain && usersWithSameDomain.length > 0) {
        existingDomainTenant = usersWithSameDomain[0].tenant_id;
      }
    }

    // If tenant with same company name or domain exists, return that information
    if (existingCompanyTenants && existingCompanyTenants.length > 0) {
      console.log("Tenant with this company name already exists:", existingCompanyTenants[0].name);
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
      console.log("Users from this organization already exist, tenant ID:", existingDomainTenant);
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

    // Create a new tenant with service role to bypass RLS
    const { data: tenantData, error: tenantError } = await serviceRoleClient
      .from('tenants')
      .insert({ name: companyName })
      .select('id')
      .single();

    if (tenantError) {
      console.error("Error creating tenant:", tenantError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error creating tenant: ${tenantError.message}` 
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

    // Associate the user with the tenant using service role
    const { error: userUpdateError } = await serviceRoleClient
      .from('users')
      .update({ tenant_id: tenantData.id, role: 'admin' })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error("Error associating user with tenant:", userUpdateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error associating user with tenant: ${userUpdateError.message}` 
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
    console.error("Function error:", error);
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
