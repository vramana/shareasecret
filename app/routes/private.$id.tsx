import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { burnSecret, getSecretPublicData } from "~/server/secret.server";

import { getSession } from "~/server/session.server";
import { commonMeta } from "~/utils/meta";

export const meta = commonMeta;

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  const requestUrl = new URL(request.url);

  const secretData = await getSecretPublicData({ id: params.id as string });

  let secretUrl = session.get("secretUrl");
  let secretText = session.get("secretText");

  if (secretUrl) {
    secretUrl = requestUrl.origin + secretUrl;
    return { id: params.id, secretUrl, secretText, secretData };
  }

  return { id: params.id, secretData };
};

export const action = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params as { id: string };

  await burnSecret(id);

  return redirect(`/private/${id}`);
};

export default function Private() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Form method="post" className="flex flex-col align-center">
        <h2 className="text-gray-900 py-6 font-bold text-xl">Details</h2>
        {"secretUrl" in data && (
          <>
            <input
              className="p-1 w-full"
              disabled
              defaultValue={data.secretUrl}
            />
            <input disabled defaultValue={data.secretText} />
          </>
        )}
        <button className="block my-4 text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
          Burn this secret
        </button>
      </Form>
      <a
        href="/"
        className="block my-4 text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
      >
        Create another secret
      </a>
    </div>
  );
}
