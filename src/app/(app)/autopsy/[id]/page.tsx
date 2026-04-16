import { redirect } from "next/navigation";

export default function AutopsyByIdPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/autopsy?decision=${params.id}`);
}
