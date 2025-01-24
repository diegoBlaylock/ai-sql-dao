import { OpenAI } from "openai";
import process, { stdout } from "node:process";
import { Writable } from "node:stream";

export class OpenAiClient {
	#client: OpenAI;
	#threadSpawner: (opts: ThreadOpts) => Thread;
	#model: OpenAI.ChatModel;

	constructor(model: OpenAI.ChatModel) {
		this.#client = new OpenAI({ apiKey: process.env.OPENAI_KEY });
		this.#threadSpawner = this.#getThreadSpawner();
		this.#model = model;
	}

	startThread(opts: ThreadOpts = {}) {
		return this.#threadSpawner(opts);
	}

	#query(messages: OpenAI.ChatCompletionMessageParam[]) {
		return this.#client.chat.completions.create({
			messages: messages,
			model: this.#model,
			stream: true,
			n: 1,
		} as OpenAI.ChatCompletionCreateParamsStreaming);
	}

	#getThreadSpawner(): (opts: ThreadOpts) => Thread {
		const outer = this;
		const custom = class extends Thread {
			protected async query(
				messages: OpenAI.ChatCompletionMessageParam[],
			): Promise<string> {
				const response = await outer.#query(messages);

				const acc = [];
				for await (const part of response) {
					const chunk =
						part.choices[0].delta.content ??
						part.choices[0].delta.refusal ??
						"";
					// stdout.write(chunk); // This is fun to see realtime output
					acc.push(chunk);
				}

				return acc.join("");
			}
		};

		return (opts) => new custom(opts);
	}
}

export interface ThreadOpts {
	trackResponses?: boolean;
}

export abstract class Thread {
	protected opts: ThreadOpts;

	#messages: OpenAI.ChatCompletionMessageParam[] = [];
	constructor(opts: ThreadOpts) {
		this.opts = opts;
	}

	writeD(text: string) {
		this.#addMessage("developer", text);
		return this;
	}

	writeU(text: string) {
		this.#addMessage("user", text);
		return this;
	}

	async submit(): Promise<string> {
		return this.processResponse(await this.query(this.#messages));
	}

	queryU(text: string): Promise<string> {
		this.writeU(text);
		return this.submit();
	}

	getThread(): string {
		return this.#messages
			.map(
				({ role, content }) =>
					`${role}\n${"-".repeat(64)}\n${(content as string)
						.split("\n")
						.map((t) => `${" ".repeat(4)}${t}`)
						.join("\n")}`,
			)
			.join("\n\n");
	}

	#addMessage(role: OpenAI.ChatCompletionMessageParam["role"], text: string) {
		this.#messages.push({
			role,
			content: text,
		} as OpenAI.ChatCompletionMessageParam);
	}

	processResponse(text: string): string {
		if (this.opts.trackResponses ?? true) this.#addMessage("assistant", text);
		return text;
	}

	protected abstract query(
		messages: OpenAI.ChatCompletionMessageParam[],
	): Promise<string>;
}
