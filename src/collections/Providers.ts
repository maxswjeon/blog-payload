import type { Provider } from "@/payload-types";
import { APIError } from "payload/errors";
import type {
	CollectionBeforeChangeHook,
	CollectionBeforeDeleteHook,
	CollectionBeforeValidateHook,
	CollectionConfig,
} from "payload/types";

import { OAuth2DiscoveryResponseSchema } from "@/schemas/OAuth2";

const queryEndpoints: CollectionBeforeValidateHook<Provider> = async ({
	data,
	originalDoc,
}) => {
	if (!data) {
		return;
	}

	const document = { ...originalDoc, ...data };

	if (!document.issuer) {
		throw new APIError("Unable to find issuer URL", 400, {
			original: originalDoc,
			updated: data,
		});
	}

	if (document.issuer === "__local__") {
		return document;
	}

	if (!document.discovery) {
		return document;
	}

	const response = await (async () => {
		try {
			const url = new URL(document.issuer || "");
			url.pathname = ".well-known/openid-configuration";

			return await fetch(url.toString());
		} catch (error: unknown) {
			throw new APIError("Failed to fetch OIDC discovery document", 400, {
				error,
			});
		}
	})();

	const discovery = await (async () => {
		try {
			const json = await response.json();

			return OAuth2DiscoveryResponseSchema.parse(json);
		} catch (error: unknown) {
			throw new APIError("Failed to parse OIDC discovery document", 400, {
				error,
			});
		}
	})();

	return { ...document, ...discovery };
};

const preventDefaultModify: CollectionBeforeChangeHook<Provider> = async ({
	req: { payload },
	operation,
	data,
	originalDoc,
}) => {
	if (operation === "create" && data?.issuer === "__local__") {
		const providers = await payload.find({ collection: "providers" });
		console.log(providers);
		if (providers.totalDocs === 0) {
			return;
		}

		throw new APIError("Cannot create local provider", 400);
	}

	if (operation !== "update" || !originalDoc) {
		return;
	}

	const localIssuer = await payload.findByID({
		collection: "providers",
		id: originalDoc.id,
	});
	if (localIssuer.issuer === "__local__") {
		throw new APIError("Cannot modify local provider", 400);
	}
};

const preventDefaultDelete: CollectionBeforeDeleteHook = async ({
	req: { payload },
	id,
}) => {
	const data = await payload.findByID({ collection: "providers", id });
	if (data.issuer === "__local__") {
		throw new APIError("Cannot delete local provider", 400);
	}
};

export const Providers: CollectionConfig = {
	slug: "providers",
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "issuer"],
	},
	hooks: {
		beforeValidate: [queryEndpoints],
		beforeChange: [preventDefaultModify],
		beforeDelete: [preventDefaultDelete],
	},
	fields: [
		{
			type: "text",
			name: "name",
			label: "Name",
			required: true,
			unique: true,
		},
		{
			type: "text",
			name: "issuer",
			label: "Issuer",
			required: true,
		},
		{
			type: "checkbox",
			name: "discovery",
			label: "Use OIDC Discovery",
			defaultValue: true,
		},
		{
			type: "text",
			name: "authorization_endpoint",
			label: "Authorization Endpoint",
			required: true,
			admin: {
				condition: (_, siblingData) => siblingData.discovery === false,
			},
		},
		{
			type: "text",
			name: "device_authorization_endpoint",
			label: "Device Authorization Endpoint",
			required: true,
			admin: {
				condition: (_, siblingData) => siblingData.discovery === false,
			},
		},
		{
			type: "text",
			name: "token_endpoint",
			label: "Token Endpoint",
			required: true,
			admin: {
				condition: (_, siblingData) => siblingData.discovery === false,
			},
		},
		{
			type: "text",
			name: "userinfo_endpoint",
			label: "Userinfo Endpoint",
			required: true,
			admin: {
				condition: (_, siblingData) => siblingData.discovery === false,
			},
		},
		{
			type: "text",
			name: "revocation_endpoint",
			label: "Revocation Endpoint",
			admin: {
				condition: (_, siblingData) => siblingData.discovery === false,
			},
		},
		{
			type: "text",
			name: "jwks_uri",
			label: "JWKS URI",
			admin: {
				condition: (_, siblingData) => siblingData.discovery === false,
			},
		},
	],
};
