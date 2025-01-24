import { readFileSync } from "node:fs";
import type { Thread } from "../../openai/client.js";
import { Strategy } from "./base.js";
import { cleanSql } from "../../sql/utils.js";

export class CustomStrategy extends Strategy {
	getIntroPrompt() {
		return `
Your task is twofold: 1) convert a prompt to a postgres SQL select statement and 2) convert a set of rows to a human friendly response based on the prompt. The user will ask you to do the first task when they begin their message with "PRODUCE_SQL:". Likewise, the user will ask you to do the second task when they begin their message with "GIVE_RESULTS:" followed by JSON description of rows. When you are asked to produce sql, please limit your response to just the sql, or if the prompt is impossible indicate so by saying "ERROR:" and the reason why. When you are asked to give results to so succinctly and a human friendly manner.

In order to produce the sql for a prompt, here is that schema for the tables with the database:
\`\`\`sql
${cleanSql(readFileSync("./src/sql/create-table.sql", { encoding: "utf-8" }))}
\`\`\`

Please consider that you are unfamiliar with data in the database. To deal with this, where reasonable, use pattern matching and compare multiple columns.
`;
	}

	async getSql(thread: Thread, prompt: string): Promise<string> {
		return this.cleanSql(await thread.queryU(`PRODUCE_SQL: ${prompt}`));
	}

	async getResults(
		thread: Thread,
		results: Record<string, unknown>[],
	): Promise<string> {
		return await thread.queryU(
			`GIVE_RESULTS:\n\`\`\`json\n${JSON.stringify(results, undefined, 2)}\n\`\`\``,
		);
	}
}
