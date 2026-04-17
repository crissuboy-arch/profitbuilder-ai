import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LanguageSelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="language">Output Language</Label>
      <Select 
        name="language" 
        defaultValue="English" 
        value={value}
        onValueChange={(v: string | null) => onChange?.(v ?? "English")}
      >
        <SelectTrigger id="language">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="English">English</SelectItem>
          <SelectItem value="Portuguese">Portuguese (PT-BR)</SelectItem>
          <SelectItem value="Spanish">Spanish</SelectItem>
          <SelectItem value="French">French</SelectItem>
          <SelectItem value="German">German</SelectItem>
          <SelectItem value="Italian">Italian</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
