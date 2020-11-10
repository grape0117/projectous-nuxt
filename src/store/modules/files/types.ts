export interface IModuleState {
  company_users: IFile[]
  lookup: {}
}

export interface IFile {
  id: string
  name: string
  filename: string
  thumbnail: string
  instructions: string
  project_id: string
  task_id: string
  created_at: string
  updated_at: string
  deleted_at: string
  image_url: string
}
