import { OpenAI } from "openai";
import process from "node:process";
import { Thread, type ThreadOpts } from "./thread.js";

export class OpenAiClient {
	#client: OpenAI;
	#model: OpenAI.ChatModel;

	constructor(model: OpenAI.ChatModel) {
		this.#client = new OpenAI({ apiKey: process.env.OPENAI_KEY });
		this.#model = model;
	}

	startThread(opts: ThreadOpts = {}) {
		return new OpenAiClient.#Thread(this, opts);
	}

	#query(messages: OpenAI.ChatCompletionMessageParam[]) {
		return this.#client.chat.completions.create({
			messages: messages,
			model: this.#model,
			stream: true,
			n: 1,
		} as OpenAI.ChatCompletionCreateParamsStreaming);
	}

	static #Thread = class extends Thread {
		#client: OpenAiClient;
		constructor(client: OpenAiClient, opts: ThreadOpts) {
			super(opts);
			this.#client = client;
		}

		protected async query(
			messages: OpenAI.ChatCompletionMessageParam[],
		): Promise<string> {
			const response = await this.#client.#query(messages);

			const acc = [];
			for await (const part of response) {
				const chunk =
					part.choices[0].delta.content ?? part.choices[0].delta.refusal ?? "";
				// stdout.write(chunk); // This is fun to see realtime output
				acc.push(chunk);
			}

			return acc.join("");
		}
	};
}
