import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="page-shell">
    <main className="relative z-10 mx-auto max-w-3xl px-6 py-20 md:px-12">
      <div className="surface rounded-2xl p-8">
        <h1 className="text-3xl font-semibold">404</h1>
        <p className="mt-3 text-sm text-slate-100/70">Cette page n’existe pas.</p>
        <Link to="/" className="mt-4 inline-flex text-sm text-emberSoft">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  </div>
);

export default NotFound;
