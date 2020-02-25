import { openDB } from 'idb'

const dbPromise = openDB('application-data', 1, {
  upgrade(db) {
    db.createObjectStore('company_clients')
    db.createObjectStore('company_users')
    db.createObjectStore('projects')
    db.createObjectStore('project_users')
    db.createObjectStore('task_users')
    db.createObjectStore('tasks')
    db.createObjectStore('user_task_lists')
    db.createObjectStore('timers')
  }
})

export const idbKeyval = {
  async get(key: any, storeName: string) {
    return (await dbPromise).get(storeName, key)
  },
  async set(key: any, val: any, storeName: string) {
    return (await dbPromise).put(storeName, val, key)
  },
  async delete(key: any, storeName: string) {
    return (await dbPromise).delete(storeName, key)
  },
  async clear(storeName: string) {
    return (await dbPromise).clear(storeName)
  },
  async keys(storeName: string) {
    return (await dbPromise).getAllKeys(storeName)
  }
}

export async function idbGetAll(storeName: string) {
  const keys = await idbKeyval.keys(storeName)
  const result: any[] = []
  keys.forEach(async key => {
    result.push(await idbKeyval.get(key, storeName))
  })
  return result
}
