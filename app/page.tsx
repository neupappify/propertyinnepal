import Link from "next/link";
import { DragScrollCarousel } from "@/components/drag-scroll-carousel";
import PropertyCardS1 from "@/components/estate/propertyCard.s1";
import { HeroBackgroundVideo } from "@/components/hero-background-video";
import { estate } from "@neup/logica/estate";
import {
  formatCountLabel,
  formatPropertyPrice,
  mapProperty,
  getListingResponse,
  getBathroomValue,
  getBedroomValue,
  getDisplayValue,
  getSpaceValue,
  type PropertyItem,
} from "@/lib/property-presentation";
import { fetchBlogs, type BlogItem } from "@/lib/blog-api";

type HomepageReview = {
  author: string;
  avatar: string;
  id: string;
  quote: string;
  rating: number;
  source: string;
  sourceHref: string;
};

const quickCategories = [
  {
    count: "98 properties",
    href: "/properties?category=apartment",
    icon: "apartment",
    label: "Apartments",
    tone: "bg-sky-50",
  },
  {
    count: "4,483 properties",
    href: "/properties?category=house",
    icon: "home",
    label: "Family Homes",
    tone: "bg-slate-100",
  },
  {
    count: "72 properties",
    href: "/properties?category=colony-house",
    icon: "villa",
    label: "Villas",
    tone: "bg-emerald-50",
  },
  {
    count: "264 properties",
    href: "/properties?category=commercial",
    icon: "building",
    label: "Commercial",
    tone: "bg-yellow-50",
  },
  {
    count: "2,315 properties",
    href: "/properties?category=land",
    icon: "land",
    label: "Land / Plots",
    tone: "bg-purple-50",
  },
  {
    count: "156 properties",
    href: "/rent",
    icon: "key",
    label: "Rental Ready",
    tone: "bg-blue-50",
  },
  {
    count: "24 properties",
    href: "/properties?category=commercial",
    icon: "shop",
    label: "Shop Space",
    tone: "bg-lime-50",
  },
] as const;

const fallbackClientReviews: HomepageReview[] = [
  {
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
    id: "aayusha-thapa",
    rating: 5,
    quote:
      "Their Lalitpur shortlist was exactly what we wanted. We closed within three weeks.",
    source: "From Google",
    sourceHref:
      "https://www.google.com/search?q=Property+In+Nepal+Pvt.+Ltd+reviews",
    author: "Aayusha Thapa",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    id: "rijan-karki",
    rating: 5,
    quote:
      "Finally a team that explains pricing honestly in NRS and doesn’t waste your time.",
    source: "From Facebook",
    sourceHref: "https://www.facebook.com/propertyinnepal/reviews",
    author: "Rijan Karki",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
    id: "pranav-shrestha",
    rating: 5,
    quote:
      "Strong negotiation and smooth process. The listing presentation looked premium.",
    source: "From Google",
    sourceHref:
      "https://www.google.com/search?q=Property+In+Nepal+Pvt.+Ltd+reviews",
    author: "Pranav Shrestha",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
    id: "smriti-maharjan",
    rating: 5,
    quote:
      "They helped us compare locations clearly and handled the paperwork without confusion.",
    source: "From Google",
    sourceHref:
      "https://www.google.com/search?q=Property+In+Nepal+Pvt.+Ltd+reviews",
    author: "Smriti Maharjan",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=80",
    id: "bikash-shrestha",
    rating: 5,
    quote:
      "The valuation guidance was practical, and our property received serious buyers quickly.",
    source: "From Facebook",
    sourceHref: "https://www.facebook.com/propertyinnepal/reviews",
    author: "Bikash Shrestha",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80",
    id: "nisha-rai",
    rating: 5,
    quote:
      "Responsive team, clean communication, and a much smoother buying process than expected.",
    source: "From Google",
    sourceHref:
      "https://www.google.com/search?q=Property+In+Nepal+Pvt.+Ltd+reviews",
    author: "Nisha Rai",
  },
] as const;

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < rating;

        return (
          <svg
            key={index}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`size-4 stroke-amber-400 stroke-[1.5] ${
              isFilled ? "fill-amber-400" : "fill-white"
            }`}
          >
            <path
              d="m12 3.6 2.5 5.1 5.6.8-4 3.9.9 5.5-5-2.6-5 2.6.9-5.5-4-3.9 5.6-.8L12 3.6Z"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

