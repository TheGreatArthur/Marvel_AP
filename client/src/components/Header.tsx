const Header = () => (
  <header className="relative z-10 px-6 py-10 md:px-12">
    <div className="mx-auto flex max-w-6xl flex-col gap-3">
      <p className="text-sm uppercase tracking-[0.4em] text-ember/80">Marvel Heroes Explorer</p>
      <h1 className="font-['Bebas_Neue'] text-5xl md:text-7xl">
        Marvel Heroes Explorer
      </h1>
      <p className="max-w-2xl text-sm text-slate-100/70">
        Recherche intelligente, fiches détaillées et premières apparitions : un pokédex de héros basé sur l’API
        SuperHero.
      </p>
    </div>
  </header>
);

export default Header;
