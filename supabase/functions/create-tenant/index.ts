
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

    // Extract company name from user metadata
    const companyName = user.user_metadata.company_name || `${user.user_metadata.first_name}'s Company`;

    // Create a new tenant
    const { data: tenantData, error: tenantError } = await supabaseClient
      .from('tenants')
      .insert({ name: companyName })
      .select('id')
      .single();

    if (tenantError) {
      throw new Error(`Error creating tenant: ${tenantError.message}`);
    }

    // Associate the user with the tenant
    const { error: userUpdateError } = await supabaseClient
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
