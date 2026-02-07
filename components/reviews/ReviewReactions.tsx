'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { toggleReviewReaction } from '@/app/actions/reviews'
import { toast } from 'sonner'

interface ReviewReactionsProps {
    reviewId: string
    initialLikes: number
    initialDislikes: number
}

export function ReviewReactions({ reviewId, initialLikes, initialDislikes }: ReviewReactionsProps) {
    const [likes, setLikes] = useState(initialLikes)
    const [dislikes, setDislikes] = useState(initialDislikes)
    const [isPending, setIsPending] = useState(false)

    const handleReaction = async (type: 'like' | 'dislike') => {
        if (isPending) return

        setIsPending(true)

        // Optimistic UI update
        if (type === 'like') setLikes(prev => prev + 1)
        else setDislikes(prev => prev + 1)

        const result = await toggleReviewReaction(reviewId, type)

        if (result.error) {
            toast.error(result.error)
            // Revert optimistic update
            if (type === 'like') setLikes(prev => prev - 1)
            else setDislikes(prev => prev - 1)
        } else {
            // Update with actual value from server if needed
            if (type === 'like') setLikes((result as any).likes || 0)
            else setDislikes((result as any).dislikes || 0)
        }

        setIsPending(false)
    }

    return (
        <div className="flex items-center gap-4 mt-3">
            <button
                onClick={() => handleReaction('like')}
                disabled={isPending}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                title="Like this review"
            >
                <ThumbsUp className={`w-4 h-4 ${likes > 0 ? 'fill-blue-50 text-blue-600' : ''}`} />
                <span>{likes}</span>
            </button>

            <button
                onClick={() => handleReaction('dislike')}
                disabled={isPending}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                title="Dislike this review"
            >
                <ThumbsDown className={`w-4 h-4 ${dislikes > 0 ? 'fill-red-50 text-red-600' : ''}`} />
                <span>{dislikes}</span>
            </button>
        </div>
    )
}
