var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { cn } from "@/lib/utils";
var EnhancedCard = React.forwardRef(function (_a, ref) {
    var className = _a.className, _b = _a.variant, variant = _b === void 0 ? "default" : _b, _c = _a.interactive, interactive = _c === void 0 ? false : _c, ariaLabel = _a.ariaLabel, children = _a.children, props = __rest(_a, ["className", "variant", "interactive", "ariaLabel", "children"]);
    var baseClasses = "rounded-xl border relative overflow-hidden";
    var variantClasses = {
        default: "bg-card text-card-foreground shadow",
        glass: "glass-card gradient-border",
        stat: "stat-card glass-card gradient-border"
    };
    var interactiveClasses = interactive
        ? "hover-tilt cursor-pointer focus-ring-enhanced"
        : "";
    return (<div ref={ref} className={cn(baseClasses, variantClasses[variant], interactiveClasses, className)} role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined} aria-label={ariaLabel} {...props}>
        {variant === "glass" || variant === "stat" ? (<span className="aura" aria-hidden="true"/>) : null}
        {children}
      </div>);
});
EnhancedCard.displayName = "EnhancedCard";
var EnhancedCardHeader = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}/>);
});
EnhancedCardHeader.displayName = "EnhancedCardHeader";
var EnhancedCardTitle = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props}/>);
});
EnhancedCardTitle.displayName = "EnhancedCardTitle";
var EnhancedCardDescription = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}/>);
});
EnhancedCardDescription.displayName = "EnhancedCardDescription";
var EnhancedCardContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("p-6 pt-0", className)} {...props}/>);
});
EnhancedCardContent.displayName = "EnhancedCardContent";
var EnhancedCardFooter = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props}/>);
});
EnhancedCardFooter.displayName = "EnhancedCardFooter";
export { EnhancedCard, EnhancedCardHeader, EnhancedCardFooter, EnhancedCardTitle, EnhancedCardDescription, EnhancedCardContent };
