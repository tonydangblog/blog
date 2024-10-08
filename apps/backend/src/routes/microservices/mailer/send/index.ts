import { getJwtPayloadFromRequestJson } from "@lib/jwt/getJwtPayloadFromRequestJson";
import { sendEmail } from "@lib/amazon-ses/sendEmail";
import type { Env } from "@lib/types/env";

export default async function send(request: Request, env: Env): Promise<Response> {
  const payload = await getJwtPayloadFromRequestJson(request, env);
  if (!payload) return new Response("Invalid JWT.", { status: 400 });

  // Extract claims from payload.
  const { sender, recipient, replyTo, subject, textBody, htmlBody } = payload;

  // Check payload claims are valid.
  if (
    typeof sender !== "string" ||
    typeof recipient !== "string" ||
    typeof replyTo !== "string" ||
    typeof subject !== "string" ||
    typeof textBody !== "string" ||
    typeof htmlBody !== "string"
  ) {
    return new Response("Invalid payload.", { status: 400 });
  }

  // Send email via Amazon SES.
  const res = await sendEmail(env, sender, recipient, replyTo, subject, textBody, htmlBody);

  return res;
}
