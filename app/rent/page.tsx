import type { Metadata } from "next";
import { PropertyListingsPage } from "@/components/property-listings-page";
import { estate } from "@neup/logica/estate";
import { mapProperty, type ListingPagePayload } from "@/lib/property-presentation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RentPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Rent",
  description: "Browse properties available to rent from Property in Nepal.",
};

export default async function RentPage({ searchParams }: RentPageProps) {
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
    const response = await estate.listings.search({
      agencyId: process.env.NEUP_ESTATE_PROJECT_ID,
      limit: 12,
      offset: (page - 1) * 12,
      filters: { purpose: "rent" },
    });
    if (!response.ok) throw new Error(`Listing search failed: ${response.status}`);
    const records = response.body?.listings ?? [];
    listings = { currentPage: page, items: records.map(mapProperty), totalItems: response.body?.totalCount ?? records.length, totalPages: Math.max(1, Math.ceil((response.body?.totalCount ?? records.length) / 12)) };
  } catch {
    loadError = true;
  }

  return (
    <PropertyListingsPage
      buildPageHref={(nextPage) => `/rent?page=${nextPage}`}
      emptyMessage="No rental listings found right now."
      heading="Properties available to rent"
      intro="Browse rental inventory across all categories, then open any listing to view its complete details."
      listingsLabel="Rent"
      loadError={loadError}
      page={listings.currentPage}
      pageCount={listings.totalPages}
      properties={listings.items}
      total={listings.totalItems}
    />
  );
}