function CategoryIcon({ icon }: { icon: (typeof quickCategories)[number]["icon"] }) {
  if (icon === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-none stroke-current stroke-[1.7]">
        <path d="m3 10 9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "land") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-none stroke-current stroke-[1.7]">
        <path d="M4 18 7 6h13l-3 12H4Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 6 6 18M15 6l-3 12M5 14h13M6 10h13" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "villa") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-none stroke-current stroke-[1.7]">
        <path d="M4 21V9l8-5 8 5v12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 21v-7h8v7M9 10h2M13 10h2M6 21h12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "building") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-none stroke-current stroke-[1.7]">
        <path d="M6 21V5h12v16M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "key") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-none stroke-current stroke-[1.7]">
        <circle cx="8" cy="15" r="4" />
        <path d="m11 12 8-8M16 7l2 2M14 9l2 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "shop") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-none stroke-current stroke-[1.7]">
        <path d="M4 10h16l-1.5-5h-13L4 10Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10v11h12V10M9 21v-6h6v6M8 13h1M15 13h1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-none stroke-current stroke-[1.7]">
      <path d="M5 21V6h14v15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9h3v3H8zM13 9h3v3h-3zM8 15h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PremiumPropertyCard({
  className = "",
  property,
}: {
  className?: string;
  property: PropertyItem;
}) {
  const bedroomValue = getBedroomValue(property.features);
  const bathroomValue = getBathroomValue(property.features);
  const title = getDisplayValue(property.name);
  const propertyType = getDisplayValue(property.type);
  const location = [property.location, property.city]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
  const price = formatPropertyPrice(property.price, property.on_calling);
  const propertyHref = property.id?.trim()
    ? `/properties/${property.id}`
    : undefined;

  return (
    <div className={className}>
      <PropertyCardS1
        className="h-full"
        href={propertyHref}
        imageAlt={title}
        imageSrc={property.images?.[0] ?? "/logo.png"}
        agentImageSrc={property.team_image}
        title={title}
        status={getDisplayValue(property.for)}
        price={price}
        priceTag={price}
        propertyType={propertyType}
        location={location || "N/A"}
        bedroomLabel={formatCountLabel(bedroomValue, "Beds")}
        bathroomLabel={formatCountLabel(bathroomValue, "Baths")}
        areaLabel={getSpaceValue(property.area)}
      />
    </div>
  );
}

