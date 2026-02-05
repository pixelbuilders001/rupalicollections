"use client";

import { useEffect, useState } from "react";
import { getOrdersAction, cancelOrderAction } from "@/app/actions/order-actions";
import { getUserReviews } from "@/app/actions/reviews";
import { Order, ProductReview } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { OrderTracker } from "@/components/orders/OrderTracker";
import { BackButton } from "@/components/common/BackButton";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";

const statusConfig = {
    created: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
    pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
    processing: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Processing" },
    shipped: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50", label: "Shipped" },
    delivered: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Delivered" },
    cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Cancelled" },
    return_initiated: { icon: Clock, color: "text-orange-600", bg: "bg-orange-50", label: "Return Requested" },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [userReviews, setUserReviews] = useState<Record<string, ProductReview>>({});
    const [loading, setLoading] = useState(true);
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
    const [trackingItemId, setTrackingItemId] = useState<string | null>(null);
    const [isTrackerOpen, setIsTrackerOpen] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        const [ordersResult, reviewsResult] = await Promise.all([
            getOrdersAction(),
            getUserReviews()
        ]);

        if (ordersResult.success && ordersResult.data) {
            setOrders(ordersResult.data);
        }

        if (reviewsResult) {
            const reviewsMap = reviewsResult.reduce((acc, review) => {
                acc[review.order_item_id] = review;
                return acc;
            }, {} as Record<string, ProductReview>);
            setUserReviews(reviewsMap);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId: string, orderItemId?: string) => {
        if (!confirm(`Are you sure you want to cancel this ${orderItemId ? 'item' : 'order'}?`)) return;

        const result = await cancelOrderAction(orderId, orderItemId);
        if (result.success) {
            fetchOrders();
        } else {
            alert(result.error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
                <div className="mb-6 rounded-full bg-muted p-6">
                    <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="font-serif text-3xl font-bold">No Orders Yet</h1>
                <p className="mt-2 text-muted-foreground">You haven't placed any orders yet. Start shopping to see them here!</p>
                <Link href="/shop" className="mt-8">
                    <Button size="lg" className="rounded-full px-8">Browse Collection</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/5 pb-20 pt-4">
            <div className="container mx-auto max-w-2xl px-4">
                {/* <BackButton className="mb-4" showLabel label="Back" /> */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-2xl font-bold md:text-3xl">My Orders</h1>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{orders.length} orders total</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {orders.map((order, idx) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="overflow-hidden rounded-2xl border border-white/40 bg-white shadow-sm transition-all active:scale-[0.98]"
                        >
                            {/* Order Header - Compact */}
                            <div className="border-b border-gray-100 bg-gray-50/30 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">Order ID</p>
                                        <p className="font-mono text-[11px] font-bold text-foreground">#{order.order_code || order.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items - Tighter */}
                            <div className="divide-y divide-gray-50/50">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-3 p-4">
                                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-muted shadow-xs">
                                            {item.product?.thumbnail_url ? (
                                                <Image
                                                    src={item.product.thumbnail_url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-6 w-6 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center gap-0.5">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h3 className="text-xs font-bold leading-tight line-clamp-1">{item.product?.name}</h3>
                                                {(() => {
                                                    const itemStatus = item.status
                                                    const status = (itemStatus && itemStatus in statusConfig ? itemStatus : 'pending') as keyof typeof statusConfig;
                                                    const Config = statusConfig[status];
                                                    return (
                                                        <div className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tight ${Config.bg} ${Config.color}`}>
                                                            {/* <Config.icon className="h-2 w-2" /> */}
                                                            {itemStatus?.replace(/_/g, ' ')}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-medium text-muted-foreground">
                                                    Qty: {item.qty} • {formatPrice(item.price)}
                                                </p>
                                                <div className="text-xs font-bold text-foreground">
                                                    {formatPrice(item.price * item.qty)}
                                                </div>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {/* Local status for logic (item status takes precedence) */}
                                                {(() => {
                                                    const itemStatus = item.status || order.status;
                                                    const isCancelled = itemStatus === 'cancelled';
                                                    if (isCancelled) return null;

                                                    const isDelivered = itemStatus === 'delivered';
                                                    const canCancel = itemStatus?.toLowerCase() === 'created' || itemStatus?.toLowerCase() === 'pending';

                                                    return (
                                                        <>
                                                            {/* Write Review - Delivered only */}
                                                            {isDelivered && (
                                                                <ReviewDialog
                                                                    productId={item.product_id}
                                                                    orderId={order.id}
                                                                    orderItemId={item.id}
                                                                    mode={userReviews[item.id] ? 'edit' : 'create'}
                                                                    initialData={userReviews[item.id] ? {
                                                                        rating: userReviews[item.id].rating,
                                                                        title: userReviews[item.id].title || '',
                                                                        review: userReviews[item.id].review || ''
                                                                    } : undefined}
                                                                    onSuccess={fetchOrders}
                                                                >
                                                                    <Button variant="outline" size="sm" className="h-7 rounded-lg border-primary/20 bg-primary/5 px-3 text-[9px] font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white">
                                                                        {userReviews[item.id] ? 'Edit Review' : 'Write Review'}
                                                                    </Button>
                                                                </ReviewDialog>
                                                            )}

                                                            {/* Return Item - Delivered only */}
                                                            {isDelivered && (
                                                                <Link href={`/return/${order.id}?itemId=${item.id}`} className="flex-1 min-w-[80px]">
                                                                    <Button variant="outline" size="sm" className="h-7 w-full rounded-lg border-orange-200 bg-orange-50 px-3 text-[9px] font-bold uppercase tracking-wider text-orange-600 hover:bg-orange-600 hover:text-white">
                                                                        Return item
                                                                    </Button>
                                                                </Link>
                                                            )}

                                                            {/* Track Item - Show always unless it's just created (no history) or if we want to allow tracking cancelled items too */}
                                                            {itemStatus !== 'created' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 flex-1 rounded-lg border-primary/20 bg-primary/5 px-3 text-[9px] font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setTrackingOrder(order);
                                                                        setTrackingItemId(item.id);
                                                                        setIsTrackerOpen(true);
                                                                    }}
                                                                >
                                                                    Track item
                                                                </Button>
                                                            )}

                                                            {/* Cancel Item - Created/Pending only */}
                                                            {canCancel && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 flex-1 rounded-lg border-red-100 bg-red-50 px-3 text-[9px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-600 hover:text-white"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCancelOrder(order.id, item.id);
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Footer - App Summary Style */}
                            <div className="bg-gray-50/20 p-4">
                                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span className="text-[10px] font-medium">
                                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Total Amount</span>
                                        <span className="text-sm font-black text-primary">{formatPrice(order.amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <OrderTracker
                    order={trackingOrder}
                    orderItemId={trackingItemId}
                    open={isTrackerOpen}
                    onOpenChange={setIsTrackerOpen}
                />
            </div>
        </div>
    );
}
