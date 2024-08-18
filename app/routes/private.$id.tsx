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
    return { id: params.id, secretUrl, secretText };
  }
};

export default function Private() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Private {data.id}</h1>

      <pre>{data.secretUrl}</pre>
      <pre>{data.secretText}</pre>
    </div>
  );
}
