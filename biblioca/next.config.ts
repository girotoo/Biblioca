import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
        serverActions: {
              allowedOrigins: [
                      "scaling-funicular-6vw9v6qwp54f5g5w-3000.app.github.dev",
                              "localhost:3000"
                                    ],
                                        },
                                          },
                                          };

                                          export default nextConfig;
                                          