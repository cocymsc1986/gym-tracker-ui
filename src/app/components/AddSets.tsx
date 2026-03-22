import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { WeightUnits, type WeightItem } from "@/types/Exercise";

const weightUnits = Object.values(WeightUnits);

export function AddSets() {
  const [sets, setSets] = useState<WeightItem[]>([
    { weight: 0, unit: WeightUnits.KG, reps: 0 },
  ]);

  const addSet = () => {
    setSets([...sets, { weight: 0, unit: WeightUnits.KG, reps: 0 }]);
  };

  const removeSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Column headers */}
      <div className="grid grid-cols-[2rem_1fr_5rem_1fr_2rem] gap-2 px-1 font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
        <span>#</span>
        <span>Weight</span>
        <span>Unit</span>
        <span className="text-center">Reps</span>
        <span />
      </div>

      {sets.map((set, index) => (
        <div
          key={index}
          className="grid grid-cols-[2rem_1fr_5rem_1fr_2rem] gap-2 items-center"
        >
          <span className="font-headline font-bold text-sm text-primary-dark">
            {index + 1}
          </span>
          <Input
            type="number"
            value={set.weight || ""}
            id={`set-${index}-weight`}
            name={`set-${index}-weight`}
            step="0.1"
            required
            onChange={(e) =>
              setSets(
                sets.map((s, i) =>
                  i === index
                    ? { ...s, weight: parseFloat(e.target.value) }
                    : s
                )
              )
            }
            placeholder="0"
            className="bg-surface-high border-0 focus-visible:ring-0 focus-visible:bg-surface-highest rounded-lg h-10 font-headline font-bold text-center"
          />
          <Select
            value={set.unit}
            name={`set-${index}-unit`}
            onValueChange={(value: WeightUnits) =>
              setSets(
                sets.map((s, i) => (i === index ? { ...s, unit: value } : s))
              )
            }
          >
            <SelectTrigger className="bg-surface-high border-0 focus:ring-0 rounded-lg h-10 font-sans text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weightUnits.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={set.reps || ""}
            id={`set-${index}-reps`}
            name={`set-${index}-reps`}
            step="1"
            min={1}
            required
            onChange={(e) =>
              setSets(
                sets.map((s, i) =>
                  i === index
                    ? { ...s, reps: parseFloat(e.target.value) }
                    : s
                )
              )
            }
            placeholder="0"
            className="bg-surface-high border-0 focus-visible:ring-0 focus-visible:bg-surface-highest rounded-lg h-10 font-headline font-bold text-center"
          />
          <button
            type="button"
            onClick={() => removeSet(index)}
            className="text-muted-foreground hover:text-destructive transition-colors font-bold text-lg leading-none"
            aria-label="Remove set"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addSet}
        className="w-full py-3 border border-dashed border-surface-highest rounded-lg font-headline font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary-dark hover:border-primary transition-all"
      >
        + Add Set
      </button>
    </div>
  );
}
