export interface IExtractOptions {
	inputFile: string;
	outputFile: string;
	excludeString?: string;
	splitter?: string;
	chunkSize?: number;
	chunkOverlap?: number;
	url: string;
	additionalParameters?: any;
	forceLocal?: boolean;
    verbose?: boolean;
}
