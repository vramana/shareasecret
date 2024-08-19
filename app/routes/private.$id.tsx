import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
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
  const urlRef = useRef<HTMLInputElement>(null);

  function onCopy() {
    const input = urlRef.current!;
    if (input == null) return;
    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(input.value).then(() => {
      alert("URL copied to clipboard!");
    });
  }

  return (
    <div className="flex flex-col align-center">
      <h2 className="text-gray-900 py-6 font-bold text-xl">Details</h2>
      {"secretUrl" in data && (
        <>
          <div className="flex items-center space-x-2">
            <input
              ref={urlRef}
              id="urlInput"
              type="text"
              defaultValue={data.secretUrl}
              className="w-full px-4 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
              disabled
            />
            <button
              type="button"
              onClick={onCopy}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Copy
            </button>
          </div>
          <textarea
            disabled
            name="text"
            defaultValue={data.secretText}
            className="bg-white flex my-2 p-2  w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800"
          />
        </>
      )}
      <Form method="post" className="flex flex-col">
        <button className="block my-4 text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5">
          Burn this secret
        </button>
      </Form>
      <a
        href="/"
        className="block my-4 text-center text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
      >
        Create another secret
      </a>
    </div>
  );
}
