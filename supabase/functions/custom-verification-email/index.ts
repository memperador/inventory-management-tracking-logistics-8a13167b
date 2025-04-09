
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

    console.log(`Request received with body: ${JSON.stringify(body, null, 2)}`);

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

    // Extract domain to prevent incorrect domain in links
    let verificationUrl = confirmation_url;
    try {
      // Ensure the URL is absolute and uses the correct domain
      const urlObj = new URL(confirmation_url);
      console.log(`Original URL domain: ${urlObj.origin}`);
      
      // If the URL contains localhost, replace it with the request origin 
      if (urlObj.hostname.includes('localhost')) {
        console.log("Detected localhost in URL, attempting to fix with request origin");
        
        // Extract the origin from the request headers
        const requestOrigin = req.headers.get('origin');
        if (requestOrigin) {
          const requestUrl = new URL(requestOrigin);
          urlObj.protocol = requestUrl.protocol;
          urlObj.host = requestUrl.host;
          verificationUrl = urlObj.toString();
          console.log(`Fixed URL to: ${verificationUrl}`);
        } else {
          console.log("Could not determine request origin, using original URL");
        }
      }
    } catch (urlError) {
      console.error("Error processing URL:", urlError);
    }

    // Log the request for debugging
    console.log(`Sending verification email to: ${email}`);
    console.log(`Confirmation URL: ${verificationUrl}`);

    // Send email via Resend
    try {
      const { data, error } = await resend.emails.send({
        from: "Inventory Track Pro <no-reply@resend.dev>", // Change to your branded email
        to: email,
        subject: "Confirm Your Signup",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333; margin-bottom: 20px;">Confirm Your Email Address</h2>
            <p style="margin-bottom: 15px; line-height: 1.5;">Thank you for signing up for Inventory Track Pro. Please confirm your email address to get started.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirm Email Address</a>
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
