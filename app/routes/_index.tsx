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
