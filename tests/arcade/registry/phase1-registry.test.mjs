import { readdir, readFile } from "node:fs/promises";
import { basename } from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";
import { describe, expect, test } from "vitest";

import { repositoryPath } from "../helpers/repository.mjs";

const registry = YAML.parse(
  await readFile(repositoryPath("_data", "arcade_games.yml"), "utf8")
);
const publications = YAML.parse(
  await readFile(repositoryPath("_data", "publications.yml"), "utf8")
);
const schema = JSON.parse(
  await readFile(repositoryPath("schemas", "arcade-game.schema.json"), "utf8")
);
const config = YAML.parse(await readFile(repositoryPath("_config.yml"), "utf8"));
const publicationIds = new Set(publications.map(({ id }) => id));
const expectedCatalogIds = [
  ...Array.from({ length: 20 }, (_, index) => `R${String(index).padStart(2, "0")}`),
  ...Array.from({ length: 16 }, (_, index) => `C${String(index + 1).padStart(2, "0")}`)
];

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateRegistrySchema = ajv.compile(schema);

function cloneRegistry() {
  return structuredClone(registry);
}

function duplicateValues(records, key) {
  const seen = new Set();
  const duplicates = new Set();

  for (const record of records) {
    if (seen.has(record[key])) duplicates.add(record[key]);
    seen.add(record[key]);
  }

  return [...duplicates];
}

function semanticContractErrors(records) {
  const errors = [];

  for (const key of ["catalog_id", "id", "slug"]) {
    for (const value of duplicateValues(records, key)) {
      errors.push(`duplicate:${key}:${value}`);
    }
  }

  for (const game of records) {
    const paperRefs = game.provenance?.paper_refs ?? [];

    if (game.category === "classic" && paperRefs.length > 0) {
      errors.push(`classic-paper-ref:${game.catalog_id}`);
    }

    for (const { paper_id: paperId } of paperRefs) {
      if (!publicationIds.has(paperId)) {
        errors.push(`unresolved-paper:${game.catalog_id}:${paperId}`);
      }
    }

    if (
      game.persistence?.save_schema_version !==
      game.release?.save_schema_version
    ) {
      errors.push(`save-version-mismatch:${game.catalog_id}`);
    }
  }

  return errors;
}

function parseFrontMatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("Collection document is missing YAML front matter");
  return YAML.parse(match[1]);
}

describe("Phase 1 registry: one complete contract per game", () => {
  test.each(registry)(
    "$catalog_id $id satisfies schema, identity, provenance, and collection-route contracts",
    async (game) => {
      expect(validateRegistrySchema([game]), ajv.errorsText(validateRegistrySchema.errors)).toBe(true);
      expect(game.id).toBe(game.slug);
      expect(game.entry_module).toBe(
        `/assets/js/arcade/games/${game.slug}/index.js`
      );
      expect(game.session_minutes[0]).toBeLessThan(game.session_minutes[1]);
      expect(game.accessibility.input_modes).toContain("keyboard");
      expect(game.accessibility.modes).toContain("text-summary");
      expect(game.release.save_schema_version).toBe(
        game.persistence.save_schema_version
      );

      if (game.catalog_id.startsWith("R")) {
        expect(game.provenance.kind).toBe("paper-derived");
        expect(game.provenance.paper_refs.length).toBeGreaterThan(0);
        for (const paperRef of game.provenance.paper_refs) {
          expect(publicationIds.has(paperRef.paper_id)).toBe(true);
        }
      } else {
        expect(game.provenance.kind).toBe("reference-derived");
        expect(game.provenance.paper_refs).toBeUndefined();
      }

      const collectionPath = repositoryPath(
        "_arcade_games",
        `${game.slug}.md`
      );
      const frontMatter = parseFrontMatter(await readFile(collectionPath, "utf8"));
      expect(frontMatter.game_id).toBe(game.id);
      expect(frontMatter.title).toBe(game.title);

      const route = config.collections.arcade_games.permalink.replace(
        ":name",
        game.slug
      );
      expect(route).toBe(`/arcade/games/${game.slug}/`);
    }
  );
});

