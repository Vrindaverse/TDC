import { registerForEventAction } from "@/app/events/actions";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await registerForEventAction(null, formData);
  
  if (result?.error) {
    return new Response(result.error, { status: 400 });
  }
  
  return new Response(null, { 
    status: 302,
    headers: { Location: "/profile?registered=1" }
  });
}