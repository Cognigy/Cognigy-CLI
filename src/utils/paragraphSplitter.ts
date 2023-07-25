/** Node Modules */
import { encode } from 'gpt-3-encoder';

/** Custom Modules */
import CONFIG from './config';

/**
 * Checks if a paragraph is below the token limit and if not, splits it
 * @param title 
 * @param body 
 * @param metadata 
 * @returns 
 */
export function splitParagraphsByTokenLength(title: string, body: string, metadata?: string): string[] {
    const paragraph = `${title ? title + "\n" : ""}${body ? body + "\n" : ""}${metadata ? metadata + "\n" : ""}`;

    // encode paragraph with GPT tokenizer
    const encodedStr = encode(paragraph);

    // check if paragraph is too long
    if (encodedStr.length > CONFIG.maxNumberOfTokens) {
        const parts = Math.ceil(encodedStr.length / CONFIG.maxNumberOfTokens);
        const targetLength = Math.ceil(paragraph.length / parts) - (metadata?.length || 0);

        const sentences = body.match(/[^.!?]+[.!?]+/g) || [];
        const result = [];
        let currentParagraph = `${title ? title + "\n" : ""}`;

        for (const sentence of sentences) {
            if (currentParagraph.length + sentence.length < targetLength) {
                currentParagraph += sentence;
            } else {
                currentParagraph += `\n${metadata ? metadata + "\n" : ""}`;
                result.push(currentParagraph.trim());
                currentParagraph = `${title ? title + "\n" : ""}`;
            }
        }

        return result;
    } else return [paragraph];
}
