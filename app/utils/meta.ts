import { type MetaFunction } from "@remix-run/node";

export const commonMeta: MetaFunction = () => {
  return [
    { title: "Share A Secret - Share your secrets and password securely" },
    {
      name: "description",
      content:
        "Share A Secret is your trusted platform for secure and confidential password sharing. Safeguard sensitive information with end-to-end encryption, ensuring your secrets remain private. Share passwords, confidential data, and personal messages securely and effortlessly with peace of mind.",
    },
  ];
};
