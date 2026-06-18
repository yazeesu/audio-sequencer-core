import {
  authCaller,
  authContract,
} from "@/src/shared/services/http/api/auth/requests";
import { tryCatch } from "@/src/shared/utils";
import { redirect } from "next/navigation";

export default async function MePage() {
  const [result, error] = await tryCatch(authCaller.server(authContract.me()));

  if (error) {
    redirect("/auth");
  }

  return (
    <div>
      <h1>Me</h1>
      <p>User: {result.name}</p>
    </div>
  );
}
