/** Custom Modules */
import { extract } from "../../lib/knowledgeAI";

/** Interfaces */
import { IExtractOptions } from "./IExtractOptions";

export const extractCMD = async (
	type: string,
    options: IExtractOptions
) => {

	return extract(type, options);
};
