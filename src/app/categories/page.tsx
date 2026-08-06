import Link from "next/link";

import { listActiveCategories } from "@/modules/categories/infrastructure/category-repository";
import { CategoryForm } from "@/modules/categories/presentation/category-form";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const userId = await getCurrentDevelopmentUserId();
  const categories = await listActiveCategories(userId);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
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
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-950">
              Nueva categoría
            </h2>

            <CategoryForm />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">
                Categorías registradas
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {categories.length}
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
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
                    className="flex items-center gap-4 rounded-xl border border-slate-200 px-4 py-4"
                  >
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
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
