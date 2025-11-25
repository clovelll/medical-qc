import { cookies } from "next/headers";
import Doctor from "@/views/doctor";
import Patient from "@/views/patient";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("qc_role")?.value;

  if (role === "doctor") {
    return <Doctor />;
  }

  return <Patient />;
}
