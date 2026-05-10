<script lang="ts">
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'

  import { db } from '$lib/firebase'

  import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot
  } from 'firebase/firestore'

  const shipperId = page.params.id

  // tiền theo mệnh giá

  let bill500 = $state(0)
  let bill200 = $state(0)
  let bill100 = $state(0)
  let bill50 = $state(0)
  let bill20 = $state(0)
  let bill10 = $state(0)

  // form

  let hasFee = $state(true)

  let isBorrow = $state(false)

  let note = $state('Nhận tiền mặt')

  // transactions today

  let transactions = $state<any[]>([])

  onMount(() => {

    const q = query(
      collection(db, 'transactions'),
      where('shipperId', '==', shipperId)
    )

    const unsub = onSnapshot(
      q,
      (snapshot) => {

        transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

      }
    )

    return () => unsub()

  })

  // chỉ được tính phí 1 lần / ngày

  let alreadyFeeToday = $derived(

    transactions.some(t => {

      return (

        t.type === 'deposit' &&

        t.hasFee === true &&

        dayjs(t.createdAt).format(
          'DD/MM/YYYY'
        ) === dayjs().format(
          'DD/MM/YYYY'
        )

      )

    })

  )

  // total

  function totalAmount() {

    return (

      bill500 * 500 +

      bill200 * 200 +

      bill100 * 100 +

      bill50 * 50 +

      bill20 * 20 +

      bill10 * 10

    )

  }

  // quick add

  function addBill(
    type:string,
    amount:number
  ) {

    if (type === '500') {

      bill500 += amount

    }

    if (type === '200') {

      bill200 += amount

    }

    if (type === '100') {

      bill100 += amount

    }

    if (type === '50') {

      bill50 += amount

    }

    if (type === '20') {

      bill20 += amount

    }

    if (type === '10') {

      bill10 += amount

    }

  }

  // save

  async function saveCash() {

    if (!totalAmount()) {

      alert('Chưa có tiền')

      return

    }

    const newTransaction = {

      shipperId,

      type: 'deposit',

      amount: totalAmount(),

      // chỉ cho phí 1 lần mỗi ngày

      hasFee:
        hasFee &&
        !alreadyFeeToday,

      isBorrow,

      note,

      bills: {

        500: bill500,

        200: bill200,

        100: bill100,

        50: bill50,

        20: bill20,

        10: bill10

      },

      createdAt: Date.now()

    }

    await addDoc(
      collection(db, 'transactions'),
      newTransaction
    )

    goto(`/shippers/${shipperId}`)

  }

  const bills = [

    {
      label: '500K',
      key: '500',
      value: () => bill500
    },

    {
      label: '200K',
      key: '200',
      value: () => bill200
    },

    {
      label: '100K',
      key: '100',
      value: () => bill100
    },

    {
      label: '50K',
      key: '50',
      value: () => bill50
    },

    {
      label: '20K',
      key: '20',
      value: () => bill20
    },

    {
      label: '10K',
      key: '10',
      value: () => bill10
    }

  ]
</script>

<div class="min-h-screen bg-slate-100 p-4 md:p-8">

  <div class="max-w-3xl mx-auto">

    <!-- header -->

    <a
      href={`/shippers/${shipperId}`}
      class="text-blue-600 font-semibold"
    >
      ← Quay lại
    </a>

    <h1
      class="text-4xl font-bold mt-4 mb-8"
    >
      Nhận tiền mặt
    </h1>

    <!-- total -->



    <!-- bills -->
<!-- bills compact -->

<!-- sticky total -->

<div
  class="sticky top-3 z-50 mb-6"
>

  <div
    class="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-3xl p-5 shadow-2xl backdrop-blur"
  >

    <div
      class="text-sm opacity-80"
    >
      Tổng tiền mặt
    </div>

    <div
      class="text-4xl font-bold mt-2"
    >
      {totalAmount().toLocaleString()} đ
    </div>

  </div>

</div>

<!-- bills compact -->

<div
  class="bg-white rounded-3xl shadow p-5 mb-8"
>

  <div
    class="text-2xl font-bold mb-5"
  >
    Nhập tiền mặt
  </div>

  <div class="space-y-3">

    {#each bills as bill}

      <div
        class="flex items-center justify-between border rounded-2xl p-3"
      >

        <!-- label -->

        <div
          class="w-20 text-xl font-bold"
        >
          {bill.label}
        </div>

        <!-- value -->

        <div
          class="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-lg font-bold min-w-[70px] text-center"
        >
          {bill.value()}
        </div>

        <!-- buttons -->

        <div
          class="flex gap-2"
        >

          <button
            on:click={() => addBill(
              bill.key,
              1
            )}
            class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-100 font-bold transition"
          >
            1
          </button>

          <button
            on:click={() => addBill(
              bill.key,
              2
            )}
            class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-100 font-bold transition"
          >
            2
          </button>

          <button
            on:click={() => addBill(
              bill.key,
              5
            )}
            class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-100 font-bold transition"
          >
            5
          </button>

          <button
            on:click={() => addBill(
              bill.key,
              10
            )}
            class="w-12 h-10 rounded-xl bg-slate-100 hover:bg-blue-100 font-bold transition"
          >
            10
          </button>

        </div>

      </div>

    {/each}

  </div>

</div>

    <!-- options -->

    <div
      class="bg-white rounded-3xl shadow p-6 mb-8"
    >

      <div class="space-y-5">

        <!-- fee -->

        <div>

          <label
            class="flex items-center gap-3"
          >

            <input
              bind:checked={hasFee}
              type="checkbox"
              class="w-5 h-5"
            />

            <span
              class="font-semibold text-lg"
            >
              Có phí giao dịch
            </span>

          </label>

          {#if alreadyFeeToday}

            <div
              class="text-red-600 text-sm mt-2"
            >
              Hôm nay đã có giao dịch tính phí
            </div>

          {/if}

        </div>

     

      </div>

    </div>

    <!-- save -->

    <button
      on:click={saveCash}
      class="w-full bg-green-600 text-white rounded-3xl p-5 text-2xl font-bold shadow-lg"
    >
      Lưu tiền mặt
    </button>

  </div>

</div>