import { json, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { decrypt, getSecretPublicData } from "~/server/secret.server";
import { commonMeta } from "~/utils/meta";

export const meta = commonMeta;

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { cuid } = params as { cuid: string; key: string };

  const secretData = await getSecretPublicData({ cuid });

  const exists =
    secretData.success &&
    secretData.data.burnedAt == null &&
    secretData.data.expiresAt > new Date();

  return {
    exists,
  };
};

export async function action({ params }: LoaderFunctionArgs) {
  const { cuid, key } = params as { cuid: string; key: string };

  const result = await decrypt({ cuid, key });

  return json(result);
}

export default function Secret() {
  const { pathname } = useLocation();
  const loaderData = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  let content: JSX.Element | null;
  if (data?.success) {
    content = <pre>{JSON.stringify(data, null, 2)}</pre>;
  } else if (loaderData.exists) {
    content = (
      <Form method="post" action={pathname}>
        <button>Show secret</button>
      </Form>
    );
  } else {
    content = (
      <p>Secret does not exist anymore. Contact the owner of the secret</p>
    );
  }

  return (
    <div>
      <h2>Secret</h2>
      {content}
    </div>
  );
}
