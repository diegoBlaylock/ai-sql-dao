import type { Thread } from "../../openai/client.js";

export abstract class Strategy {
	abstract getIntroPrompt(): string | null;
	abstract getSql(thread: Thread, prompt: string): Promise<string>;
	abstract getResults(
		thread: Thread,
		results: Record<string, unknown>[],
	): Promise<string>;

	protected cleanSql(aiOutput: string) {
		const start = aiOutput.indexOf("```sql") + 7;
		if (start === -1) return aiOutput;
		const end = aiOutput.indexOf("```", start);
		return aiOutput.slice(start, end);
	}
}
