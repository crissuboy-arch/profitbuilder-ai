import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CountrySelectProps {
  label?: string;
}

export function CountrySelect({ label = "Target Country" }: CountrySelectProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <Select name="country" defaultValue="Brazil">
        <SelectTrigger className="rounded-lg">
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Brazil">🇧🇷 Brasil</SelectItem>
          <SelectItem value="United States">🇺🇸 United States</SelectItem>
          <SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
          <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
          <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
          <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
          <SelectItem value="Spain">🇪🇸 España</SelectItem>
          <SelectItem value="Mexico">🇲🇽 México</SelectItem>
          <SelectItem value="France">🇫🇷 France</SelectItem>
          <SelectItem value="Germany">🇩🇪 Deutschland</SelectItem>
          <SelectItem value="India">🇮🇳 India</SelectItem>
          <SelectItem value="Global">🌍 Global</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
