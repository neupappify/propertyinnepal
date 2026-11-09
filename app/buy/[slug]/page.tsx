import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyListingsPage } from "@/components/property-listings-page";
import { estate } from "@neup/logica/estate";
import { mapProperty, type ListingPagePayload } from "@/lib/property-presentation";
import {
  getPropertyCategoryLabel,
  isPropertyCategorySlug,
  propertyCategorySlugs,
} from "@/lib/property-taxonomy";

type BuyCategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
};

export async function generateMetadata({
  params,
}: BuyCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isPropertyCategorySlug(slug)) {
    return {
      title: "Buy",
    };
  }

  return {
    title: `Buy ${getPropertyCategoryLabel(slug)}`,
    description: `Browse ${getPropertyCategoryLabel(slug).toLowerCase()} listings available to buy from Property in Nepal.`,
  };
}

export function generateStaticParams() {
  return propertyCategorySlugs.map((slug) => ({ slug }));
}

export default async function BuyCategoryPage({
  params,
  searchParams,
}: BuyCategoryPageProps) {
  const { slug } = await params;

  if (!isPropertyCategorySlug(slug)) {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1") || 1);
  const categoryLabel = getPropertyCategoryLabel(slug);
  let listings: ListingPagePayload = {
    currentPage: page,
    items: [],
    totalItems: 0,
    totalPages: 1,
  };
  let loadError = false;

  try {
    const response = await estate.listings.search({
      agencyId: process.env.NEUP_ESTATE_PROJECT_ID,
      limit: 12,
      offset: (page - 1) * 12,
      filters: { category: categoryLabel, purpose: "sale" },
    });
    if (!response.ok) throw new Error(`Listing search failed: ${response.status}`);
    const records = response.body?.listings ?? [];
    listings = { currentPage: page, items: records.map(mapProperty), totalItems: response.body?.totalCount ?? records.length, totalPages: Math.max(1, Math.ceil((response.body?.totalCount ?? records.length) / 12)) };
  } catch {
    loadError = true;
  }

  return (
    <PropertyListingsPage
      buildPageHref={(nextPage) => `/buy/${slug}?page=${nextPage}`}
      emptyMessage={`No ${categoryLabel.toLowerCase()} listings found to buy right now.`}
      heading={`${categoryLabel} listings to buy`}
      intro={`Browse ${categoryLabel.toLowerCase()} inventory currently available to buy from Property in Nepal.`}
      listingsLabel="Buy"
      loadError={loadError}
      page={listings.currentPage}
      pageCount={listings.totalPages}
      properties={listings.items}
      total={listings.totalItems}
    />
  );
}
