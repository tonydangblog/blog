import { describe, expect, it } from "vitest";
import { fromUint8Array } from "js-base64";
import * as Y from "yjs";

import { sign_jwt } from "@lib/jwt/sign-jwt";
import { env } from "@lib/testing/env";

import api_route from "../index";

describe("/microservices/yjs/merge", () => {
  const doc1 = new Y.Doc();
  const doc1Binary = Y.encodeStateAsUpdate(doc1);
  const doc1Base64 = fromUint8Array(doc1Binary);

  const doc2 = new Y.Doc();
  const doc2Binary = Y.encodeStateAsUpdate(doc2);
  const doc2Base64 = fromUint8Array(doc2Binary);

  it.each([
    // Valid payload.
    [doc1Base64, doc2Base64, true, 200, '{"document":"AAA="}'],

    // Invalid base64 document strings.
    [
      "invalid-doc-string",
      "invalid-doc-string",
      true,
      400,
      "Error merging documents.",
    ],

    // Invalid payload claims.
    [0, 0, true, 400, "Invalid payload."],

    // Invalid JWT.
    [0, 0, false, 400, "Invalid JWT."],
  ])(
    "serverDocument: %s, clientDocument: %s, isValidJwt: %s, expectedStatus: %s, expectedBody: %s",
    async (
      serverDocument,
      clientDocument,
      isValidJwt,
      expectedStatus,
      expectedBody,
    ) => {
      // GIVEN Payload and whether JWT is valid.

      // WHEN Request is made to api route with jwt.
      const jwt = await sign_jwt(env, { serverDocument, clientDocument });
      const request = new Request(
        "https://tonydang.blog/microservices/yjs/merge",
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
