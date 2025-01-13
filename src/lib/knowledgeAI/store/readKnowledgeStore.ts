/** Custom Modules */
import CognigyClient from '../../../utils/cognigyClient';

export const readKnowledgeStore = async (
  knowledgeStoreId: string
): Promise<void> => {
  try {
    const store = await CognigyClient.readKnowledgeStore({
      knowledgeStoreId,
    });

    console.log(
      `\n\nKnowledgeAI Store with id: ${knowledgeStoreId}\n store: ${JSON.stringify(store, null, 2)}`
    );
  } catch (err) {
    console.error(
      `Error getting the the store for KnowledgeAI store(${knowledgeStoreId}),\nerr: ${err}`
    );
    throw err;
  }
};
