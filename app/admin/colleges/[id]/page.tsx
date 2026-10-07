import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { CollegeForm } from "@/components/admin/college-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { colleges } from "@/lib/db/schema";

export const instant = false;

export default async function AdminCollegeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [college] = await db
    .select()
    .from(colleges)
    .where(eq(colleges.id, id))
    .limit(1);
  if (!college) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-card px-5 py-4">
        <div className="flex flex-col gap-1">
          <p className="tdc-mono-label text-[11px] text-primary">
            consoles / colleges / edit
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            {college.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Updating the name or code here updates it for every member already
            linked to this college.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Edit college</CardTitle>
          <CardDescription className="text-xs">
            Codes must stay unique across the directory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CollegeForm
            college={{
              id: college.id,
              name: college.name,
              code: college.code,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
