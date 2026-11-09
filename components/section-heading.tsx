type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-deep/70">
        {eyebrow}
      </p>
      <h2 className="section-title mt-4 font-display leading-tight text-slate-950">
        {title}
      </h2>
      <p className="section-description mt-4 leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}
