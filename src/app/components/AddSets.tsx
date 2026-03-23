import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardContent>
        {sets.map((set, index) => (
          <div key={index} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 mb-3 items-end">
            <div className="grid gap-1">
              <Label htmlFor={`set-${index}-weight`}>Weight</Label>
              <Input
                type="number"
                value={set.weight}
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
                placeholder="Weight"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`set-${index}-unit`}>Unit</Label>
              <Select
                value={set.unit}
                name={`set-${index}-unit`}
                onValueChange={(value: WeightUnits) =>
                  setSets(
                    sets.map((s, i) => (i === index ? { ...s, unit: value } : s))
                  )
                }
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {weightUnits.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`set-${index}-reps`}>Reps</Label>
              <Input
                type="number"
                value={set.reps}
                id={`set-${index}-reps`}
                name={`set-${index}-reps`}
                step="1"
                min={1}
                required
                onChange={(e) =>
                  setSets(
                    sets.map((s, i) =>
                      i === index ? { ...s, reps: parseFloat(e.target.value) } : s
                    )
                  )
                }
                placeholder="Reps"
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeSet(index)}
              aria-label={`Remove set ${index + 1}`}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          className="mt-2"
          onClick={addSet}
          type="button"
        >
          Add Set
        </Button>
      </CardContent>
    </Card>
  );
}
