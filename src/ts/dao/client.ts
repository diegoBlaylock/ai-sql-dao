import type { Context } from "../types.js";
import { getStrategy, type StrategyType } from "./strategies/index.js";
import type { Strategy } from "./strategies/base.js";

export class Dao {
	#strategy: Strategy;

	constructor(strategy: StrategyType) {
		this.#strategy = getStrategy(strategy);
	}

	async query(context: Context, prompt: string): Promise<DaoResult> {
		let sql: string | undefined;
		let rows: Record<string, unknown>[] | undefined;

		try {
			const thread = context.ai.startThread();

			const introPrompt = this.#strategy.getIntroPrompt();
			if (introPrompt != null) thread.writeD(introPrompt);

			sql = await this.#strategy.getSql(thread, prompt);
			const [result] = await context.sql.query(sql);
			rows = result.rows;

			const cleanedResult = await this.#strategy.getResults(thread, rows);

			return {
				type: "success",
				sql,
				rows,
				conversation: thread.getThread(),
				result: cleanedResult,
			};
		} catch (e) {
			return {
				type: "failure",
				sql,
				rows,
				reason: e,
			};
		}
	}
}

export type DaoResult = DaoSuccess | DaoFailure;

export interface DaoSuccess {
	type: "success";
	sql: string;
	rows: Record<string, unknown>[];
	result: string;
	conversation: string;
}

export interface DaoFailure {
	type: "failure";
	sql?: string;
	rows?: Record<string, unknown>[];
	reason: unknown;
}
