import { Progress as ProgressPrimitive } from "bits-ui";
import { tv, type VariantProps } from "tailwind-variants";

const progressVariants = tv({
	base: "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
});

type Variant = VariantProps<typeof progressVariants>;

type Props = ProgressPrimitive.Props & {
	class?: string;
	variant?: Variant["variant"];
};

export {
	type Props,
	//
	type Props as ProgressProps,
	//
	progressVariants,
};

