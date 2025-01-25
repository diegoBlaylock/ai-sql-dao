import { ZeroShotStrategy } from "./zero-shot.js";

export class SingleShotStrategy extends ZeroShotStrategy {
	getIntroPrompt() {
		return `${super.getIntroPrompt()}

Here are an example of what this interaction might look like:
user: "PRODUCE_SQL: Who reviewed the paper on cars?"

assistant: "\`\`\`sql
SELECT p.title, r.firstName, r.lastName
FROM ai.Paper p
JOIN ai.PaperReviewer pr ON p.id = pr.paperId
JOIN ai.Person r ON pr.reviewerId = r.id
JOIN ai.PaperKeyword pk ON p.id = pk.paperId
JOIN ai.Keyword k ON pk.keywordId = k.id 
WHERE p.title ILIKE '%cars%' OR p.abstract ILIKE '%cars%' OR k.name ILIKE '%cars%'
GROUP BY (p.id, r.id);
\`\`\`"

user: "GIVE_RESULTS:
\`\`\`json
[
  {
    \"title\": \"Electric vehicles: the future of cars\",
    \"firstName\": \"Carl\",
    \"lastName\": \"Sagan\"
  },
  {
    \"title\": \"Electric vehicles: the future of cars\",
    \"firstName\": \"Jim\",
    \"lastName\": \"John\"
  }
  {
    \"title\": \"Vehicle emission\",
    \"firstName\": \"Topher\",
    \"lastName\": \"Thompson\"
  }
]
\`\`\`"

assistant: "Reviewers for papers on cars include Carl Sagan and Jim John who reviewed *Electric vehicles: the future of cars* and Topher Thompson who reviewed *Vehicle emission*`;
	}
}
