import { openDB } from 'idb'
import { modulesNamesList } from '@/store/modules-names'

const dbPromise = () =>
  openDB('projectous-data', 1, {
    upgrade(db) {
      modulesNamesList.forEach((moduleName: string) => {
        db.createObjectStore(moduleName)
      })
    }
  })

export const idbKeyval = {
  async get(key: any, storeName: string) {
    return (await dbPromise()).get(storeName, key)
  },
  async set(key: any, val: any, storeName: string) {
    return (await dbPromise()).put(storeName, val, key)
  },
  async delete(key: any, storeName: string) {
    return (await dbPromise()).delete(storeName, key)
  },
  async clear(storeName: string) {
    return (await dbPromise()).clear(storeName)
  },
  async keys(storeName: string) {
    return (await dbPromise()).getAllKeys(storeName)
  }
}

export async function idbGetAll(storeName: string) {
  const keys = await idbKeyval.keys(storeName)
  let result: any = {}
  if (storeName === 'properties') {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < keys.length; i++) {
      const val = await idbKeyval.get(keys[i], storeName)
      // @ts-ignore
      result[keys[i]] = val
    }
  } else {
    result = []
    keys.forEach(async key => {
      result.push(await idbKeyval.get(key, storeName))
    })
  }
  return result
}
