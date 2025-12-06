import { handle } from "hono/vercel";
import { api_route } from "@/features/revalidater";

export const runtime = "edge";

export const POST = handle(api_route);
