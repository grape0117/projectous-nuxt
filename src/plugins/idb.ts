import { openDB } from 'idb'

const dbPromise = openDB('keyval-store', 1, {
  upgrade(db) {
    db.createObjectStore('keyval')
  }
})

export const idbKeyval = {
  async get(key: any) {
    return (await dbPromise).get('keyval', key)
  },
  async set(key: any, val: any) {
    return (await dbPromise).put('keyval', val, key)
  },
  async delete(key: any) {
    return (await dbPromise).delete('keyval', key)
  },
  async clear() {
    return (await dbPromise).clear('keyval')
  },
  async keys() {
    return (await dbPromise).getAllKeys('keyval')
  }
}
