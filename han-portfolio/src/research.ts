export type ResearchPaper={id:string;title:string;status:string;authors:string;summary:string;description:string;paperUrl:string;codeUrl:string;image:string};
type Legacy={text:Record<string,string>;links:Record<string,string>;collections:Record<string,unknown>};
export function researchFromLegacy(content:Legacy):ResearchPaper[]{
 if(Array.isArray(content.collections.research))return content.collections.research as ResearchPaper[];
 return [{id:'original-paper',title:content.text.text_25??'',status:content.text.text_23??'',authors:[content.text.text_26,content.text.text_28].filter(Boolean).map(s=>s.trim()).join(' & '),summary:content.text.text_29??'',description:content.text.text_30??'',paperUrl:content.links.researchPaper??'',codeUrl:content.links.researchCode??'',image:''}];
}
export function checkResearch(papers:ResearchPaper[]){
 for(const paper of papers){if(!paper.title.trim())throw new Error('Each research paper needs a title.');for(const url of [paper.paperUrl,paper.codeUrl])if(url&&!/^https?:\/\//i.test(url))throw new Error('Research paper links must start with https:// or http://.');if(paper.image&&!/^https:\/\//i.test(paper.image)&&!paper.image.startsWith('/assets/'))throw new Error('Choose a research photo from your device or use an HTTPS image URL.');}
}
