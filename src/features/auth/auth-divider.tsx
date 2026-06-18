import { Separator } from "@/components/ui/separator";

export default function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <Separator className="flex-1" />
      <span className="text-muted-foreground">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}
