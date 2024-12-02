// app/api/webhooks/github/route.js
import { exec } from "child_process";
import crypto from "crypto";
console.log("Application started at", new Date().toISOString());

// GitHub Webhook Handler
export async function POST(req: Request) {
  try {
    console.log("Incoming GitHub webhook request");

    const secret = process.env.WEBHOOKS_SECRET;
    const repoPath = process.env.REPO_PATH;

    if (!secret || !repoPath) {
      console.error("Missing required environment variables.");
      return new Response("Server configuration error", { status: 500 });
    }

    const body = await req.json();
    const signature =
      "sha256=" +
      crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(body))
        .digest("hex");

    const githubSignature = req.headers.get("x-hub-signature-256");

    // Debug logs to help with troubleshooting
    console.log("Calculated signature:", signature);
    console.log("GitHub provided signature:", githubSignature);
    console.log("Received ref:", body.ref);

    if (githubSignature === signature && body.ref === "refs/heads/main") {
      // exec(
      //   `cd ${repoPath} && git pull && npm install && npm run build && pm2 restart ${app}`,
      exec(
        "/bin/bash /home/jsclimbe/repositories/turborepo-jsclimber/apps/web/deploy.sh",
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Execution error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          if (stderr) {
            console.error(`stderr: ${stderr}`);
          }
        },
      );
      console.log("GitHub webhook executed successfully.");
      return new Response("Webhook handled successfully", { status: 200 });
    }

    console.warn("Webhook signature mismatch or invalid ref.");
    return new Response("Webhook not authorized", { status: 403 });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
