import Link from "next/link";
import PropertyCardS1 from "@/components/estate/propertyCard.s1";
import {
  formatCountLabel,
  formatPropertyPrice,
  getBathroomValue,
  getBedroomValue,
  getDisplayValue,
  getSpaceValue,
  type PropertyItem,
} from "@/lib/property-presentation";

type PropertyListingsPageProps = {
  emptyMessage: string;
  heading: string;
  intro: string;
  listingsLabel: string;
  loadError?: boolean;
  loadErrorMessage?: string;
  page: number;
  pageCount: number;
  properties: PropertyItem[];
  total: number;
  buildPageHref: (page: number) => string;
};

export function PropertyListingsPage({
  buildPageHref,
  emptyMessage,
  heading,
  intro,
  listingsLabel,
  loadError = false,
  loadErrorMessage = "Unable to load properties.",
  page,
  pageCount,
  properties,
  total,
}: PropertyListingsPageProps) {
  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-12 lg:px-8 lg:pt-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-deep/70">
            {listingsLabel}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pt-8 pb-12 lg:px-8 lg:pt-10 lg:pb-16">
        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            {loadErrorMessage}
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            {emptyMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {properties.map((property, index) => (
              <PropertyCardS1
                key={`${property.id}-${index}`}
                className="h-full shadow-none"
                href={`/properties/${property.id}`}
                imageAlt={getDisplayValue(property.name)}
                imageSrc={property.images?.[0] ?? "/logo.png"}
                title={getDisplayValue(property.name)}
                status={getDisplayValue(property.for)}
                price={formatPropertyPrice(property.price, property.on_calling)}
                propertyType={getDisplayValue(property.type)}
                location={[property.location, property.city].map((value) => value?.trim()).filter(Boolean).join(", ") || "N/A"}
                bedroomLabel={formatCountLabel(getBedroomValue(property.features), "Beds")}
                bathroomLabel={formatCountLabel(getBathroomValue(property.features), "Baths")}
                areaLabel={getSpaceValue(property.area)}
              />
            ))}
          </div>
        )}

        {!loadError ? (
          <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-600">
              Page {page} of {pageCount} • {total} listings
            </p>
            <div className="flex gap-2">
              <Link
                href={hasPrev ? buildPageHref(page - 1) : "#"}
                aria-disabled={!hasPrev}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  hasPrev
                    ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                Previous
              </Link>
              <Link
                href={hasNext ? buildPageHref(page + 1) : "#"}
                aria-disabled={!hasNext}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  hasNext
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
