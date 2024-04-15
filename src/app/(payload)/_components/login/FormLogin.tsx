"use client";

export type FormLoginMethod = {
	type: "form";
	name: string;
	label: string;
	visible: "default" | "more" | "hidden";
};

type Props = {
	enabled?: boolean;
};

export function FormLogin({ enabled }: Props) {
	if (!enabled) {
		return <></>;
	}

	return (
		<form>
			<input type="text" />
		</form>
	);
}
