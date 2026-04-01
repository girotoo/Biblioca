"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
            <SignIn
                    path="/login"
                            routing="path"   // ou "hash" si tu veux éviter le catch-all
                                    redirectUrl="/assets"
                                          />
                                              </div>
                                                );
                                                }