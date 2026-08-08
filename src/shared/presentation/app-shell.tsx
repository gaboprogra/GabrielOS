"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeSelector } from "./theme-selector";

type IconName = "home" | "today" | "tasks" | "routines" | "projects" | "categories" | "more";

const navigation = [
  { href: "/", label: "Inicio", icon: "home" as const },
  { href: "/daily-plan", label: "Hoy", icon: "today" as const },
  { href: "/tasks", label: "Tareas", icon: "tasks" as const },
  { href: "/routines", label: "Rutinas", icon: "routines" as const },
  { href: "/projects", label: "Proyectos", icon: "projects" as const },
  { href: "/categories", label: "Categorías", icon: "categories" as const },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavIcon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "home") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="m3.5 10.5 8.5-7 8.5 7" /><path d="M5.5 9.2V21h13V9.2M9.5 21v-6h5v6" /></svg>;
  }
  if (name === "today") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4m8-4v4M3 10h18" /><path d="m9 15 2 2 4-4" /></svg>;
  }
  if (name === "tasks") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3.5 6 1.2 1.2L7 4.8M3.5 12l1.2 1.2L7 10.8M3.5 18l1.2 1.2L7 16.8" /></svg>;
  }
  if (name === "routines") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M20 7h-8a5 5 0 0 0-5 5v0" /><path d="m17 4 3 3-3 3M4 17h8a5 5 0 0 0 5-5v0" /><path d="m7 20-3-3 3-3" /></svg>;
  }
  if (name === "projects") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M3 7.5h7l2-3h9v15H3z" /><path d="M3 9h18" /></svg>;
  }
  if (name === "categories") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="app-brand" aria-label="GabrielOS, inicio">
      <span className="app-brand-mark">G</span>
      {!compact ? <span>GabrielOS</span> : <span>GabrielOS</span>}
    </Link>
  );
}

function NavigationLinks({
  items = navigation,
  onNavigate,
}: {
  items?: typeof navigation;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="app-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="app-nav-link"
          data-active={isActivePath(pathname, item.href)}
          aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
          onClick={onNavigate}
        >
          <NavIcon name={item.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const secondaryNavigation = navigation.slice(3);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Brand />
        <NavigationLinks />
        <div className="app-sidebar-footer">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tema</p>
          <ThemeSelector />
        </div>
      </aside>

      <header className="app-mobile-header">
        <Brand compact />
        <button
          type="button"
          className="app-mobile-menu-button"
          aria-label="Abrir navegación adicional"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((current) => !current)}
        >
          <NavIcon name="more" />
        </button>
      </header>

      <div className="app-content">{children}</div>

      {moreOpen ? (
        <>
          <button type="button" className="mobile-more-backdrop" aria-label="Cerrar menú" onClick={() => setMoreOpen(false)} />
          <section className="mobile-more-panel" aria-label="Más opciones">
            <p className="font-semibold text-slate-950">Más opciones</p>
            <NavigationLinks
              items={secondaryNavigation}
              onNavigate={() => setMoreOpen(false)}
            />
            <div className="mobile-theme-row">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tema</p>
              <ThemeSelector />
            </div>
          </section>
        </>
      ) : null}

      <nav className="app-mobile-nav" aria-label="Navegación móvil">
        {navigation.slice(0, 3).map((item) => (
          <Link key={item.href} href={item.href} data-active={isActivePath(pathname, item.href)} aria-current={isActivePath(pathname, item.href) ? "page" : undefined} onClick={() => setMoreOpen(false)}>
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
        <button type="button" data-active={moreOpen || secondaryNavigation.some((item) => isActivePath(pathname, item.href))} aria-expanded={moreOpen} onClick={() => setMoreOpen((current) => !current)}>
          <NavIcon name="more" />
          <span>Más</span>
        </button>
      </nav>
    </div>
  );
}
