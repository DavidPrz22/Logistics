import { Controller, useFormContext } from "react-hook-form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SelectOption {
  id: number | string;
}

interface FormSelectProps<T extends SelectOption> {
  name: string;
  options: T[];
  placeholder: string;
  getDisplayValue: (option: T) => string;
  getItemContent: (option: T) => React.ReactNode;
  label?: string;
  onValueChange?: (value: number) => void;
}

export function FormSelect<T extends SelectOption>({
  name,
  options,
  placeholder,
  getDisplayValue,
  getItemContent,
  label,
  onValueChange,
}: FormSelectProps<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedOption = options.find((o) => o.id === field.value);
        return (
          <div>
            {label && (
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                {label}
              </label>
            )}
            <div className={label ? "mt-1" : ""}>
              <Select 
                value={field.value ? String(field.value) : undefined} 
                onValueChange={(val) => {
                  const numVal = Number(val);
                  field.onChange(numVal);
                  onValueChange?.(numVal);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder}>
                    {selectedOption && getDisplayValue(selectedOption)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {getItemContent(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      }}
    />
  );
}
