import { useState } from "react";
import { Copy, X } from "lucide-react";
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

export function AddSets({ bodyWeight = false, initialSets }: { bodyWeight?: boolean; initialSets?: WeightItem[] }) {
  const [sets, setSets] = useState<WeightItem[]>(
    initialSets ?? [{ weight: 0, unit: WeightUnits.KG, reps: 0 }]
  );

  const addSet = () => {
    setSets([...sets, { weight: 0, unit: WeightUnits.KG, reps: 0 }]);
  };

  const removeSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  const duplicateSet = (index: number) => {
    const newSets = [...sets];
    newSets.splice(index + 1, 0, { ...sets[index] });
    setSets(newSets);
  };

  return (
    <Card>
      <CardContent>
        {sets.map((set, index) => (
          <div
            key={index}
            className={`grid gap-2 mb-3 items-end ${
              bodyWeight
                ? "grid-cols-[1fr_1fr_auto_auto]"
                : "grid-cols-[1fr_auto_1fr_auto_auto]"
            }`}
          >
            {/* Bodyweight: hidden weight + unit so API payload stays consistent */}
            {bodyWeight && (
              <>
                <input type="hidden" name={`set-${index}-weight`} value="0" />
                <input type="hidden" name={`set-${index}-unit`} value={WeightUnits.KG} />
              </>
            )}

            {/* Weighted: visible weight + unit */}
            {!bodyWeight && (
              <>
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
                        sets.map((s, i) =>
                          i === index ? { ...s, unit: value } : s
                        )
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
              </>
            )}

            <div className="grid gap-1">
              <Label htmlFor={`set-${index}-reps`}>Reps</Label>
              <Input
                type="number"
                value={set.reps || ""}
                id={`set-${index}-reps`}
                name={`set-${index}-reps`}
                step="1"
                min={1}
                required={!bodyWeight}
                onChange={(e) =>
                  setSets(
                    sets.map((s, i) =>
                      i === index
                        ? { ...s, reps: parseInt(e.target.value, 10) || 0 }
                        : s
                    )
                  )
                }
                placeholder="Reps"
              />
            </div>

            {bodyWeight && (
              <div className="grid gap-1">
                <Label htmlFor={`set-${index}-duration`}>Duration (s)</Label>
                <Input
                  type="number"
                  value={set.duration || ""}
                  id={`set-${index}-duration`}
                  name={`set-${index}-duration`}
                  step="1"
                  min={1}
                  onChange={(e) =>
                    setSets(
                      sets.map((s, i) =>
                        i === index
                          ? {
                              ...s,
                              duration: parseInt(e.target.value, 10) || undefined,
                            }
                          : s
                      )
                    )
                  }
                  placeholder="e.g. 60"
                />
              </div>
            )}

            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => duplicateSet(index)}
              aria-label={`Duplicate set ${index + 1}`}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              type="button"
              onClick={() => removeSet(index)}
              aria-label={`Remove set ${index + 1}`}
            >
              <X className="h-4 w-4" />
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
