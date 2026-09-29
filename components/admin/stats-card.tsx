import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function StatsCard({ title, value, icon, subtitle, className }: StatsCardProps) {
  return (
    <Card className={cn("p-6 shadow-sm border bg-card text-card-foreground", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
