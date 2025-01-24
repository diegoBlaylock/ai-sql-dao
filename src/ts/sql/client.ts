import { readFile } from "node:fs/promises";
import pg from "pg";

export async function withSql<T = void>(
	fn: (sql: SqlClient) => Promise<T> | T,
) {
	const _client = new pg.Client({
		host: "localhost",
		port: 5432,
		user: process.env.PG_USER,
		password: process.env.PG_PSWD,
		database: process.env.PG_DB,
	});
	await _client.connect();

	const client = new SqlClient(_client);

	try {
		return await fn(client);
	} finally {
		await client.destroy();
	}
}

export type { SqlClient };
class SqlClient {
	#client: pg.Client;
	constructor(client: pg.Client) {
		this.#client = client;
	}

	async query(string: string) {
		return this.#format(await this.#client.query(string));
	}

	async executeScript(path: string) {
		const script = await readFile(path, { encoding: "utf-8" });
		return await this.query(script);
	}

	destroy() {
		return this.#client.end();
	}

	#format<T extends pg.QueryResultRow>(
		result: pg.QueryResult<T> | pg.QueryResult<T>[],
	) {
		return Array.isArray(result) ? result : [result];
	}
}