function BlogPreviewCard({ blog, className = "" }: { blog: BlogItem; className?: string }) {
  return (
    <article className={`group/blog flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(31,59,123,0.035)] transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <Link href={`/blog/${blog.slug}`} className="block overflow-hidden bg-slate-100">
        <img
          src={blog.banner}
          alt={blog.title}
          width={900}
          height={560}
          loading="lazy"
          decoding="async"
          className="aspect-[1.55] w-full object-cover transition duration-500 group-hover/blog:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
          <span>{blog.created_at_human ?? blog.created_at}</span>
          <span aria-hidden="true">•</span>
          <span>{blog.views} views</span>
        </div>

        <h3 className="mt-3 line-clamp-3 text-lg font-bold leading-snug text-slate-950">
          <Link
            href={`/blog/${blog.slug}`}
            className="transition-colors duration-300 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40"
          >
            {blog.title}
          </Link>
        </h3>

        <p className="mt-3 text-sm text-slate-600">
          By {blog.author?.name ?? "Property in Nepal"}
        </p>

        <Link
          href={`/blog/${blog.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-semibold text-brand-deep transition hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40"
        >
          Read article
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4 fill-none stroke-current stroke-2"
          >
            <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

function LinkedSectionTitle({
  ariaLabel,
  href,
  title,
}: {
  ariaLabel: string;
  href: string;
  title: string;
}) {
  return (
    <h2 className="section-title section-title-link-group flex flex-wrap items-baseline gap-3 font-display font-bold leading-tight text-slate-950">
      <Link
        href={href}
        className="section-title-text-link inline-flex text-slate-950 transition-colors duration-300 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40"
      >
        <span className="section-title-underline">{title}</span>
      </Link>
      <Link
        href={href}
        aria-label={ariaLabel}
        className="section-title-icon-link inline-flex h-[1em] items-center text-slate-950 transition-colors duration-300 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40"
      >
        <span aria-hidden="true" className="section-title-chevron">
          <svg
            viewBox="0 0 24 24"
            className="size-[0.68em] fill-none stroke-current stroke-[2.5]"
          >
            <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </h2>
  );
}

export default async function Home() {
  const [premiumResponse, recentResponse, blogsPayload] = await Promise.all([
    estate.listings.list({ agencyId: process.env.NEUP_ESTATE_PROJECT_ID, status: "active", limit: 15, offset: 0 }),
    estate.listings.list({ agencyId: process.env.NEUP_ESTATE_PROJECT_ID, status: "active", limit: 12, offset: 0 }),
    fetchBlogs(1),
  ]);
  const premiumData = getListingResponse(premiumResponse.body);
  const recentData = getListingResponse(recentResponse.body);
  if (!premiumResponse.ok) {
    console.error("Homepage active listing request failed", premiumResponse.status, premiumResponse.body);
  }
  if (!recentResponse.ok) {
    console.error("Homepage recent listing request failed", recentResponse.status, recentResponse.body);
  }
  const premiumListings = premiumData.listings.map(mapProperty);
  const recentListings = recentData.listings.map(mapProperty);
  const latestBlogs = (blogsPayload.data ?? []).slice(0, 8);
  const clientReviews = fallbackClientReviews;
  const featuredListings = premiumListings
    .filter((property) => property.is_featured === "1")
    .slice(0, 8);
  const homepageFeaturedListings =
    featuredListings.length > 0 ? featuredListings : premiumListings.slice(0, 8);
  const premiumPreviewListings = homepageFeaturedListings.slice(0, 8);
  const recentPreviewListings = recentListings.slice(0, 8);

  return (
    <div className="homepage-compact">
      <section className="relative isolate -mt-[88px] flex min-h-[78svh] w-full overflow-hidden pt-[88px] text-white">
        <HeroBackgroundVideo
          src="/hero-video.mp4"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="relative mx-auto flex w-full max-w-[1440px] items-end px-6 py-14 sm:py-16 lg:px-8 lg:pl-24 lg:py-20 xl:pl-28 2xl:pl-0">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white backdrop-blur-md">
              Find your next home in Nepal
            </p>

            <h1 className="section-title-xl mt-6 font-display font-semibold leading-[1.05] tracking-[-0.04em] text-white [text-shadow:0_2px_10px_rgba(2,6,23,0.9),0_10px_30px_rgba(2,6,23,0.7),0_0_22px_rgba(2,6,23,0.55)]">
              घर किन्दा सम्झिनु ल !
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 [text-shadow:0_2px_8px_rgba(2,6,23,0.9),0_8px_22px_rgba(2,6,23,0.65)] sm:text-lg sm:leading-8">
              Verified listings, serious seller inventory, and pricing clarity in NRS.
              Built for buyers and investors who want better options and faster decisions.
            </p>

            <form
              action="/properties"
              className="mt-7 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/20 bg-white/95 p-2 shadow-2xl shadow-slate-950/30 backdrop-blur-md"
            >
              <label htmlFor="hero-property-search" className="sr-only">
                Search properties by location or keyword
              </label>
              <input
                id="hero-property-search"
                name="q"
                type="search"
                placeholder="Search by location or property..."
                className="min-w-0 flex-1 rounded-lg bg-transparent px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-400"
              />
              <button
                type="submit"
                aria-label="Search properties"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00B4EA,#1F3B7B)] text-white transition duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/50"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-5 fill-none stroke-current stroke-2"
                >
                  <circle cx="11" cy="11" r="6" />
                  <path d="m20 20-4.2-4.2" strokeLinecap="round" />
                </svg>
              </button>
            </form>

            <Link
              href="/properties"
              className="mt-5 inline-flex items-center justify-center gap-3 text-sm font-semibold text-white [text-shadow:0_2px_8px_rgba(2,6,23,0.85)] transition hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50"
            >
              Explore all properties
              <span aria-hidden className="text-xl leading-none">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-9 lg:py-11">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 lg:pl-24 xl:pl-28 2xl:pl-0">
          <h2 className="section-title font-display font-bold leading-tight text-slate-950">
            Property Categories
          </h2>
          <p className="section-description mt-1 max-w-2xl leading-7 text-slate-600">
            Browse homes, land, rentals, and commercial spaces by property type.
          </p>
        </div>
        <div className="mx-auto max-w-[1440px] lg:pl-16 xl:pl-20 2xl:pl-0">
          <DragScrollCarousel
            autoScrollIntervalMs={6000}
            className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-pl-6 px-6 pb-2 lg:gap-5 lg:scroll-pl-8 lg:px-8 xl:hidden"
          >
            {quickCategories.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="group/category relative inline-flex min-h-[142px] w-[62vw] max-w-[215px] shrink-0 snap-start flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-200/70 bg-white px-4 py-5 text-center text-slate-700 shadow-[0_2px_8px_rgba(31,59,123,0.035)] transition-colors duration-300 hover:border-brand-deep/20 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40 sm:w-[27vw] md:w-[20vw] lg:w-[13vw] xl:w-[158px]"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-brand-deep/80 opacity-0 transition-opacity duration-300 group-hover/category:opacity-100" />
                <span className={`inline-flex size-16 items-center justify-center rounded-full ${category.tone} text-brand transition-colors duration-300 group-hover/category:text-brand-deep`}>
                  <CategoryIcon icon={category.icon} />
                </span>
                <span className="mt-3 text-base font-bold leading-tight text-inherit">
                  {category.label}
                </span>
                <span className="mt-2 text-xs font-normal leading-none text-slate-500">
                  {category.count}
                </span>
              </Link>
            ))}
          </DragScrollCarousel>

          <div className="mt-6 hidden gap-5 px-8 pb-2 xl:grid xl:grid-cols-4 2xl:grid-cols-7">
            {quickCategories.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="group/category relative flex min-h-[142px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-200/70 bg-white px-4 py-5 text-center text-slate-700 shadow-[0_2px_8px_rgba(31,59,123,0.035)] transition-colors duration-300 hover:border-brand-deep/20 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-brand-deep/80 opacity-0 transition-opacity duration-300 group-hover/category:opacity-100" />
                <span className={`inline-flex size-16 items-center justify-center rounded-full ${category.tone} text-brand transition-colors duration-300 group-hover/category:text-brand-deep`}>
                  <CategoryIcon icon={category.icon} />
                </span>
                <span className="mt-3 text-base font-bold leading-tight text-inherit">
                  {category.label}
                </span>
                <span className="mt-2 text-xs font-normal leading-none text-slate-500">
                  {category.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8 lg:pl-24 xl:pl-28 2xl:pl-0">
        <div className="max-w-3xl">
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
            <LinkedSectionTitle
              href="/properties?listing=premium"
              title="Premium Properties"
              ariaLabel="View premium properties"
            />
          </div>
          <p className="section-description mt-0.5 max-w-2xl leading-7 text-slate-600">
            The best properties for your premium lifestyle.
          </p>
        </div>

        <DragScrollCarousel className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-pl-6 px-6 pb-4 sm:-mx-8 sm:scroll-pl-8 sm:px-8">
          {premiumPreviewListings.map((property, index) => (
            <PremiumPropertyCard
              key={`${property.id}-${index}`}
              property={property}
              className="w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[46vw] lg:w-[31vw] xl:w-[320px]"
            />
          ))}
          <Link
            href="/properties?listing=premium"
            className="inline-flex w-[82vw] max-w-[360px] shrink-0 snap-start flex-col justify-between rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-slate-950 transition-colors duration-300 hover:border-brand-deep hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40 sm:w-[46vw] lg:w-[31vw] xl:w-[320px]"
          >
            <span className="text-xl font-bold leading-tight">
              See more similar properties
            </span>
            <span className="mt-10 inline-flex items-center gap-2 text-sm font-semibold">
              View premium listings
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-4 fill-none stroke-current stroke-2"
              >
                <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </DragScrollCarousel>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 lg:pl-24 xl:pl-28 2xl:pl-0">
          <div className="max-w-3xl">
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
              <LinkedSectionTitle
                href="/properties"
                title="Recent Properties"
                ariaLabel="View recent properties"
              />
            </div>
            <p className="section-description mt-0.5 max-w-2xl leading-7 text-slate-600">
              Freshly added properties from the latest live inventory.
            </p>
          </div>

          <DragScrollCarousel className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-pl-6 px-6 pb-4 sm:-mx-8 sm:scroll-pl-8 sm:px-8">
            {recentPreviewListings.map((property, index) => (
              <PremiumPropertyCard
                key={`${property.id}-${index}`}
                property={property}
                className="w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[46vw] lg:w-[31vw] xl:w-[320px]"
              />
            ))}
            <Link
              href="/properties"
              className="inline-flex w-[82vw] max-w-[360px] shrink-0 snap-start flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-5 text-slate-950 transition-colors duration-300 hover:border-brand-deep hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40 sm:w-[46vw] lg:w-[31vw] xl:w-[320px]"
            >
              <span className="text-xl font-bold leading-tight">
                See more recent properties
              </span>
              <span className="mt-10 inline-flex items-center gap-2 text-sm font-semibold">
                View all listings
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4 fill-none stroke-current stroke-2"
                >
                  <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </DragScrollCarousel>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] overflow-hidden px-4 py-14 sm:px-6 lg:px-8 lg:pl-24 xl:pl-28 2xl:pl-0">
        <div className="grid min-w-0 items-center gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:gap-14">
          <div className="relative mx-auto w-full min-w-0 max-w-2xl">
            <div className="overflow-hidden rounded-xl border-[10px] border-slate-200 bg-white sm:border-[18px]">
              <img
                src="/customer.jpeg"
                alt="Happy customer with the Property in Nepal team"
                width={1400}
                height={980}
                loading="lazy"
                decoding="async"
                className="aspect-[1.12] w-full object-cover object-center"
              />
            </div>

            <div className="absolute right-4 top-4 grid gap-1 rounded-lg bg-brand px-3 py-3 text-white shadow-[0_8px_20px_rgba(0,180,234,0.2)] sm:right-8 sm:top-8 sm:gap-2 sm:px-5 sm:py-5">
              <span className="text-xl font-bold leading-none sm:text-2xl">1,200+</span>
              <span className="text-sm font-medium leading-tight">clients served</span>
            </div>

            <div className="absolute -bottom-3 right-3 rounded-lg bg-brand-deep px-4 py-3 text-white shadow-[0_8px_20px_rgba(31,59,123,0.18)] sm:-bottom-4 sm:right-8 sm:px-5 sm:py-4">
              <span className="block text-xl font-bold leading-none sm:text-2xl">500+</span>
              <span className="mt-1 block text-sm font-medium leading-tight">properties matched</span>
            </div>
          </div>

          <div className="min-w-0">
            <h2 className="section-title font-display font-bold leading-tight text-slate-950">
              Why Choose Us?
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700 break-words">
              As Nepal&apos;s dedicated real estate specialists, we bring deep local expertise to help you
              navigate the city&apos;s most promising property opportunities. We pride ourselves on a
              foundation of absolute transparency and integrity, ensuring that every transaction is
              straightforward with no hidden fees. With a successful history of supporting over 1,200+
              families in their journey toward homeownership and smart investments, we provide end-to-end
              assistance from personalized property matching to full legal and paperwork support. When
              you choose us, you are choosing a partner who understands the pulse of the Kathmandu market
              and is committed to turning your vision of a perfect home into a reality.
            </p>

            <DragScrollCarousel className="no-scrollbar -mx-4 mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth scroll-pl-4 px-4 pb-2 sm:-mx-6 sm:scroll-pl-6 sm:px-6">
              <div className="min-w-[13rem] snap-start rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xl font-bold text-brand-deep">35+</p>
                <p className="mt-1 text-sm text-slate-600">real estate advisors</p>
              </div>
              <div className="min-w-[13rem] snap-start rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xl font-bold text-brand-deep">96%</p>
                <p className="mt-1 text-sm text-slate-600">closing satisfaction</p>
              </div>
              <div className="min-w-[13rem] snap-start rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xl font-bold text-brand-deep">15+</p>
                <p className="mt-1 text-sm text-slate-600">years in market</p>
              </div>
            </DragScrollCarousel>
          </div>
        </div>
      </section>

      <section className="py-14 text-slate-950">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 lg:pl-24 xl:pl-28 2xl:pl-0">
          <div className="max-w-3xl">
            <h2 className="section-title font-display font-bold leading-tight">
              Reviews From Our Clients
            </h2>
            <p className="section-description mt-1 max-w-2xl leading-7 text-slate-600">
              What people say after working with our team to buy, sell, or shortlist properties.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1440px] lg:pl-16 xl:pl-20 2xl:pl-0">
          <DragScrollCarousel
            autoScrollIntervalMs={6500}
            className="no-scrollbar mt-6 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto scroll-smooth scroll-pl-6 px-6 pb-2 lg:scroll-pl-8 lg:px-8"
          >
            {clientReviews.map((review) => (
              <figure
                key={review.id}
                className="flex min-h-[230px] w-[82vw] max-w-[380px] shrink-0 snap-start flex-col rounded-xl border border-slate-200/70 bg-white p-6 shadow-[0_2px_8px_rgba(31,59,123,0.035)] sm:w-[46vw] lg:w-[31vw] xl:w-[calc((100%_-_2.5rem)_/_3)] xl:max-w-none"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="size-12 rounded-full object-cover"
                  />
                  <figcaption>
                    <p className="text-sm font-bold text-slate-950">{review.author}</p>
                    <div className="mt-1">
                      <ReviewStars rating={review.rating} />
                    </div>
                  </figcaption>
                </div>

                <blockquote className="mt-4 text-base leading-6 text-slate-700">
                  {review.quote}
                </blockquote>
                <a
                  href={review.sourceHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-fit pt-4 text-xs font-semibold text-slate-500 transition hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40"
                  aria-label={`Open ${review.source.replace("From ", "")} reviews in a new tab`}
                >
                  {review.source}
                </a>
              </figure>
            ))}
          </DragScrollCarousel>
        </div>
      </section>

      {latestBlogs.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8 lg:pl-24 xl:pl-28 2xl:pl-0">
          <div className="max-w-3xl">
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
              <LinkedSectionTitle
                href="/blogs"
                title="Latest Blogs"
                ariaLabel="View latest blogs"
              />
            </div>
            <p className="section-description mt-0.5 max-w-2xl leading-7 text-slate-600">
              Fresh real estate guidance, market updates, and property insights.
            </p>
          </div>

          <DragScrollCarousel className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-pl-6 px-6 pb-4 sm:-mx-8 sm:scroll-pl-8 sm:px-8">
            {latestBlogs.map((blog) => (
              <BlogPreviewCard
                key={blog.id}
                blog={blog}
                className="w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[46vw] lg:w-[31vw] xl:w-[320px]"
              />
            ))}
            <Link
              href="/blogs"
              className="inline-flex w-[82vw] max-w-[360px] shrink-0 snap-start flex-col justify-between rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-slate-950 transition-colors duration-300 hover:border-brand-deep hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40 sm:w-[46vw] lg:w-[31vw] xl:w-[320px]"
            >
              <span className="text-xl font-bold leading-tight">
                Read more blogs
              </span>
              <span className="mt-10 inline-flex items-center gap-2 text-sm font-semibold">
                View all articles
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4 fill-none stroke-current stroke-2"
                >
                  <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </DragScrollCarousel>
        </section>
      ) : null}

    </div>
  );
}
