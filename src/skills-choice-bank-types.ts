export type ChoiceBankRaw=[id:number,term:string,example:string,prompt:string,precision:boolean,options:[text:string,why:string][]];
export type ChoiceBankCategory='Language'|'Structural'|'Narrative'|'Visual / multimodal';
export type ChoiceBankQuestion={id:number;category:ChoiceBankCategory;term:string;example:string;prompt:string;precision:boolean;options:{text:string;why:string;correct:boolean}[]};
