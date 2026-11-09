import Link from "next/link";

type PropertyCardFact = {
  icon?: "bed" | "bath" | "area";
  label: string;
};

export type PropertyCardS1Props = {
  agentImageAlt?: string;
  agentImageSrc?: string | null;
  areaLabel?: string;
  bathroomLabel?: string;
  bedroomLabel?: string;
  className?: string;
  href?: string;
  imageAlt: string;
  imageSrc: string;
  isSaved?: boolean;
  location: string;
  price: string;
  pricePeriod?: string;
  priceTag?: string;
  propertyType: string;
  saveLabel?: string;
  status: string;
  title: string;
};

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-2">
      <path d="M3 11V6.5A1.5 1.5 0 0 1 4.5 5h4A2.5 2.5 0 0 1 11 7.5V11" />
      <path d="M11 11V7.5A2.5 2.5 0 0 1 13.5 5h4A1.5 1.5 0 0 1 19 6.5V11" />
      <path d="M3 11h18v7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 18v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 15h18" strokeLinecap="round" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-2">
      <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" strokeLinejoin="round" />
      <path d="M6 12V5.5A2.5 2.5 0 0 1 8.5 3H9a2 2 0 0 1 2 2" strokeLinecap="round" />
      <path d="M9 7h4" strokeLinecap="round" />
      <path d="M7 21h10" strokeLinecap="round" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-2">
      <path d="M7 3h10v18H7z" strokeLinejoin="round" />
      <path d="M10 7h4M10 11h4M10 15h4" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ isSaved }: { isSaved: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`size-5 stroke-[2.2] ${
        isSaved ? "fill-blue-600 stroke-blue-600" : "fill-none stroke-slate-700"
      }`}
    >
      <path
        d="M20.8 5.8a5.1 5.1 0 0 0-7.2 0L12 7.4l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8a5.1 5.1 0 0 0 0-7.2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FactIcon({ icon }: { icon: PropertyCardFact["icon"] }) {
  if (icon === "bed") return <BedIcon />;
  if (icon === "bath") return <BathIcon />;
  if (icon === "area") return <AreaIcon />;
  return null;
}

function formatTitle(value: string) {
  return value
    .trim()
    .replace(/\b(And|For|From|In|Of|The|To|With)\b/g, (match) => match.toLowerCase());
}

function formatStatus(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "sale" || normalized === "for sale") return "For sale";
  if (normalized === "rent" || normalized === "for rent") return "For rent";
  return value;
}

/*
::neup.documentation::property-card-s1

Reusable estate property card component for image-led listings with status,
price, location, key facts, optional agent avatar, and save affordance.

::end
*/
export function PropertyCardS1({
  areaLabel = "1,300 sq.ft",
  bathroomLabel = "2 Bathrooms",
  bedroomLabel = "3 Bedrooms",
  className = "",
  href,
  imageAlt,
  imageSrc,
  isSaved = false,
  price,
  pricePeriod = "month",
  saveLabel = "Save property",
  status,
  title,
}: PropertyCardS1Props) {
  const facts: PropertyCardFact[] = [
    { icon: "bed", label: bedroomLabel },
    { icon: "bath", label: bathroomLabel },
    { icon: "area", label: areaLabel },
  ];
  const displayTitle = formatTitle(title);
  const displayStatus = formatStatus(status);

  const imageContent = (
    <img
      src={imageSrc}
      alt={imageAlt}
      width={1040}
      height={690}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover object-center transition duration-500 ease-out group-hover/card:scale-[1.04]"
    />
  );

  return (
    <article
      className={`group/card relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white font-sans shadow-[0_6px_18px_rgba(15,23,42,0.05)] ${className}`}
    >
      <div className="relative aspect-[1.5] overflow-hidden bg-slate-100">
        {href ? (
          <Link
            href={href}
            aria-label={`View ${displayTitle}`}
            className="block h-full w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-300/50"
          >
            {imageContent}
          </Link>
        ) : (
          imageContent
        )}

        <div className="absolute left-4 top-4 max-w-[54%] truncate rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-normal leading-none text-white shadow-sm shadow-emerald-700/20">
          {displayStatus}
        </div>

        <button
          type="button"
          aria-pressed={isSaved}
          aria-label={saveLabel}
          className="absolute right-4 top-4 z-20 inline-flex size-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/50"
        >
          <HeartIcon isSaved={isSaved} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4 py-3">
        <h3 className="card-title line-clamp-2 font-bold leading-[1.26] text-slate-950 transition-colors duration-300 group-hover/card:text-brand-deep">
          {href ? (
            <Link
              href={href}
              className="relative z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/50"
            >
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover/card:bg-[length:100%_1.5px]">
                {displayTitle}
              </span>
            </Link>
          ) : (
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover/card:bg-[length:100%_1.5px]">
              {displayTitle}
            </span>
          )}
        </h3>

        <div className="mt-1.5 flex h-7 items-center">
          <p className="card-desc min-w-0 truncate whitespace-nowrap font-normal leading-none text-slate-950 transition-colors duration-300 group-hover/card:text-brand-deep">
            {price} <span className="text-sm font-normal">/ {pricePeriod}</span>
          </p>
        </div>

        <div className="my-2 h-px bg-slate-200" aria-hidden="true" />

        <div className="flex h-8 min-w-0 items-center gap-4 text-[0.88rem] font-normal leading-5 text-slate-600">
          {facts.map((fact, index) => (
            <div key={`${fact.icon ?? "fact"}-${index}`} className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-slate-500">
                <FactIcon icon={fact.icon} />
              </span>
              <span className="min-w-0 truncate">{fact.label}</span>
            </div>
          ))}
        </div>

      </div>
    </article>
  );
}

export default PropertyCardS1;
