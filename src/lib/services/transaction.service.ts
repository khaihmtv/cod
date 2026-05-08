import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'

import { db } from '$lib/firebase'

const transactionsRef =
  collection(db, 'transactions')

export async function createTransaction(data: any) {
  await addDoc(transactionsRef, {
    ...data,
    amount: Number(data.amount),
    createdAt: Date.now()
  })
}

export function listenTransactions(
  callback: Function
) {
  return onSnapshot(
    query(
      transactionsRef,
      orderBy('createdAt', 'desc')
    ),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      callback(data)
    }
  )
}