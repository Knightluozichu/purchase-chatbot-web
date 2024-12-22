import { ModelType } from '../../../types/model';
import { FormDataBuilder } from './formDataBuilder';

export function buildChatRequest(question: string, model: ModelType, apiKey?: string): FormData {
  return new FormDataBuilder()
    .addField('question', question)
    .addField('model', model)
    .addField('apiKey', apiKey)
    .build();
}