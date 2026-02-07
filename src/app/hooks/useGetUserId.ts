import { useState, useEffect } from "react";
import { getUserId } from "@/lib/getUserId";

export function useGetUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  if (!userId) {
    console.warn("User ID not found or invalid token");
    return null;
  }

  return userId;
}
