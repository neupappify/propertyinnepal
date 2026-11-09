import type { Metadata } from "next";
import Link from "next/link";
import { fetchBlogs } from "@/lib/blog-api";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Latest real estate insights and market updates from Property in Nepal.",
};

type BlogsPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = Math.max(1, Number(resolvedSearchParams.page ?? "1") || 1);
  const payload = await fetchBlogs(currentPage);
  const blogs = payload.data ?? [];
  const meta = payload.meta;
  const hasPrev = (meta?.current_page ?? currentPage) > 1;
  const hasNext = (meta?.current_page ?? currentPage) < (meta?.last_page ?? currentPage);

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-12 lg:px-8 lg:pt-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-deep/70">
            Blogs
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            Market insights, property guidance, and real estate trends
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Live blog feed powered by Property in Nepal&apos;s content API.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-12 lg:px-8 lg:pb-16">
        {blogs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            No blog posts found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img
                    src={blog.banner}
                    alt={blog.title}
                    width={1200}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="h-52 w-full object-cover"
                  />
                </div>

                <h2 className="mt-4 line-clamp-3 text-xl font-semibold text-slate-950">
                  {blog.title}
                </h2>

                <div className="mt-3 grid gap-1 text-sm text-slate-600">
                  <p>By {blog.author?.name ?? "Property in Nepal"}</p>
                  <p>{blog.created_at_human ?? blog.created_at}</p>
                  <p>{blog.views} views</p>
                </div>

                <Link
                  href={`/blog/${blog.slug}`}
                  className="mt-4 inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                >
                  Read article
                </Link>
              </article>
            ))}
          </div>
        )}

        {meta ? (
          <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-600">
              Page {meta.current_page} of {meta.last_page} • {meta.total} posts
            </p>
            <div className="flex gap-2">
              <Link
                href={hasPrev ? `/blogs?page=${meta.current_page - 1}` : "#"}
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
                href={hasNext ? `/blogs?page=${meta.current_page + 1}` : "#"}
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
