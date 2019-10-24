import { normalize, schema } from 'normalizr'

export class Normalizer {
  private data: any
  constructor(data: any) {
    this.data = data
  }
  public flatNormalizationById(property: string) {
    const entity = new schema.Entity(property)
    const mySchema = { [property]: [entity] }
    return normalize(this.data, mySchema).entities[property]
  }
}
