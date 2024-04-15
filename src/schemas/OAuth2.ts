import { z } from "zod";

export const OAuth2DiscoveryResponseSchema = z.object({
	issuer: z.string(),
	authorization_endpoint: z.string(),
	device_authorization_endpoint: z.string(),
	token_endpoint: z.string(),
	userinfo_endpoint: z.string(),
	revocation_endpoint: z.optional(z.string()),
	jwks_uri: z.optional(z.string()),
});
