import ProcessDetails from '@/app/dashboard/details/ProcessDetails'
import React , { Suspense }from 'react'

const Page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading process details...</div>}>
        <ProcessDetails />
      </Suspense>
    </div>
  )
}

export default Page