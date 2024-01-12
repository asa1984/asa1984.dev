import { api_route } from "@/features/revalidater";
import { handle } from "hono/vercel";

export const runtime = "edge";

export const POST = handle(api_route);
