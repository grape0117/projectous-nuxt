export interface IHttp {
  fetch(url: string): Promise<any> // Fetch list of entities
  get(url: string, id: number | string): Promise<any> // Get one entity by id in lists
  post(url: string, data: any): Promise<any> // Create a new entity
  put(url: string, id: number | string, data: any): Promise<any> // Update an existing entity
  delete(url: string, id: number | string): Promise<any> // Delete an entity by id
}
