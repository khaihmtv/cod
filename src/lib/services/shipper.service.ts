import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'

import { db } from '$lib/firebase'

const shippersRef = collection(db, 'shippers')

export async function createShipper(
  name: string,
  phone: string
) {
  await addDoc(shippersRef, {
    name,
    phone,
    createdAt: Date.now()
  })
}

export function listenShippers(
  callback: Function
) {
  return onSnapshot(
    query(shippersRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      callback(data)
    }
  )
}