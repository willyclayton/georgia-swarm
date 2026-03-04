type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-4">
        <div className="w-1 self-stretch bg-swarm-gold rounded-full mt-0.5" />
        <div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight leading-none text-swarm-text">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs uppercase tracking-widest text-swarm-muted mt-1.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
