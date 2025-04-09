
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize Resend with your API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
console.log(`Resend API key exists: ${!!resendApiKey}`);

const resend = new Resend(resendApiKey);

// Initialize Supabase client with service role key for email verification
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Setup CORS headers
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
    console.log("Custom verification email function called");
    
    // Parse request body
    const body = await req.json();
    const { email, user_id, domain } = body;

    console.log(`Request received for email: ${email}`);
    console.log(`Domain provided: ${domain}`);
    console.log(`User ID: ${user_id}`);

    if (!email || !domain || !user_id) {
      console.error("Missing required fields:", { email: !!email, domain: !!domain, user_id: !!user_id });
      return new Response(
        JSON.stringify({ error: "Email, domain and user_id are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate a verification link using the Supabase Admin API
    try {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
        options: {
          redirectTo: `${domain}/auth?email_confirmed=true`,
        }
      });

      if (error) {
        console.error("Error generating verification link:", error);
        throw error;
      }

      if (!data?.properties?.action_link) {
        console.error("No verification link generated");
        throw new Error("No verification link was generated");
      }

      // Get the verification URL
      const verificationUrl = data.properties.action_link;
      console.log(`Generated verification URL: ${verificationUrl}`);

      // Send email via Resend
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: "Inventory Track Pro <no-reply@resend.dev>", 
        to: email,
        subject: "Verify your email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="margin-bottom: 15px; line-height: 1.5;">Thank you for signing up for Inventory Track Pro. Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="margin-top: 15px; color: #555; font-size: 14px;">If you did not sign up for Inventory Track Pro, you can safely ignore this email.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">This link will expire in 24 hours.</p>
          </div>
        `,
      });

      if (emailError) {
        console.error("Resend API error:", emailError);
        return new Response(
          JSON.stringify({ error: emailError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Email sent successfully:", emailData);
      return new Response(
        JSON.stringify({ success: true, messageId: emailData?.id }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (linkError) {
      console.error("Error creating verification link:", linkError);
      return new Response(
        JSON.stringify({ error: linkError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
