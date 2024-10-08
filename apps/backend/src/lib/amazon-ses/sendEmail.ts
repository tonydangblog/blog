import { SESv2Client, SESv2ServiceException, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { get_error_message } from "@tonydangblog/error-handling";

import type { Env } from "@lib/types/env";

/**
 * Send email via Amazon SES.
 *
 * `sender`, `recipient`, and `replyTo` format can be in either of the following formats:
 * - Name with email (preferred) - "First Last \<name@example.com\>"
 * - Email only - "name@example.com"
 *
 * @param env - Cloudflare worker environmental variables.
 * @param sender - Email address of sender.
 * @param recipient - Email address of recipient.
 * @param replyTo - Email address to reply to.
 * @param subject - Subject line of email.
 * @param textBody - Text body of email.
 * @param htmlBody - HTML body of email.
 */
export async function sendEmail(
  env: Env,
  sender: string,
  recipient: string,
  replyTo: string,
  subject: string,
  textBody: string,
  htmlBody: string,
): Promise<Response> {
  const successResponse = new Response("Success: Email sent.", { status: 200 });

  // Don't send email in development or test environment.
  if (env.MODE !== "production") return successResponse;

  try {
    const client = new SESv2Client({
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
      region: "us-west-1",
    });

    const command = new SendEmailCommand({
      FromEmailAddress: sender,
      Destination: { ToAddresses: [recipient] },
      ReplyToAddresses: [replyTo],
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: textBody, Charset: "UTF-8" },
            Html: { Data: htmlBody, Charset: "UTF-8" },
          },
        },
      },
    });

    const res = await client.send(command);
    console.log("res:", res);

    if (res.$metadata.httpStatusCode === 200 && res.MessageId) {
      return successResponse;
    }

    return new Response("Non-200 response and/or no MessageId from Amazon SES", { status: 500 });
  } catch (error) {
    console.log(error);

    const status = error instanceof SESv2ServiceException ? error.$metadata.httpStatusCode : 500;

    return new Response(get_error_message(error), { status });
  }
}
