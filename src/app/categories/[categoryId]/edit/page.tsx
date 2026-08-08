import Link from "next/link";
import { notFound } from "next/navigation";

import { findCategoryForEdit } from "@/modules/categories/infrastructure/category-repository";
import { EditCategoryForm } from "@/modules/categories/presentation/edit-category-form";
import { getCurrentDevelopmentUserId } from "@/shared/infrastructure/get-current-development-user";

type EditCategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { categoryId } = await params;
  const userId = await getCurrentDevelopmentUserId();

  const category = await findCategoryForEdit(userId, categoryId);

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/categories"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Volver a categorías
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          Editar categoría
        </h1>

        <section className="ui-card mt-8 p-6">
          <EditCategoryForm category={category} />
        </section>
      </div>
    </main>
  );
}
