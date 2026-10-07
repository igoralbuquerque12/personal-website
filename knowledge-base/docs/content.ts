import { readFile } from "node:fs/promises";
import { join } from "node:path";
import GithubSlugger from "github-slugger";
import type { DocLocale, DocPage } from "../types";

export interface ProjectDocument {
  /** Texto do `# título` do arquivo, exibido no cabeçalho da página. */
  title: string;
  /** Markdown sem a linha do título. */
  body: string;
  /** Seções `##`, com os mesmos ids gerados pelo rehype-slug. */
  sections: { id: string; label: string }[];
}

/**
 * Lê `knowledge-base/docs/<id>/<página>.<idioma>.md`. Usa o sistema de
 * arquivos: importe apenas em Server Components, nunca pelo `index.ts`.
 */
export async function loadProjectDocument(
  projectId: string,
  page: DocPage,
  locale: DocLocale,
): Promise<ProjectDocument> {
  const source = await readFile(
    join(
      process.cwd(),
      "knowledge-base",
      "docs",
      projectId,
      `${page}.${locale}.md`,
    ),
    "utf8",
  );
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const slugger = new GithubSlugger();
  const sections: ProjectDocument["sections"] = [];
  const body: string[] = [];
  let title = "";
  let fenced = false;
  for (const line of lines) {
    if (line.startsWith("```")) fenced = !fenced;
    const heading = fenced ? null : /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const label = heading[2].replace(/[`*_]/g, "").trim();
      if (heading[1].length === 1 && !title) {
        title = label;
        continue;
      }
      const id = slugger.slug(label);
      if (heading[1].length === 2) sections.push({ id, label });
    }
    body.push(line);
  }
  return { title, body: body.join("\n").trim(), sections };
}
