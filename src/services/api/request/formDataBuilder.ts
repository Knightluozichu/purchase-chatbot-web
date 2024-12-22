import { logger } from '../../../utils/logger';

export class FormDataBuilder {
  private formData: FormData;

  constructor() {
    this.formData = new FormData();
  }

  addField(name: string, value: string | undefined): FormDataBuilder {
    if (value !== undefined) {
      this.formData.append(name, value);
      logger.debug(`Added form field: ${name}`);
    }
    return this;
  }

  build(): FormData {
    return this.formData;
  }
}