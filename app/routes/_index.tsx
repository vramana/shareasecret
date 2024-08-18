import {
  type ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { encrypt } from "~/server/secret.server";
import { commitSession, getSession } from "~/server/session.server";
import { commonMeta } from "~/utils/meta";

export const meta = commonMeta;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  const headers: Record<string, string> = {};
  if (!session.has("userId")) {
    session.set("userId", "anonymous");
    headers["Set-Cookie"] = await commitSession(session);
  }

  return json({}, { headers });
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  const text = formData.get("text") as string;
  const { id, secretUrl } = await encrypt({ text });

  session.flash("secretUrl", `/secret/${secretUrl}`);
  session.flash("secretText", text);

  return redirect(`/private/${id}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Index() {
  return (
    <Form method="post" className="flex flex-col align-center">
      <div className="text-center">
        <h2 className="text-gray-900 py-6 font-bold text-xl">
          Enter your secret here
        </h2>
        <div className="w-full">
          <textarea
            name="text"
            className="bg-white flex p-2  w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800"
          />
          <button
            className="block my-4 text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            type="submit"
          >
            Create a secret
          </button>
        </div>
      </div>
    </Form>
  );
}
