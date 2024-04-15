import type { User } from "@/payload-types";
import type {
	CollectionAfterChangeHook,
	CollectionConfig,
} from "payload/types";

const createLocalProvider: CollectionAfterChangeHook<User> = async ({
	operation,
	doc,
	req: { payload },
}) => {
	if (operation !== "create") {
		return;
	}

	const userCount = await payload.find({
		collection: "users",
	});

	if (userCount.totalDocs > 1) {
		return;
	}

	const localProvider = await payload.create({
		collection: "providers",
		data: {
			name: "Local",
			issuer: "__local__",
			discovery: false,
			authorization_endpoint: "_",
			device_authorization_endpoint: "_",
			token_endpoint: "_",
			userinfo_endpoint: "_",
			revocation_endpoint: "_",
			jwks_uri: "_",
		},
	});

	doc.providers = [
		{
			provider: localProvider.id,
			id: doc.email,
		},
	];

	await payload.update({
		collection: "users",
		id: doc.id,
		data: doc,
	});
};

export const Users: CollectionConfig = {
	slug: "users",
	admin: {
		useAsTitle: "email",
	},
	auth: true,
	hooks: {
		afterChange: [createLocalProvider],
	},
	fields: [
		{
			type: "array",
			name: "providers",
			label: "Login Methods",
			fields: [
				{
					type: "relationship",
					name: "provider",
					label: "Login Method",
					relationTo: "providers",
					required: true,
				},
				{
					type: "text",
					name: "id",
					label: "ID",
					required: true,
				},
			],
		},
	],
};
