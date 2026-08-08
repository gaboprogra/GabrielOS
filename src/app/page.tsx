import Link from "next/link";

const destinations = [
  {
    href: "/daily-plan",
    label: "Plan diario",
    description: "Organiza el día, revisa horarios y registra tu avance.",
    accent: "primary",
  },
  {
    href: "/tasks",
    label: "Banco de tareas",
    description: "Captura pendientes y mantén disponibles tus tareas reutilizables.",
    accent: "info",
  },
  {
    href: "/routines",
    label: "Rutinas",
    description: "Administra reglas recurrentes y sus horarios semanales.",
    accent: "violet",
  },
  {
    href: "/projects",
    label: "Proyectos",
    description: "Agrupa el trabajo y consulta su estado sin perder contexto.",
    accent: "warning",
  },
  {
    href: "/categories",
    label: "Categorías",
    description: "Conserva una clasificación visual propia para tus actividades.",
    accent: "success",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Espacio personal
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Todo lo importante, en un lugar tranquilo.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            GabrielOS reúne tu plan, tareas, rutinas y proyectos para que puedas
            concentrarte en hacer, no en organizar la herramienta.
          </p>
        </header>

        <section className="ui-card overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Comienza por aquí</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                Revisa el plan de hoy
              </h2>
              <p className="mt-2 max-w-xl text-slate-600">
                Consulta las actividades programadas, sus horarios y el estado
                de cada ejecución.
              </p>
            </div>
            <Link href="/daily-plan" className="ui-button-primary shrink-0">
              Abrir plan diario →
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">Tu espacio</h2>
            <span className="text-sm text-slate-500">GabrielOS</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {destinations.slice(1).map((destination) => (
              <Link
                key={destination.href}
                href={destination.href}
                className="ui-card group block p-5 transition hover:-translate-y-0.5"
                data-accent={destination.accent}
              >
                <span className="mb-5 block h-1.5 w-10 rounded-full bg-blue-600" />
                <h3 className="font-semibold text-slate-950 group-hover:text-blue-700">
                  {destination.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {destination.description}
                </p>
                <span className="mt-5 inline-block text-sm font-semibold text-blue-700">
                  Abrir →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
