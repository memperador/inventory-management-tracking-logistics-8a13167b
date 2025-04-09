
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize Supabase client with service role key for email verification
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Get SMTP configuration from environment variables
const smtpHost = Deno.env.get("SMTP_HOST") || "";
const smtpPort = Number(Deno.env.get("SMTP_PORT") || "587");
const smtpUser = Deno.env.get("SMTP_USER") || "";
const smtpPass = Deno.env.get("SMTP_PASSWORD") || "";
const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL") || "no-reply@munetworks.io";
const smtpFromName = Deno.env.get("SMTP_FROM_NAME") || "Inventory Track Pro";

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

    // Strip any trailing slashes from domain
    let cleanDomain = domain;
    if (cleanDomain.endsWith('/')) {
      cleanDomain = cleanDomain.slice(0, -1);
    }
    
    // Check if the domain is a localhost URL and make sure it has the correct protocol
    if ((cleanDomain.includes('localhost') || cleanDomain.includes('127.0.0.1')) && !cleanDomain.startsWith('http')) {
      cleanDomain = `http://${cleanDomain}`;
    } else if (!cleanDomain.startsWith('http')) {
      cleanDomain = `https://${cleanDomain}`;
    }
    
    console.log(`Processed domain: ${cleanDomain}`);
    
    // Generate a verification link using the Supabase Admin API
    try {
      // Use absolute URL format to prevent incorrect domain concatenation
      const redirectTo = `${cleanDomain}/auth?email_confirmed=true`;
      console.log(`Using redirect URL: ${redirectTo}`);
      
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
        options: {
          redirectTo,
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

      // Get the verification URL - IMPORTANT: Don't modify this URL
      const verificationUrl = data.properties.action_link;
      console.log(`Generated verification URL: ${verificationUrl}`);

      // Extract the token from the URL for debugging purposes
      const urlObj = new URL(verificationUrl);
      const tokenHash = urlObj.searchParams.get('token_hash') || 'unknown';
      console.log(`Token hash in URL: ${tokenHash.substring(0, 10)}...`);

      // Initialize SMTP client
      const client = new SMTPClient({
        connection: {
          hostname: smtpHost,
          port: smtpPort,
          tls: true,
          auth: {
            username: smtpUser,
            password: smtpPass,
          },
        }
      });

      // Send email via SMTP
      const emailResponse = await client.send({
        from: {
          address: smtpFromEmail,
          name: smtpFromName
        },
        to: { address: email },
        subject: "Verify your email address",
        content: "text/html",
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

      console.log("Email sent successfully via SMTP");
      
      // Close the SMTP connection
      await client.close();
      
      return new Response(
        JSON.stringify({ success: true, messageId: "email-sent-via-smtp" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (linkError) {
      console.error("Error creating verification link or sending email:", linkError);
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
