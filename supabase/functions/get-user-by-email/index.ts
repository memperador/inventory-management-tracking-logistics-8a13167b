
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials for edge function')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
    
    // Parse request body
    const requestData = await req.json()
    const { email } = requestData
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email parameter is required' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Query for user with the specified email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      throw userError
    }
    
    // Find the specific user by email
    const user = users?.users?.find(u => u.email === email)
    
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found', email }),
        { 
          status: 404, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Return only necessary user information to protect sensitive data
    return new Response(
      JSON.stringify({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing the request' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
