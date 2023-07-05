export interface IModuleState {
  helps: Help[]
}

export interface IHelp {
  id?: string
  task_id: string
  thread_id: string | null
  company_user_id: string | null
  responsibility_company_user_id: number | null
}

export class Help implements IHelp {
  public id?: string
  public task_id: string = ''
  public thread_id: string = ''
  public company_user_id: string = ''
  public responsibility_company_user_id: number | null = 0
}
