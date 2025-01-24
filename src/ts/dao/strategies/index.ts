import type { Strategy } from "./base.js";
import { MultiShotStrategy } from "./multi-shot.js";
import { SingleShotStrategy } from "./single-shot.js";
import { ZeroShotStrategy } from "./zero-shot.js";

export enum StrategyType {
	ZERO_SHOT = "zero_shot",
	ONE_SHOT = "one_shot",
	MULTI_SHOT = "multi_shot",
}

export function getStrategy(type: StrategyType): Strategy {
	switch (type) {
		case StrategyType.ZERO_SHOT:
			return new ZeroShotStrategy();
		case StrategyType.ONE_SHOT:
			return new SingleShotStrategy();
		case StrategyType.MULTI_SHOT:
			return new MultiShotStrategy();
	}
}
