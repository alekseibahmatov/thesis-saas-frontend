"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { UserRole } from "@prisma/client";

export const useUserRole = () => {
  const { status, data } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>();

  useEffect(() => {
    if (status === "loading") return;

    function getRole() {
      setRole(data?.user.role);
      setIsLoading(false);
    }

    getRole();
  }, [status, data]);

  return { isLoading, role };
};
