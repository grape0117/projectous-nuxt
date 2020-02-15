import { openDB } from 'idb'

const dbPromise = openDB('application-data', 1, {
  upgrade(db) {
    db.createObjectStore('all-data')
  }
})

export const idbKeyval = {
  async get(key: any) {
    return (await dbPromise).get('all-data', key)
  },
  async set(key: any, val: any) {
    return (await dbPromise).put('all-data', val, key)
  },
  async delete(key: any) {
    return (await dbPromise).delete('all-data', key)
  },
  async clear() {
    return (await dbPromise).clear('all-data')
  },
  async keys() {
    return (await dbPromise).getAllKeys('all-data')
  }
}
