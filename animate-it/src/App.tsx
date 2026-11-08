import { useEffect, useRef } from 'react';
import { useRoute, navigate, type Route } from './lib/router';
import { Header, Footer, Toast } from './ui/Chrome';
import { BrandKitDialog } from './ui/BrandKitDialog';
import { TemplateDetail } from './ui/TemplateDetail';
import { HomePage } from './pages/Home';
import { TemplatesPage } from './pages/Templates';
import { PricingPage } from './pages/Pricing';
import { ProjectsPage } from './pages/Projects';
import { EditorPage } from './editor/EditorPage';
import { templateById } from './templates/registry';

const TITLES: Record<string, string> = {
  '': 'Animate It · Motion design for every brand',
  templates: 'Templates · Animate It',
  pricing: 'Pricing · Animate It',
  projects: 'My projects · Animate It',
  editor: 'Editor · Animate It',
};

export function App() {
  const route = useRoute();
  const top = route.parts[0] ?? '';
  const lastPage = useRef<Route | null>(null);

  // Template detail opens as a modal over whatever page it was opened from.
  const detail = top === 'template' ? templateById(route.parts[1] ?? '') : undefined;
  if (top !== 'template' && top !== 'editor') lastPage.current = route;
  const bg: Route =
    top === 'template'
      ? lastPage.current ?? { path: '/templates', parts: ['templates', detail?.category ?? ''], query: new URLSearchParams() }
      : route;
  const base = bg.parts[0] ?? '';

  useEffect(() => {
    document.title = detail ? `${detail.name} template · Animate It` : TITLES[base] ?? TITLES[''];
  }, [base, detail]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [bg.path]);

  if (top === 'editor')
    return (
      <>
        <EditorPage route={route} />
        <BrandKitDialog />
        <Toast />
      </>
    );

  let page;
  switch (base) {
    case '':
      page = <HomePage />;
      break;
    case 'templates':
      page = <TemplatesPage route={bg} />;
      break;
    case 'pricing':
      page = <PricingPage />;
      break;
    case 'projects':
      page = <ProjectsPage />;
      break;
    default:
      page = (
        <div className="empty" style={{ paddingTop: 120 }}>
          <h2 className="display" style={{ fontSize: 48, color: 'var(--ink)' }}>
            Page not found
          </h2>
          <a className="btn btn-primary" href="#/">
            Go home
          </a>
        </div>
      );
  }

  return (
    <>
      <Header />
      <main>{page}</main>
      <Footer />
      {detail && (
        <TemplateDetail
          t={detail}
          onClose={() => (lastPage.current ? history.back() : navigate(`/templates/${detail.category}`))}
        />
      )}
      <BrandKitDialog />
      <Toast />
    </>
  );
}
