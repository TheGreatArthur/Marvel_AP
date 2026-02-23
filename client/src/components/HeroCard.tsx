import { Link } from "react-router-dom";
import { Hero } from "../types/marvel";
import { getImageUrl } from "../lib/utils";

const HeroCard = ({ hero }: { hero: Hero }) => {
  const imageUrl = getImageUrl(hero.imageUrl);

  return (
    <div className="surface flex flex-col overflow-hidden rounded-2xl">
      <div className="relative flex h-56 items-center justify-center bg-slate-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={hero.name}
            loading="lazy"
            className="h-full w-full object-contain object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-100/60">
            Image non disponible
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-lg font-semibold">{hero.name}</h3>
        <Link
          to={`/hero/${hero.id}`}
          className="mt-auto inline-flex items-center justify-center rounded-xl bg-ember px-4 py-2 text-sm font-semibold text-white transition hover:bg-emberSoft"
        >
          Voir détails
        </Link>
      </div>
    </div>
  );
};

export default HeroCard;
