import { useEffect } from 'react';
import { useRoute, navigate } from './lib/router';
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

  // Template detail opens as a modal over the gallery.
  const detail = top === 'template' ? templateById(route.parts[1] ?? '') : undefined;
  const base = top === 'template' ? 'templates' : top;

  useEffect(() => {
    document.title = detail ? `${detail.name} template · Animate It` : TITLES[base] ?? TITLES[''];
  }, [base, detail]);

  useEffect(() => {
    if (top !== 'template') window.scrollTo({ top: 0 });
  }, [route.path, top]);

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
      page = <TemplatesPage route={top === 'template' ? { ...route, parts: ['templates', detail?.category ?? ''] } : route} />;
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
          onClose={() => (history.length > 1 && document.referrer !== '' ? history.back() : navigate(`/templates/${detail.category}`))}
        />
      )}
      <BrandKitDialog />
      <Toast />
    </>
  );
}