describe("Phase 1 registry: cross-record and negative contracts", () => {
  test("contains exactly the planned R00-R19 and C01-C16 catalog", () => {
    expect(registry).toHaveLength(48 - 12);
    expect(registry.map(({ catalog_id: catalogId }) => catalogId)).toEqual(
      expectedCatalogIds
    );
  });

  test("keeps catalog IDs, stable IDs, and slugs unique", () => {
    expect(duplicateValues(registry, "catalog_id")).toEqual([]);
    expect(duplicateValues(registry, "id")).toEqual([]);
    expect(duplicateValues(registry, "slug")).toEqual([]);
  });

  test("maps the registry one-to-one onto collection documents", async () => {
    const collectionFiles = (await readdir(repositoryPath("_arcade_games")))
      .filter((file) => file.endsWith(".md"))
      .sort();
    const expectedFiles = registry
      .map(({ slug }) => `${slug}.md`)
      .sort();

    expect(collectionFiles).toEqual(expectedFiles);
    expect(collectionFiles.map((file) => basename(file, ".md"))).toEqual(
      expectedFiles.map((file) => basename(file, ".md"))
    );
  });

  test("detects duplicate catalog IDs, stable IDs, and slugs", () => {
    const candidate = cloneRegistry();
    candidate[1].catalog_id = candidate[0].catalog_id;
    candidate[1].id = candidate[0].id;
    candidate[1].slug = candidate[0].slug;

    expect(semanticContractErrors(candidate)).toEqual(
      expect.arrayContaining([
        `duplicate:catalog_id:${candidate[0].catalog_id}`,
        `duplicate:id:${candidate[0].id}`,
        `duplicate:slug:${candidate[0].slug}`
      ])
    );
  });

  test("schema rejects an invalid lifecycle status", () => {
    const candidate = cloneRegistry();
    candidate[0].status = "almost-ready";

    expect(validateRegistrySchema(candidate)).toBe(false);
    expect(validateRegistrySchema.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ instancePath: "/0/status", keyword: "enum" })
      ])
    );
  });

  test("schema rejects a game without an entry module", () => {
    const candidate = cloneRegistry();
    delete candidate[1].entry_module;

    expect(validateRegistrySchema(candidate)).toBe(false);
    expect(validateRegistrySchema.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          instancePath: "/1",
          keyword: "required",
          params: { missingProperty: "entry_module" }
        })
      ])
    );
  });

  test("schema rejects a game without an explicit limitation", () => {
    const candidate = cloneRegistry();
    delete candidate[2].limitations;

    expect(validateRegistrySchema(candidate)).toBe(false);
    expect(validateRegistrySchema.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          instancePath: "/2",
          keyword: "required",
          params: { missingProperty: "limitations" }
        })
      ])
    );
  });

  test("schema requires paper references for every research or security record", () => {
    const candidate = cloneRegistry();
    delete candidate[3].provenance.paper_refs;

    expect(candidate[3].category).not.toBe("classic");
    expect(validateRegistrySchema(candidate)).toBe(false);
    expect(validateRegistrySchema.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          instancePath: "/3/provenance",
          keyword: "required",
          params: { missingProperty: "paper_refs" }
        })
      ])
    );
  });

  test("semantic contract forbids publication-paper references on Classics", () => {
    const candidate = cloneRegistry();
    const classicIndex = candidate.findIndex(({ category }) => category === "classic");
    candidate[classicIndex].provenance.paper_refs = [
      { paper_id: 1, role: "background" }
    ];

    expect(semanticContractErrors(candidate)).toContain(
      `classic-paper-ref:${candidate[classicIndex].catalog_id}`
    );
  });

  test("schema requires both Paper Lab and Classic Cabinet theme support", () => {
    const missingClassic = cloneRegistry();
    missingClassic[4].supported_themes = ["paper-lab", "ink-circuit"];
    expect(validateRegistrySchema(missingClassic)).toBe(false);

    const missingPaperLab = cloneRegistry();
    missingPaperLab[4].supported_themes = ["classic-cabinet", "ink-circuit"];
    expect(validateRegistrySchema(missingPaperLab)).toBe(false);
  });

  test("semantic contract rejects an unresolved publication ID", () => {
    const candidate = cloneRegistry();
    candidate[5].provenance.paper_refs[0].paper_id = 999999;

    expect(semanticContractErrors(candidate)).toContain(
      `unresolved-paper:${candidate[5].catalog_id}:999999`
    );
  });

  test("semantic contract rejects mismatched persistence and release versions", () => {
    const candidate = cloneRegistry();
    candidate[6].release.save_schema_version += 1;

    expect(semanticContractErrors(candidate)).toContain(
      `save-version-mismatch:${candidate[6].catalog_id}`
    );
  });
});
