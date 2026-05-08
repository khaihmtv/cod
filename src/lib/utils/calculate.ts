export function calculateTotal(
  transactions: any[],
  type: string
) {
  return transactions
    .filter(t => t.type === type)
    .reduce((a, b) => a + b.amount, 0)
}

export function calculateBalance(
  transactions: any[],
  shipperId: string
) {
  const data = transactions.filter(
    t => t.shipperId === shipperId
  )

  const income = calculateTotal(
    data,
    'income'
  )

  const expense = calculateTotal(
    data,
    'expense'
  )

  const deposit = calculateTotal(
    data,
    'deposit'
  )

  return income - expense - deposit
}