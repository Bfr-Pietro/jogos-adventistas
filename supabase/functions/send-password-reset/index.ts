
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  username: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username, resetUrl }: PasswordResetRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Pietro - Jogos Adventistas <pietro@jogosadventistas.com>",
      to: [email],
      subject: "Recuperação de senha - Jogos Adventistas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">
              ⚽ Jogos Adventistas 🏐
            </h1>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Olá ${username},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Recebemos uma solicitação para redefinir a sua senha no <strong>Jogos Adventistas</strong>, 
              nossa plataforma dedicada à organização de jogos de futebol e vôlei entre amigos da comunidade.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              Se você fez essa solicitação, clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #10b981, #3b82f6); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                🔒 Redefinir Minha Senha
              </a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Observação:</strong> Por segurança, este link é válido por apenas 60 minutos.
              </p>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Se você não solicitou a troca de senha, ignore este e-mail — nenhuma alteração será feita.
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              Caso precise de ajuda ou tenha qualquer dúvida, estamos à disposição.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #4b5563; margin-bottom: 10px;">
                Um forte abraço,<br>
                <strong>Pietro - Jogos Adventistas</strong>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                📧 pietro@jogosadventistas.com
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                🌐 jogos-adventistas.vercel.app
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
