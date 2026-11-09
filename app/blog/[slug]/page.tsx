import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchBlogBySlug } from "@/lib/blog-api";

type BlogDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Not Found",
    };
  }

  return {
    title: blog.title,
    description: `By ${blog.author?.name ?? "Property in Nepal"} • ${blog.created_at}`,
  };
}

export default async function BlogDetailsPage({ params }: BlogDetailsPageProps) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-12 lg:px-8 lg:pt-16">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-deep/75">
            Blog
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            {blog.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
            <p>By {blog.author?.name ?? "Property in Nepal"}</p>
            <p>•</p>
            <p>{blog.created_at_human ?? blog.created_at}</p>
            <p>•</p>
            <p>{blog.views} views</p>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-10 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <img
            src={blog.banner}
            alt={blog.title}
            width={1400}
            height={860}
            loading="eager"
            decoding="async"
            className="h-auto max-h-[32rem] w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16 lg:px-8 lg:pb-24">
        <article>
          {blog.body ? (
            <div
              className="blog-content max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: blog.body }}
            />
          ) : (
            <p className="text-base leading-7 text-slate-700">
              Full article content is not available in this feed right now.
            </p>
          )}

          <div className="mt-10">
            <Link
              href="/blogs"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Back to blogs
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
