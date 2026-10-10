import {marked} from 'marked';
import sanitizeHtml from 'sanitize-html';
export function renderMarkdown(markdown:string){
  return sanitizeHtml(marked.parse(markdown,{async:false}),{
    allowedTags:['p','h2','h3','h4','ul','ol','li','strong','em','blockquote','a','hr','br','code','pre','table','thead','tbody','tr','th','td'],
    allowedAttributes:{a:['href','title']},allowedSchemes:['https','http','mailto'],allowProtocolRelative:false,
  });
}
