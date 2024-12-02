import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { getGithubLastEdit } from "fumadocs-core/server";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  // ?https://fumadocs.vercel.app/docs/ui/blocks/page#last-updated-time
  // TODO: edit values
  const time = await getGithubLastEdit({
    owner: "amiraryan1996",
    repo: "turborepo-jsclimber",
    path: `content/docs/${page.file.path}`,
  });

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      lastUpdate={new Date(time as Date)}
      editOnGithub={{
        owner: "amiraryan1996",
        repo: "turborepo-jsclimber",
        sha: "main",
        // file path, make sure it's valid
        path: `content/docs/${page.file.path}`,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            img: (props) => <ImageZoom {...(props as any)} />,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
