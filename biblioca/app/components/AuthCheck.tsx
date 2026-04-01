"use client";

import { ReactNode, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AuthCheckProps {
  children: ReactNode;
  }

  export default function AuthCheck({ children }: AuthCheckProps) {
    const { isSignedIn, isLoaded } = useUser();
      const router = useRouter();

        useEffect(() => {
            if (isLoaded && !isSignedIn) {
                  router.push("/login"); // pas loggé → redirection login
                      }
                        }, [isLoaded, isSignedIn, router]);

                          // Affiche un loader pendant que Clerk vérifie l'utilisateur
                            if (!isLoaded || !isSignedIn) {
                                return <div className="min-h-screen flex justify-center items-center">Chargement...</div>;
                                  }

                                    return <>{children}</>;
                                    }