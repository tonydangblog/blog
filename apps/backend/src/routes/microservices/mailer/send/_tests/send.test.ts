import { describe, expect, it } from "vitest";

import { sign_jwt } from "@lib/jwt/sign-jwt";
import { env } from "@lib/testing/env";

import api_route from "../index";

describe("/microservices/mailer/send", () => {
  it.each([
    // Valid payload.
    [
      "test@example.com",
      "Recipient Name",
      "Subject",
      "Body HTML",
      true,
      202,
      "",
    ],

    // Invalid payload.
    [0, 0, 0, 0, true, 400, "Invalid payload."],

    // Invalid JWT.
    [0, 0, 0, 0, false, 400, "Invalid JWT."],
  ])(
    "email: %s, name: %s, subject: %s, html: %s, isValidJwt: %s, expectedStatus: %s, expectedBody: %s",
    async (
      email,
      name,
      subject,
      html,
      isValidJwt,
      expectedStatus,
      expectedBody,
    ) => {
      // GIVEN Payload and whether JWT is valid.

      // WHEN Request is made to api route with jwt.
      const jwt = await sign_jwt(env, { email, name, subject, html });
      const request = new Request(
        "https://tonydang.blog/microservices/mailer/send",
        {
          method: "POST",
          body: JSON.stringify({ jwt: isValidJwt ? jwt : "invalid_jwt" }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const res = await api_route(request, env);

      // THEN Expected status code and body text is returned in response.
      expect(res.status).to.equal(expectedStatus);
      expect(await res.text()).to.equal(expectedBody);
    },
  );
});
