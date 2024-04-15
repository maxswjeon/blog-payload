import type { FormLoginMethod } from "./FormLogin";
import type { OAuthLoginMethod } from "./OAuthLogin";

type LoginMethod = OAuthLoginMethod | FormLoginMethod;

export async function LoginForm() {
	// const payload = await getPayloadHMR({ config });

	// const methods = await payload.find({
	// 	collection: "providers",
	// });

	// const awaitedConfig = await importConfig("../../../../payload.config.ts");
	// const payload = await getPayload({ config: awaitedConfig });

	// const methods = await payload.find({
	// 	collection: "providers",
	// });

	// const url = new URL(location.href);

	// if (!methods?.length) {
	// 	return <></>;
	// }

	// const Elements = [];
	// for (const method of methods) {
	// 	if (method.visible === "default") {
	// 		Elements.push(method);
	// 	}
	// }

	return <></>;
}
