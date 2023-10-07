import express, { Application } from "express";
import env from "./env";
import z from "zod";
import { val } from "./routeValidator";
import { HttpCodes } from "./enums";

const app: Application = express();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

app.use(express.json());

app.get("/", (_, res) => {
  res.send("Hello World!");
});

const schema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
});
app.post("/", val("body", schema), async (req, res) => {
  try {
    const body = req.body as z.infer<typeof schema>;
    await sleep(1000);
    return res.status(HttpCodes.OK).send(JSON.stringify(body));
  } catch (err: any) {
    console.error(`[Error] in ${req.path} :`, err.stack);
    return res.status(HttpCodes.SERVER_ERROR).send(err.message);
  }
});

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
