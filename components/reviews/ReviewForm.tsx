'use client'

import { useState } from 'react'
import { submitReview } from '@/app/actions/reviews'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
    productId: string
    orderId: string
    orderItemId: string
    initialData?: {
        rating: number
        title: string
        review: string
    }
    onSuccess?: () => void
}

export function ReviewForm({ productId, orderId, orderItemId, initialData, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(initialData?.rating || 0)
    const [title, setTitle] = useState(initialData?.title || '')
    const [review, setReview] = useState(initialData?.review || '')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        setIsSubmitting(true)

        try {
            const result = await submitReview({
                product_id: productId,
                order_id: orderId,
                order_item_id: orderItemId,
                rating,
                title,
                review
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Review submitted successfully!')
                if (onSuccess) {
                    onSuccess()
                }
                router.refresh()
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className="focus:outline-hidden"
                        >
                            <Star
                                className={`w-6 h-6 ${value <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summary of your review"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="review">Review</Label>
                <Textarea
                    id="review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tell us what you think"
                    required
                />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
        </form>
    )
}
