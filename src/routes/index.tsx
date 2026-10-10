import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, CheckCheck, ClipboardList, MapPin, ShieldCheck, Video, X, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/lead-form';
import { copy } from '@/lib/copy';
import type { Language } from '@/lib/lead-schema';
import seoul from '@/assets/seoul-panorama.jpg';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Doctor Signal — Независимая поддержка в Южной Корее' },
    { name: 'description', content: 'Проверка хирурга и бесплатная видеоконсультация с переводом для планирующих ринопластику или подтяжку лица в Корее. Учебный проект IE Business School.' },
    { property: 'og:title', content: 'Doctor Signal — Независимая поддержка в Южной Корее' },
    { property: 'og:description', content: 'Бесплатная первая консультация с переводом. Независимый учебный проект IE Business School.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

function Index() {
  const [language, setLanguage] = useState<Language>('ru');
  const t = copy[language];
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const stepIcons = [ClipboardList, ShieldCheck, Video];
  function scrollToForm() { document.getElementById('consultation')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  return <>
    <header className="site-header page-width"><a href="#" className="wordmark" aria-label="Doctor Signal"><span>Doctor Signal</span><span className="wordmark-dot" /></a><div className="language-switch" aria-label="Language"><Button variant={language === 'ru' ? 'secondary' : 'ghost'} className="language-button" onClick={() => setLanguage('ru')} aria-pressed={language === 'ru'}>RU</Button><span>/</span><Button variant={language === 'en' ? 'secondary' : 'ghost'} className="language-button" onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</Button></div></header>
    <main><section className="hero page-width"><div className="eyebrow"><ShieldCheck />{t.eyebrow}</div><h1>{t.headline}<br /><span>{t.korea}</span></h1><p className="hero-copy">{t.subline}</p><div className="hero-actions"><Button className="hero-button" size="lg" onClick={scrollToForm}>{t.cta}<ArrowUpRight /></Button><span className="free-note"><CheckCheck size={14} />{t.free}</span></div><div className="seoul-image"><img src={seoul} alt={language === 'ru' ? 'Панорама Сеула и реки Хан' : 'Seoul skyline and the Han River'} width={1920} height={512} /><span className="seoul-caption"><MapPin size={12} />{language === 'ru' ? 'СЕУЛ, ЮЖНАЯ КОРЕЯ' : 'SEOUL, SOUTH KOREA'}</span></div></section>
    <section className="content-section page-width"><h2 className="section-heading">{t.how}</h2><div className="steps-grid">{t.steps.map((title, i) => { const Icon = stepIcons[i]; return <article className="step" key={i}><div className="step-top"><span className="step-icon">{Icon && <Icon />}</span><span className="step-number">0{i + 1}</span></div><h3>{title}</h3><p>{t.details[i]}</p></article>; })}</div></section>
    <section className="independent-band"><div className="independent-inner page-width"><HeartHandshake className="independent-icon" /><div><h2>{t.independent}</h2><p>{t.independence}</p></div></div></section>
    <section className="content-section page-width"><h2 className="section-heading">{t.scope}</h2><div className="scope-grid"><div className="scope-column"><h3><ShieldCheck />{t.can}</h3><ul>{t.cans.map(item => <li key={item}><Check />{item}</li>)}</ul></div><div className="scope-column cannot"><h3><X />{t.cannot}</h3><ul>{t.cannots.map(item => <li key={item}><X />{item}</li>)}</ul></div></div></section>
    <LeadForm language={language} /></main>
    <footer className="site-footer page-width"><div className="wordmark">Doctor Signal<span className="wordmark-dot" /></div><p>{t.footer}</p></footer>
  </>;
}
