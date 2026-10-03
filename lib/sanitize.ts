import sanitizeHtml from 'sanitize-html';
export function cleanHtml(value:string){return sanitizeHtml(value,{allowedTags:['p','br','h2','h3','strong','b','em','i','u','ul','ol','li','blockquote','a'],allowedAttributes:{a:['href']},allowedSchemes:['http','https','mailto'],allowProtocolRelative:false,transformTags:{a:sanitizeHtml.simpleTransform('a',{rel:'noopener noreferrer'})}});}
export function mediaUrl(value:string){return value===''||/^\/(?:images\/[-a-zA-Z0-9_.]+|media\/[a-f0-9-]+)$/.test(value);}
