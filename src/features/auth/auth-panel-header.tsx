import { Music2 } from "lucide-react";

type AuthPanelHeaderProps = {
  title: string;
  subtitle: string;
};

export default function AuthPanelHeader({
  title,
  subtitle,
}: AuthPanelHeaderProps) {
  return (
    <header className="text-center lg:text-left">
      <div className="lg:hidden flex justify-center mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Music2 className="w-8 h-8 text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </header>
  );
}
