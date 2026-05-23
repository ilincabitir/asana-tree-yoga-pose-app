import { useEffect, useState } from 'react';
import { fetchWorkoutDsu } from '../api';

export default function useDsuMap(workouts) {
  const [dsuMap, setDsuMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const missing = workouts.filter((workout) => !dsuMap[workout.id]);
      if (!missing.length) return;
      const results = await Promise.all(
        missing.map(async (workout) => {
          try {
            const parent = await fetchWorkoutDsu(workout.items);
            return { id: workout.id, parent };
          } catch {
            return { id: workout.id, parent: workout.items.map((_, i) => i) };
          }
        })
      );
      if (cancelled) return;
      setDsuMap((prev) => {
        const next = { ...prev };
        results.forEach((result) => {
          next[result.id] = result.parent;
        });
        return next;
      });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [workouts]);

  return dsuMap;
}
