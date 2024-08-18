import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSecretPublicData } from "~/server/secret.server";

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

export default function Private() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
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
    </div>
  );
}
