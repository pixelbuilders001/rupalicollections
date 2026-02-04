'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReviewForm } from './ReviewForm'

interface ReviewDialogProps {
    children: React.ReactNode
    productId: string
    orderId: string
    orderItemId: string
    initialData?: {
        rating: number
        title: string
        review: string
    }
    mode?: 'create' | 'edit'
    onSuccess?: () => void
}

export function ReviewDialog({
    children,
    productId,
    orderId,
    orderItemId,
    initialData,
    mode = 'create',
    onSuccess
}: ReviewDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Write a Review' : 'Edit Review'}</DialogTitle>
                </DialogHeader>
                <ReviewForm
                    productId={productId}
                    orderId={orderId}
                    orderItemId={orderItemId}
                    initialData={initialData}
                    onSuccess={() => {
                        setOpen(false)
                        if (onSuccess) onSuccess()
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}
