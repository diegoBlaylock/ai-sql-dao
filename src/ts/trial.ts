import { mkdir, writeFile } from "node:fs/promises";
import { Dao, type DaoSuccess, type DaoResult } from "./dao/client.js";
import type { StrategyType } from "./dao/strategies/index.js";
import type { Context } from "./types.js";
import YAML from "yaml";

export async function runExperiment(
	context: Context,
	questionsToTry: string[],
	strategies: StrategyType[],
) {
	const collection: Partial<Record<StrategyType, Record<string, DaoResult>>> =
		{};

	for (const strategy of strategies) {
		console.log("Trying", strategy);
		for (const q of questionsToTry) {
			console.log("  ", q);
			const dao = new Dao(strategy);
			const result = await dao.query(context, q);
			(result as DaoSuccess).conversation = undefined as unknown as string;
			if (!(strategy in collection)) collection[strategy] = {};
			collection[strategy][q] = result;
		}
	}

	const serialized = YAML.stringify(collection);
	await mkdir("./_output", { recursive: true });
	await writeFile("./_output/output.yaml", serialized);
}
