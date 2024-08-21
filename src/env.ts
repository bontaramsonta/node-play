import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  RABBIT_URL: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// validate the environment variables
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    `Missing or invalid environment variable${
      parsed.error.errors.length > 1 ? "s" : ""
    }:
  ${parsed.error.errors
    .map((error) => `  ${error.path}: ${error.message}`)
    .join("\n")}
  `
  );
  process.exit(1);
}
// print the environment variables if in development
if (parsed.data.NODE_ENV === "development") {
  console.log("Environment variables (only printed in development):");
  console.log(parsed.data);
}
export const env = Object.freeze(parsed.data);
export default env;
