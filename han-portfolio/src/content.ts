import {useEffect,useState} from 'react';
import initial from './initial-content.json';
import {supabase} from './supabase';
import {researchFromLegacy,checkResearch,type ResearchPaper} from './research';
export type Content=Omit<typeof initial,'text'|'links'|'images'|'collections'> & {text:Record<string,string>;links:Record<string,string>;images:Record<string,string>;collections:typeof initial.collections & {research:ResearchPaper[]}};
export function normalizeContent(value:unknown):Content{const input=value as Content;return {...input,collections:{...input.collections,research:researchFromLegacy(input)}};}
export const initialContent:Content=normalizeContent(initial);
export function usePortfolioContent(){
 const [content,setContent]=useState<Content>(initialContent);
 useEffect(()=>{let alive=true;if(supabase)supabase.from('portfolio_published').select('content').eq('id',1).maybeSingle().then(({data,error})=>{if(alive&&!error&&data?.content)setContent(normalizeContent(data.content))});return()=>{alive=false}},[]);
 return content;
}
export function validateContent(value:Content){
 checkResearch(value.collections.research);
 for(const href of Object.values(value.links)){if(href&&!/^(https?:\/\/|mailto:)/i.test(href))throw new Error('Links must start with https://, http://, or mailto:.')}
 for(const href of Object.values(value.images)){if(href&&!/^(https:\/\/|\/assets\/)/i.test(href))throw new Error('Photo URLs must be HTTPS or existing local assets.')}
 if(!value.collections||!value.text)throw new Error('Invalid portfolio content.');
}
