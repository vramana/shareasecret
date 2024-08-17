import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { encrypt } from "~/server/secret.server";

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

  const text = formData.get("text") as string;
  const key = await encrypt(text);
  return redirect(`/private/${key.id}`);
}

export default function Index() {
  return (
    <div className="text-center py-10">
      <h4 className="text-gray-900 py-6 font-bold text-5xl">
        Enter your secret here
      </h4>
      <Form method="post" className="flex flex-col align-center">
        <div className="w-[50%]">
          <textarea
            name="text"
            className="flex p-2 rounded-md bg-gray-100 w-full"
          />
          <button
            className="block mx-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            type="submit"
          >
            Create a secret
          </button>
        </div>
      </Form>
    </div>
  );
}
