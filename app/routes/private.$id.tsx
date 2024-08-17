import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return { id: params.id };
};

export default function Private() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Private {data.id}</h1>
    </div>
  );
}
