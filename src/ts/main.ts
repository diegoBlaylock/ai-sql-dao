import { OpenAiClient } from "./openai/index.js";
import { config } from "dotenv";
import { withSql } from "./sql/client.js";
import { StrategyType } from "./dao/strategies/index.js";
import { runExperiment } from "./trial.js";

async function main() {
	config();

	const strategies = [
		StrategyType.ZERO_SHOT,
		StrategyType.ONE_SHOT,
		StrategyType.MULTI_SHOT,
	];

	const questions = [
		"What universities have the most researchers?",
		"What papers have been written by researchers no associated with a university?",
		"Can you tell what keywords are involved in papers about cats?",
		"Give me the papers written by people from BYU",
		"What are possible additional reviewers for the Cats paper where reviewers can't come from the same universities as the authors?",
		"Give me the list of people associated with each domain.",
		"Can I get the complete list of keywords followed by the papers associated with them?",
		"What papers are associated with the state of New Hampshire?",
		"Get me the complete description of all papers including the title, summary of the abstract and paper, names of the authors and their universities, names of reviewers and their universities, keywords, and domains.",
	];

	await withSql(async (sql) => {
		await sql.executeScript("./src/sql/create-table.sql");
		await sql.executeScript("./src/sql/populate-table.sql");

		await runExperiment(
			{ sql, ai: new OpenAiClient("chatgpt-4o-latest") },
			questions,
			strategies,
		);
		console.log("FINISHED");
	});
}

await main();
