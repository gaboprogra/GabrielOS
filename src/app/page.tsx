import Link from "next/link";
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
      <article className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            MVP en construcción
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            GabrielOS
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-700 sm:text-xl">
            Tu sistema personal de organización
          </p>
        </header>

        <section
          aria-labelledby="first-module-title"
          className="mt-10 rounded-2xl bg-slate-950 p-6 text-white sm:p-8"
        >
          <h2 id="first-module-title" className="text-xl font-semibold">
            Primer módulo: Tareas
          </h2>
          <p className="mt-3 leading-7 text-slate-300">
            La primera regla de dominio ya permite identificar tareas atrasadas
            de forma determinista.
          </p>
          <Link
            href="/categories"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Administrar categorías
          </Link>
          <Link
            href="/projects"
            className="inline-flex rounded-xl border border-blue-600 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Administrar proyectos
          </Link>
        </section>
      </article>
    </main>
  );
}
