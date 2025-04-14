import z from "zod";

const envSchema = z.object({
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),
  REDIRECT_URI: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// validate the environment variables
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}
// print the environment variables if in development
if (parsed.data.NODE_ENV === "development") {
  console.log("Environment variables (only printed in development):");
  console.log(parsed.data);
}
export const env = Object.freeze(parsed.data);
export default env;
