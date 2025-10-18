import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";
const ToggleGroupContext = React.createContext({});
export const ToggleGroup = React.forwardRef(({ className, variant, size, ...props }, ref) => (_jsx(ToggleGroupContext.Provider, { value: { variant, size }, children: _jsx(ToggleGroupPrimitive.Root, { ref: ref, className: cn("flex items-center justify-center gap-1", className), ...props }) })));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;
export const ToggleGroupItem = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext);
    return (_jsx(ToggleGroupPrimitive.Item, { ref: ref, className: cn(toggleVariants({
            variant: context.variant ?? variant,
            size: context.size ?? size,
            className,
        })), ...props }));
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
