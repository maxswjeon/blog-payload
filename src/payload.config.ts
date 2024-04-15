import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical"; // editor-import
import { buildConfig } from "payload/config";

import { LoginForm } from "./app/(payload)/_components/login";

import { Providers } from "./collections/Providers";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	admin: {
		user: Users.slug,
		components: {
			afterLogin: [LoginForm],
		},
	},
	collections: [Users, Providers],
	editor: lexicalEditor({}),
	// plugins: [payloadCloud()], // TODO: Re-enable when cloud supports 3.0
	secret: process.env.PAYLOAD_SECRET || "",
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
	db: mongooseAdapter({
		url: process.env.DATABASE_URI || "",
		connectOptions: {
			auth: {
				username: process.env.DATABASE_USERNAME,
				password: process.env.DATABASE_PASSWORD,
			},
		},
	}),
	// Sharp is now an optional dependency -
	// if you want to resize images, crop, set focal point, etc.
	// make sure to install it and pass it to the config.

	// This is temporary - we may make an adapter pattern
	// for this before reaching 3.0 stable

	sharp,
});
