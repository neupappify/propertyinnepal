import type { Metadata } from "next";
import { PropertyListingsPage } from "@/components/property-listings-page";
import { estate } from "@neup/logica/estate";
import { mapProperty, type ListingPagePayload } from "@/lib/property-presentation";

export const metadata: Metadata = {
  title: "Properties",
  description:
    "Browse live properties from Property in Nepal with current listings and details.",
};

type PropertiesPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1") || 1);
  let listings: ListingPagePayload = {
    currentPage: page,
    items: [],
    totalItems: 0,
    totalPages: 1,
  };
  let loadError = false;

  try {
    const response = await estate.listings.search({ agencyId: process.env.NEUP_ESTATE_PROJECT_ID, limit: 12, offset: (page - 1) * 12 });
    if (!response.ok) throw new Error(`Listing search failed: ${response.status}`);
    const records = response.body?.listings ?? [];
    listings = { currentPage: page, items: records.map(mapProperty), totalItems: response.body?.totalCount ?? records.length, totalPages: Math.max(1, Math.ceil((response.body?.totalCount ?? records.length) / 12)) };
  } catch {
    loadError = true;
  }

  return (
    <PropertyListingsPage
      buildPageHref={(nextPage) => `/properties?page=${nextPage}`}
      emptyMessage="No properties found right now."
      heading="Live property listings from Property in Nepal"
      intro="Browse current inventory and open any listing to view complete property details, features, and media."
      listingsLabel="Properties"
      loadError={loadError}
      page={listings.currentPage}
      pageCount={listings.totalPages}
      properties={listings.items}
      total={listings.totalItems}
    />
  );
}
