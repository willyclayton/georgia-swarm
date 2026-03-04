type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-swarm-text">{title}</h1>
        {subtitle && <p className="text-swarm-muted text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
