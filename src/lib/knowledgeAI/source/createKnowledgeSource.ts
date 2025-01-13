/* Custom  Modules */
import { TKnowledgeSourceType } from '@cognigy/rest-api-client';
import CognigyClient from '../../../utils/cognigyClient';

export const createKnowledgeSource = async (
  knowledgeStoreId: string,
  name: string,
  description: string,
  type: TKnowledgeSourceType,
  url?: string
): Promise<void> => {
  try {
    const source = await CognigyClient.createKnowledgeSource({
      knowledgeStoreId,
      name,
      description,
      type,
      url,
    });

    console.log(
      `\n\nKnowledgeAI Source with name: ${name} has been created!\n source: ${JSON.stringify(source, null, 2)}`
    );
  } catch (err) {
    console.error(`Error creating the KnowledgeAI Source, err: ${err}`);
    throw err;
  }
};
