import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, ShieldCheck } from 'lucide-react';

interface LegalPageProps {
  type: 'terms' | 'privacy';
}

const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 sm:px-6 font-sans">
      <article className="mx-auto max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl sm:p-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="mt-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20">
            {isPrivacy ? <ShieldCheck className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">{title}</h1>
            <p className="mt-1 text-xs text-slate-400">Last updated: July 21, 2026</p>
          </div>
        </div>

        {isPrivacy ? (
          <div className="mt-8 space-y-6 text-slate-300 text-sm leading-relaxed">
            <section><h2 className="text-base font-bold text-white mb-2">Information We Process</h2><p>We process account details, application configuration templates, and operational metrics necessary to fulfill integration requests you trigger through ElevenLabs, Lingo, and Netlify.</p></section>
            <section><h2 className="text-base font-bold text-white mb-2">How Information Is Used</h2><p>Your data is strictly used to authenticate your session, sync your visual app layouts, and proxy server requests to your chosen AI providers securely.</p></section>
            <section><h2 className="text-base font-bold text-white mb-2">Third-Party Providers</h2><p>When enabled, API server routes pass required parameters directly to third-party endpoints. Provider secret keys remain on the backend and are never exposed in browser bundles.</p></section>
            <section><h2 className="text-base font-bold text-white mb-2">Contact Us</h2><p>For privacy inquiries, contact <a className="text-emerald-400 underline font-medium" href="mailto:privacy@polylingo.ai">privacy@polylingo.ai</a>.</p></section>
          </div>
        ) : (
          <div className="mt-8 space-y-6 text-slate-300 text-sm leading-relaxed">
            <section><h2 className="text-base font-bold text-white mb-2">Using the Platform</h2><p>Use PolyLingo AI lawfully and solely with authorized credentials, audio samples, and component configurations.</p></section>
            <section><h2 className="text-base font-bold text-white mb-2">Account & Content Responsibility</h2><p>You remain responsible for maintaining the security of your account, provider keys, and created application templates.</p></section>
            <section><h2 className="text-base font-bold text-white mb-2">Service Availability</h2><p>Third-party features depend on external AI provider availability. We strive to maintain continuous uptime across all proxy routes.</p></section>
            <section><h2 className="text-base font-bold text-white mb-2">Contact Us</h2><p>For terms inquiries, contact <a className="text-emerald-400 underline font-medium" href="mailto:support@polylingo.ai">support@polylingo.ai</a>.</p></section>
          </div>
        )}
      </article>
    </main>
  );
};

export default LegalPage;
