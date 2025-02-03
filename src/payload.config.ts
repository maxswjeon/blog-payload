import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";

import { Providers } from "./collections/Providers";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function getS3Credentials() {
	return process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
		? {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			}
		: undefined;
}

function getDatabaseURL() {
	return `mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}?authSource=admin`;
}

export default buildConfig({
	admin: {
		user: Users.slug,
		components: {
			afterLogin: ["@/app/(payload)/_components/login#LoginForm"],
		},
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},
	collections: [Users, Providers],
	editor: lexicalEditor({}),
	plugins: [
		s3Storage({
			collections: {},
			bucket: process.env.S3_BUCKET || "",
			config: {
				credentials: getS3Credentials(),
				region: process.env.AWS_REGION,
			},
		}),
	],
	secret: process.env.PAYLOAD_SECRET || "",
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
	db: mongooseAdapter({
		url: getDatabaseURL(),
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
