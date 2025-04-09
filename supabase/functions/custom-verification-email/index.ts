
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

// Initialize Resend with your API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
console.log(`Resend API key exists: ${!!resendApiKey}`); // Log if key exists, not the actual key

const resend = new Resend(resendApiKey);

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
    const { email, confirmation_url } = body;

    console.log(`Request received for email: ${email}`);
    console.log(`Original confirmation URL: ${confirmation_url}`);

    if (!email || !confirmation_url) {
      console.error("Missing required fields:", { email: !!email, confirmation_url: !!confirmation_url });
      return new Response(
        JSON.stringify({ error: "Email and confirmation URL are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract token from the original confirmation URL
    let token = "";
    try {
      const originalUrl = new URL(confirmation_url);
      token = originalUrl.searchParams.get("token") || "";
      console.log(`Extracted token: ${token.substring(0, 10)}...`);
    } catch (e) {
      console.error("Error extracting token:", e);
    }

    // Determine the correct domain to use
    let domain = req.headers.get('origin');
    const host = req.headers.get('host');
    const referer = req.headers.get('referer');
    
    console.log(`Request headers - Origin: ${domain}, Host: ${host}, Referer: ${referer}`);
    
    if (!domain) {
      // Try to extract domain from referer
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          domain = `${refererUrl.protocol}//${refererUrl.host}`;
          console.log(`Extracted domain from referer: ${domain}`);
        } catch (e) {
          console.error("Error extracting domain from referer:", e);
        }
      }
      
      // If still no domain, fallback to host
      if (!domain && host) {
        domain = `https://${host}`;
        console.log(`Using host as domain: ${domain}`);
      }
    }
    
    // Final fallback to a fixed URL if all else fails
    if (!domain || domain.includes('supabase')) {
      domain = "https://inventory-track-pro-e54f.lovable.dev";
      console.log(`Using fallback domain: ${domain}`);
    }

    // Construct the verification URL with the token
    const verificationUrl = token 
      ? `${domain}/auth?token=${token}&type=signup`
      : `${domain}/auth?email_confirmed=true`;
      
    console.log(`Final verification URL: ${verificationUrl}`);

    // Send email via Resend
    try {
      const { data, error } = await resend.emails.send({
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

      if (error) {
        console.error("Resend API error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Email sent successfully:", data);
      return new Response(
        JSON.stringify({ success: true, messageId: data?.id }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (emailError) {
      console.error("Error sending email via Resend:", emailError);
      return new Response(
        JSON.stringify({ error: emailError.message }),
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
