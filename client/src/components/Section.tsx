import { ReactNode } from "react";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="surface rounded-2xl p-6">
    <h2 className="text-xl font-semibold text-emberSoft">{title}</h2>
    <div className="mt-4 space-y-3 text-sm text-slate-100/80">{children}</div>
  </section>
);

export default Section;
