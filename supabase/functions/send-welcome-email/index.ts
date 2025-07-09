
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  username: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username, confirmationUrl }: WelcomeEmailRequest = await req.json();

    // Input validation for security
    if (!email || !username || !confirmationUrl) {
      throw new Error("Missing required fields");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Sanitize username
    const sanitizedUsername = username.replace(/[<>]/g, '').slice(0, 100);

    const emailResponse = await resend.emails.send({
      from: "Jogos Adventistas <jogosadventistas@gmail.com>",
      to: [email],
      subject: "Confirme seu e-mail para ativar sua conta no Jogos Adventistas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10b981; text-align: center; margin-bottom: 30px;">
              ⚽ Jogos Adventistas 🏐
            </h1>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Olá ${sanitizedUsername},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              <strong>Seja muito bem-vindo ao Jogos Adventistas!</strong><br>
              É um prazer ter você com a gente nessa comunidade de organização de jogos de futebol e vôlei entre amigos.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              Antes de começarmos, precisamos confirmar que este e-mail realmente pertence a você.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: linear-gradient(135deg, #10b981, #059669); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                👉 Confirmar Meu E-mail
              </a>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Após a confirmação, sua conta estará ativada e você poderá participar de jogos com facilidade!
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              Se você não fez esse cadastro, pode simplesmente ignorar este e-mail.
            </p>
            
            <div style="background-color: #dcfce7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #166534; margin: 0; font-size: 14px; text-align: center;">
                <strong>Estamos animados com sua chegada e prontos para ajudar no que for preciso!</strong>
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #4b5563; margin-bottom: 10px;">
                Abraço,<br>
                <strong>Equipe Jogos Adventistas</strong>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                📧 jogosadventistas@gmail.com
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
