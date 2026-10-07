import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  projects,
  projectCategories,
  projectDocHref,
  projectDocPages,
  profile,
  publications,
} from "../knowledge-base";
import { existsSync } from "node:fs";
import { join } from "node:path";

test("catálogo íntegro, assets existentes e links válidos", async ({
  request,
}) => {
  expect(new Set(projects.map((project) => project.id)).size).toBe(
    projects.length,
  );
  expect(new Set(projects.map((project) => project.rank)).size).toBe(
    projects.length,
  );
  for (const project of projects) {
    expect(project.highlights.length).toBeGreaterThan(0);
    for (const picture of project.images)
      expect(existsSync(join(process.cwd(), "public", picture.src))).toBe(true);
    for (const link of project.links)
      expect(link.url).toMatch(/^(https:\/\/|\/documents\/)/);
  }
  for (const path of [
    profile.cv.url,
    ...publications.map((item) => item.url),
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect((await response.body()).subarray(0, 4).toString()).toBe("%PDF");
  }
});

test("home completa, responsiva e sem erros de execução", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Software que",
  );
  const cards = page.locator(".flagship-project, .project-card, .catalog-card");
  await expect(cards).toHaveCount(projects.length);
  await expect(page.getByText("Certificações", { exact: true })).toHaveCount(0);
  for (const id of [
    "sobre",
    "experiencia",
    "projetos",
    "formacao",
    "artigos",
    "contato",
  ]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Baixar currículo" }),
  ).toHaveAttribute("href", profile.cv.url);
  expect(errors).toEqual([]);
});

test("filtros, busca por stack e recuperação do estado vazio", async ({
  page,
}) => {
  await page.goto("/#projetos");
  for (const category of projectCategories) {
    await page.getByRole("button", { name: category, exact: true }).click();
    await expect(
      page.locator(".flagship-project, .project-card, .catalog-card"),
    ).toHaveCount(
      projects.filter((project) => project.category === category).length,
    );
  }
  await page.getByRole("button", { name: /^Todos/ }).click();
  const search = page.getByRole("textbox", {
    name: "Buscar projetos por nome ou tecnologia",
  });
  await search.fill("qstash");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Care Copilot", exact: true }),
  ).toBeVisible();
  await search.fill("não-existe-esta-tecnologia");
  await expect(page.getByText("Nenhum projeto por aqui.")).toBeVisible();
  await page.getByRole("button", { name: "Ver todos os projetos" }).click();
  await expect(search).toHaveValue("");
  await expect(
    page.locator(".flagship-project, .project-card, .catalog-card"),
  ).toHaveCount(projects.length);
  await search.fill("conciliacao");
  await expect(
    page.getByRole("heading", { name: "Grau Técnico", exact: true }),
  ).toBeVisible();
});

