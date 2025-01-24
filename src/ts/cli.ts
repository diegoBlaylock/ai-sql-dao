import { config } from "dotenv";
import { withSql } from "./sql/client.js";
import * as readline from "node:readline/promises";
import { Dao } from "./dao/client.js";
import { StrategyType } from "./dao/strategies/index.js";
import { OpenAiClient } from "./openai/client.js";

async function main() {
	config();

	const strategy = process.argv[2];

	if (!Object.values<string>(StrategyType).includes(strategy)) {
		console.error(
			`Argument must be one of ${Object.values(StrategyType).join(", ")}`,
		);
		process.exit(-1);
	}

	await withSql(async (sql) => {
		await sql.executeScript("./src/sql/create-table.sql");
		await sql.executeScript("./src/sql/populate-table.sql");

		const ai = new OpenAiClient("chatgpt-4o-latest");
		const context = { ai, sql };
		const dao = new Dao(strategy as StrategyType);

		const rl = readline.createInterface(process.stdin, process.stdout);

		while (true) {
			const prompt = await rl.question("Query? ");

			const result = await dao.query(context, prompt);

			switch (result.type) {
				case "success":
					console.info("Result> %s", result.result);
					break;
				case "failure":
					console.error(
						"Failure> %s | prompt: %s",
						(result.reason as Error).message ?? "Unknown Error",
						result.sql,
					);
					break;
			}

			console.log("-".repeat(128));
		}
	});
}

await main();
