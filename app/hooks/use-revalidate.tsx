import { useNavigate } from "@remix-run/react";
import { useCallback } from "react";

// copied from https://sergiodxa.com/articles/automatic-revalidation-in-remix

export function useRevalidate() {
  // We get the navigate function from React Rotuer
  const navigate = useNavigate();
  // And return a function which will navigate to `.` (same URL) and replace it

  return useCallback(
    function revalidate() {
      navigate(".", { replace: true });
    },
    [navigate],
  );
}