test("modal: conteúdo, tabs, teclado, foco e URL", async ({ page }) => {
  await page.goto("/#projetos");
  const trigger = page.getByRole("button", {
    name: "Explorar o projeto",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/project=mailworks/);
  await expect(
    dialog.getByRole("heading", { name: "MailWorks." }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Fechar projeto" }),
  ).toBeFocused();
  await dialog.getByRole("tab", { name: "Arquitetura", exact: true }).click();
  await expect(dialog.locator(".flow-step")).toHaveCount(5);
  await page.keyboard.press("ArrowRight");
  await expect(
    dialog.getByRole("tab", { name: "Decisões técnicas" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(dialog.getByText(/Transactional Outbox/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page).not.toHaveURL(/project=/);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
});

test("todos os projetos abrem por link direto e renderizam todas as abas", async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const project of projects) {
    await page.goto(`/?project=${project.id}`);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(
      `${project.name}.`,
    );
    if (project.docs) {
      await expect(dialog.getByRole("tab")).toHaveCount(0);
      await expect(dialog.getByText("MINHA CONTRIBUIÇÃO")).toBeVisible();
      await expect(
        dialog.getByRole("link", { name: "Ver com detalhes" }),
      ).toHaveAttribute("href", projectDocHref(project));
      await expect(
        dialog.getByRole("link", { name: "Documentação" }),
      ).toHaveCount(projectDocPages(project).includes("manual") ? 1 : 0);
      await dialog.getByRole("button", { name: "Fechar projeto" }).click();
      await expect(dialog).toHaveCount(0);
      continue;
    }
    await dialog.getByRole("tab", { name: "Arquitetura", exact: true }).click();
    if (project.images.length === 0)
      await expect(
        dialog.getByText("Imagens deste projeto serão adicionadas em breve."),
      ).toBeVisible();
    for (const image of project.images) {
      const element = dialog.getByRole("img", { name: image.alt });
      await expect(element).toBeVisible();
      await expect
        .poll(() =>
          element.evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    await dialog.getByRole("tab", { name: "Decisões técnicas" }).click();
    await expect(dialog.locator(".engineering-list>section")).toHaveCount(
      project.highlights.length,
    );
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth + 1,
      ),
    ).toBe(true);
    await dialog.getByRole("button", { name: "Fechar projeto" }).click();
    await expect(dialog).toHaveCount(0);
  }
});

test("página do projeto: guia, docs, idiomas e navegação", async ({
  page,
  request,
  isMobile,
}) => {
  test.setTimeout(90_000);
  const audit = async () =>
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  for (const project of projects.filter((item) => item.docs)) {
    const [defaultLocale, otherLocale] = project.docs!.locales;
    for (const locale of project.docs!.locales)
      for (const doc of projectDocPages(project)) {
        await page.goto(projectDocHref(project, doc, locale));
        await expect(page.locator(".doc-page")).toHaveAttribute("lang", locale);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        for (const image of await page.locator(".doc-prose img").all()) {
          await image.scrollIntoViewIfNeeded();
          await expect
            .poll(() =>
              image.evaluate(
                (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
              ),
            )
            .toBe(true);
        }
        expect(await page.locator(".doc-prose h2").count()).toBeGreaterThan(3);
        // Toda âncora interna (índice lateral e sumário) aponta para um título real.
        for (const href of await page
          .locator('.doc-layout a[href^="#"]')
          .evaluateAll((links) => links.map((a) => a.getAttribute("href")!)))
          await expect(
            page.locator(`[id="${decodeURIComponent(href.slice(1))}"]`),
          ).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
        await audit();
      }
    if (!isMobile) {
      // O índice lateral marca a seção em leitura conforme a rolagem.
      await page.goto(projectDocHref(project));
      const tocLinks = page.locator(".doc-toc a");
      const marked = page.locator('.doc-toc a[aria-current="location"]');
      await tocLinks.nth(2).click();
      await expect(marked).toHaveCount(1);
      await expect(marked).toHaveAttribute(
        "href",
        (await tocLinks.nth(2).getAttribute("href"))!,
      );
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight),
      );
      await expect(marked).toHaveAttribute(
        "href",
        (await tocLinks.last().getAttribute("href"))!,
      );
      await audit();
    }
    await page.goto(`/?project=${project.id}`);
    await page.getByRole("link", { name: "Ver com detalhes" }).click();
    await expect(page).toHaveURL(projectDocHref(project));
    const hasManual = projectDocPages(project).includes("manual");
    const current = hasManual ? "manual" : "guide";
    if (hasManual) {
      await page
        .locator(".doc-tabs")
        .getByRole("link", { name: "Docs", exact: true })
        .click();
      await expect(page).toHaveURL(projectDocHref(project, "manual"));
    } else {
      // Projeto só com guia: sem abas, sem chamada para docs e sem rota /docs.
      await expect(page.locator(".doc-tabs, .doc-next")).toHaveCount(0);
      expect((await request.get(`/projetos/${project.id}/docs`)).status()).toBe(
        404,
      );
    }
    if (otherLocale) {
      await page.locator(`.doc-locales a[hreflang="${otherLocale}"]`).click();
      await expect(page).toHaveURL(
        projectDocHref(project, current, otherLocale),
      );
      if (hasManual) {
        await page.locator(".doc-next").getByRole("link").click();
        await expect(page).toHaveURL(
          projectDocHref(project, "guide", otherLocale),
        );
      }
    }
    await page.locator(".doc-back").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(defaultLocale).toBe(project.docs!.locales[0]);
    expect(
      (await request.get(`/projetos/${project.id}/nao-existe`)).status(),
    ).toBe(404);
  }
  expect((await request.get("/projetos/mailworks")).status()).toBe(404);
});

test("histórico, backdrop e menu mobile", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page
      .getByRole("navigation", { name: "Navegação mobile" })
      .getByRole("link", { name: "Projetos", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Abrir menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  }
  await page
    .getByRole("button", { name: "Explorar o projeto", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(/project=mailworks/);
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goForward();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/?project=nao-existe");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("contraste, semântica e acessibilidade dos estados principais", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/");
  const audit = async () => {
    const report = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      report.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => ({
          target: node.target,
          issue: node.failureSummary,
        })),
      })),
    ).toEqual([]);
  };
  await audit();
  await page
    .getByRole("button", { name: "Explorar o projeto", exact: true })
    .click();
  await audit();
  for (const name of ["Arquitetura", "Decisões técnicas"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await audit();
  }
  await page.getByRole("button", { name: "Fechar projeto" }).click();
  await page.getByRole("button", { name: "Grau Técnico", exact: true }).click();
  await page.getByRole("tab", { name: "Arquitetura", exact: true }).click();
  await audit();
});
