import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

/**
 * A custom hook to get the first-level page name from the current URL.
 *
 * @returns {string} The first-level page name from the URL.
 */
const useActivePath = () => {
  const pathname = usePathname();

  // Extract the first-level page name. This assumes the pathname will start
  // with a "/", so the first element after split will be an empty string.
  const segments = pathname.split("/").filter(Boolean);

  // Return the first segment if available, otherwise null (or handle as needed)
  return segments.length > 2 ? `/${segments[1]}` : "/dashboard";
};

export default useActivePath;
