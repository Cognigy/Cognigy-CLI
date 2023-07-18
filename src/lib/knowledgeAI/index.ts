/** stores */
export { createKnowledgeStore } from "./store/createKnowledgeStore";
export { deleteKnowledgeStore } from "./store/deleteKnowledgeStore";
export { indexKnowledgeStores } from "./store/indexKnowledgeStores";
export { readKnowledgeStore } from "./store/readKnowledgeStore";
export { updateKnowledgeStore } from "./store/updateKnowledgeStore";

/** sources */
export { createKnowledgeSource } from "./source/createKnowledgeSource";
export { deleteKnowledgeSource } from "./source/deleteKnowledgeSource";
export { indexKnowledgeSources } from "./source/indexKnowledgeSources";
export { readKnowledgeSource } from "./source/readKnowledgeSource";

export { ingest } from "./ingest";
export { extract } from "./extract";

export { deleteDocument } from "./deleteDocument";
export { deleteSource as deleteAllDocuments } from "./deleteSource";
export { handleSize } from "./handleSize";
export { IExtractOptions } from "./IExtractOptions";