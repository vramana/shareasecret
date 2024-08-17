import type { MetaFunction } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { encrypt, decrypt } from "~/server/secret.server";
import { json } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Share A Secret - Share your secrets and password securely" },
    {
      name: "description",
      content:
        "Share A Secret is your trusted platform for secure and confidential password sharing. Safeguard sensitive information with end-to-end encryption, ensuring your secrets remain private. Share passwords, confidential data, and personal messages securely and effortlessly with peace of mind.",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "encrypt": {
      const text = formData.get("text") as string;
      const key = await encrypt(text);
      return json({ success: true, key: key });
    }

    case "decrypt": {
      const userKey = String(formData.get("key"));

      const message = await decrypt(userKey);
      return json({ success: true, message });
    }

    default:
      return json({ success: false, message: "Unknown action" });
  }
}

export default function Index() {
  const data = useActionData<typeof action>();
  console.log({ data });

  return (
    <div className="text-center py-10">
      <div>
        <h4 className="text-gray-900 py-6 font-bold text-5xl">
          Enter your secret here
        </h4>
        <Form method="post">
          <input type="hidden" name="intent" value="encrypt" />
          <input
            type="text"
            name="text"
            className="p-2 rounded-md bg-gray-100"
          />
          <button
            className="mx-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            type="submit"
          >
            Go
          </button>
        </Form>
        {data && "key" in data && <p>copy and save this url: {data.key}</p>}
      </div>
      <div>
        <h4 className="text-gray-900 py-6 font-bold text-5xl">
          Enter your key here decrypt
        </h4>
        <Form method="post">
          <input type="hidden" name="intent" value="decrypt" />
          <input
            type="text"
            name="key"
            className="p-2 rounded-md bg-gray-100"
          />
          <button
            className="mx-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            type="submit"
          >
            Go
          </button>
        </Form>
        {data && "message" in data && <p>{data.message}</p>}
      </div>
    </div>
  );
}
