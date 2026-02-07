'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { toggleReviewReaction } from '@/app/actions/reviews'
import { toast } from 'sonner'

interface ReviewReactionsProps {
    reviewId: string
    initialLikes: number
    initialDislikes: number
}

type ReactionType = 'like' | 'dislike' | null

export function ReviewReactions({ reviewId, initialLikes, initialDislikes }: ReviewReactionsProps) {
    const [likes, setLikes] = useState(initialLikes)
    const [dislikes, setDislikes] = useState(initialDislikes)
    const [userReaction, setUserReaction] = useState<ReactionType>(null)
    const [isPending, setIsPending] = useState(false)

    // Load reaction from localStorage on mount
    useEffect(() => {
        const savedReactions = localStorage.getItem('review_reactions')
        if (savedReactions) {
            const reactions = JSON.parse(savedReactions)
            if (reactions[reviewId]) {
                setUserReaction(reactions[reviewId])
            }
        }
    }, [reviewId])

    const saveReaction = (reaction: ReactionType) => {
        const savedReactions = localStorage.getItem('review_reactions')
        const reactions = savedReactions ? JSON.parse(savedReactions) : {}

        if (reaction) {
            reactions[reviewId] = reaction
        } else {
            delete reactions[reviewId]
        }

        localStorage.setItem('review_reactions', JSON.stringify(reactions))
        setUserReaction(reaction)
    }

    const handleReaction = async (type: ReactionType) => {
        if (isPending || !type) return
        setIsPending(true)

        const isRemoving = userReaction === type
        const isSwitching = userReaction && userReaction !== type

        // Optimistic UI updates
        if (isRemoving) {
            if (type === 'like') setLikes(prev => Math.max(0, prev - 1))
            else setDislikes(prev => Math.max(0, prev - 1))
        } else if (isSwitching) {
            if (type === 'like') {
                setLikes(prev => prev + 1)
                setDislikes(prev => Math.max(0, prev - 1))
            } else {
                setDislikes(prev => prev + 1)
                setLikes(prev => Math.max(0, prev - 1))
            }
        } else {
            if (type === 'like') setLikes(prev => prev + 1)
            else setDislikes(prev => prev + 1)
        }

        try {
            // If switching, we need to do two operations (decrement old, increment new)
            // For simplicity and to minimize server calls, we could aggregate but let's stick to the steps for clarity
            if (isSwitching && userReaction) {
                await toggleReviewReaction(reviewId, userReaction, 'dec')
            }

            const action = isRemoving ? 'dec' : 'inc'
            const result = await toggleReviewReaction(reviewId, type, action)

            if (result.error) {
                toast.error(result.error)
                // Revert optimistic updates on error (complex with switching, but let's keep it simple)
                window.location.reload() // Simplest way to sync state on error
            } else {
                saveReaction(isRemoving ? null : type)
                // Sync with actual values from server
                if (type === 'like') setLikes((result as any).likes ?? 0)
                else setDislikes((result as any).dislikes ?? 0)
            }
        } catch (error) {
            toast.error('Something went wrong')
            window.location.reload()
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="flex items-center gap-4 mt-3">
            <button
                onClick={() => handleReaction('like')}
                disabled={isPending}
                className={`flex items-center gap-1.5 text-sm transition-colors ${userReaction === 'like' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                    }`}
                title={userReaction === 'like' ? 'Remove like' : 'Like this review'}
            >
                <ThumbsUp className={`w-4 h-4 ${userReaction === 'like' ? 'fill-blue-50' : ''}`} />
                <span>{likes}</span>
            </button>

            <button
                onClick={() => handleReaction('dislike')}
                disabled={isPending}
                className={`flex items-center gap-1.5 text-sm transition-colors ${userReaction === 'dislike' ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                    }`}
                title={userReaction === 'dislike' ? 'Remove dislike' : 'Dislike this review'}
            >
                <ThumbsDown className={`w-4 h-4 ${userReaction === 'dislike' ? 'fill-red-50' : ''}`} />
                <span>{dislikes}</span>
            </button>
        </div>
    )
}
