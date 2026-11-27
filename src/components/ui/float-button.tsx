"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
  /**
   * outline — Get Demo style: white/outline rest → fill on hover
   * solid — Login style: fill rest → white/outline on hover
   * When two CTAs sit together, use one of each (never the same).
   */
  variant?: "outline" | "solid";
  pill?: boolean;
  compact?: boolean;
  className?: string;
};

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type AsLink = CommonProps & {
  href: string;
  type?: never;
  disabled?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export type FloatButtonProps = AsButton | AsLink;

function classNames({
  variant = "outline",
  pill = true,
  compact = false,
  className = "",
}: Pick<CommonProps, "variant" | "pill" | "compact" | "className">) {
  return [
    "btn-float",
    variant === "solid" ? "is-solid" : "is-outline",
    pill ? "is-pill" : "",
    compact ? "is-compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Fortify-style floating gradient CTA. Prefer opposite variants when pairing. */
export function FloatButton(props: FloatButtonProps) {
  const {
    children,
    variant = "outline",
    pill = true,
    compact = false,
    className = "",
  } = props;
  const classes = classNames({ variant, pill, compact, className });

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes} onClick={props.onClick as never}>
        <span className="btn-float-label">{children}</span>
      </Link>
    );
  }

  const { type = "button", ...rest } = props as AsButton;
  return (
    <button type={type} className={classes} {...rest}>
      <span className="btn-float-label">{children}</span>
    </button>
  );
}
