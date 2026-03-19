import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function CountrySelect() {
  return (
    <div className="space-y-2">
      <Label htmlFor="country">Target Country Model</Label>
      <Select name="country" defaultValue="United States" required>
        <SelectTrigger id="country">
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="United States">🇺🇸 United States</SelectItem>
          <SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
          <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
          <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
          <SelectItem value="Brazil">🇧🇷 Brazil</SelectItem>
          <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
          <SelectItem value="Spain">🇪🇸 Spain</SelectItem>
          <SelectItem value="Mexico">🇲🇽 Mexico</SelectItem>
          <SelectItem value="France">🇫🇷 France</SelectItem>
          <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
          <SelectItem value="India">🇮🇳 India</SelectItem>
          <SelectItem value="Global (Generic)">🌍 Global (Generic)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
