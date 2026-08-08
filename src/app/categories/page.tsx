import Link from "next/link";

import {
  listActiveCategories,
  listArchivedCategories,
} from "@/modules/categories/infrastructure/category-repository";
import { CategoryForm } from "@/modules/categories/presentation/category-form";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";
import { CategoryArchiveButton } from "@/modules/categories/presentation/category-archive-button";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const userId = await getCurrentDevelopmentUserId();
  const [categories, archivedCategories] = await Promise.all([
    listActiveCategories(userId),
    listArchivedCategories(userId),
  ]);

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Volver al inicio
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Categorías
          </h1>

          <p className="mt-2 text-slate-600">
            Organiza tus tareas por áreas como universidad, trabajo, salud o
            vida personal.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section className="ui-card p-6">
            <h2 className="mb-5 text-xl font-semibold text-slate-950">
              Nueva categoría
            </h2>

            <CategoryForm />
          </section>

          <section className="ui-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">
                Categorías registradas
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {categories.length}
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="ui-empty px-6 py-12 text-center">
                <p className="font-medium text-slate-700">
                  Todavía no existen categorías.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Crea la primera utilizando el formulario.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="activity-card flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{
                          backgroundColor: category.color ?? "#64748B",
                        }}
                      />

                      <div>
                        <p className="font-medium text-slate-900">
                          {category.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          Creada el{" "}
                          {category.createdAt.toLocaleDateString("es-BO")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/categories/${category.id}/edit`}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Editar
                      </Link>

                      <CategoryArchiveButton
                        categoryId={category.id}
                        isArchived={false}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-950">
                Categorías archivadas
              </h3>

              {archivedCategories.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No existen categorías archivadas.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {archivedCategories.map((category) => (
                    <li
                      key={category.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: category.color ?? "#64748B",
                          }}
                        />

                        <span className="font-medium text-slate-700">
                          {category.name}
                        </span>
                      </div>

                      <CategoryArchiveButton
                        categoryId={category.id}
                        isArchived
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
