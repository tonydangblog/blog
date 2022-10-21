import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { SendEmailCommandOutput } from "@aws-sdk/client-ses";

import type { Env } from "@lib/types/env";

/**
 * Send email via AWS SES.
 *
 * @param env - Cloudflare worker environmental variables.
 * @param recipient - Email address of recipient.
 * @param subject - Subject line of email.
 * @param html - HTML body of email.
 * @param sender - Email address of sender. Default to AWS_SENDER env variable.
 */
export async function send_email(
  env: Env,
  recipient: string,
  subject: string,
  html: string,
  sender: string = env.AWS_SENDER
): Promise<SendEmailCommandOutput> {
  try {
    const client = new SESClient({
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
      region: "us-west-1",
    });

    const command = new SendEmailCommand({
      Source: sender,
      Destination: { ToAddresses: [recipient] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    });

    return await client.send(command);
  } catch (error: unknown) {
    return error as SendEmailCommandOutput;
  }
}