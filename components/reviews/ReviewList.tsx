import { getProductReviews } from '@/app/actions/reviews'
import { Star } from 'lucide-react'
import { ReviewReactions } from './ReviewReactions'

interface ReviewListProps {
    productId: string
}

export async function ReviewList({ productId }: ReviewListProps) {
    const reviews = await getProductReviews(productId)

    if (reviews.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No reviews yet. Be the first to review this product!
            </div>
        )
    }

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <div>
                    <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                    {review.user?.avatar_url ? (
                                        <img
                                            src={review.user.avatar_url}
                                            alt={review.user.full_name || 'User'}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400 font-semibold text-xs uppercase">
                                            {(review.user?.full_name || 'A').charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="font-semibold">{review.user?.full_name || 'Anonymous'}</div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex text-yellow-400 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <h4 className="font-medium mb-1">{review.title}</h4>

                        <p className="text-gray-600">{review.review}</p>

                        <ReviewReactions
                            reviewId={review.id}
                            initialLikes={review.likes || 0}
                            initialDislikes={review.dislikes || 0}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
