"use client";

import { useEffect, useState } from "react";
import { getOrdersAction, cancelOrderAction } from "@/app/actions/order-actions";
import { getUserReviews } from "@/app/actions/reviews";
import { Order, ProductReview } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, MapPin, Calendar, ShoppingBag, Download } from "lucide-react";
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
            <div className="flex h-[80vh] items-center justify-center bg-background">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary/40" />
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center bg-background">
                <div className="relative mb-8">
                    <div className="h-32 w-32 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Package className="h-14 w-14 text-muted-foreground/40" />
                    </div>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white"
                    >
                        <ShoppingBag className="h-5 w-5 fill-current" />
                    </motion.div>
                </div>
                <h1 className="font-serif text-2xl font-black uppercase tracking-tight">No orders yet</h1>
                <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-widest max-w-[240px] leading-relaxed">
                    You haven't placed any orders yet. Start your fashion journey with us today.
                </p>
                <Link href="/shop" className="mt-10 w-full max-w-[200px]">
                    <Button className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                        Explore Shop
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/5 pb-24 pt-6">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="mb-6">
                    <h1 className="font-serif text-3xl font-black uppercase tracking-tight text-foreground">My Orders</h1>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{orders.length} {orders.length === 1 ? 'Booking' : 'Bookings'} Total</p>
                </div>

                <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
                    {orders.map((order, idx) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                            className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]"
                        >
                            {/* Order Header - Preserving Mobile Structure, Enhancing Desktop */}
                            <div className="bg-secondary/5 px-6 md:px-10 py-4 md:py-6 border-b border-secondary/10">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Order Reference</span>
                                            <span className="font-mono text-xs md:text-sm font-black text-foreground">#{order.order_code || order.id.slice(0, 8).toUpperCase()}</span>
                                        </div>
                                        <div className="hidden md:block h-6 w-px bg-secondary/20" />
                                        <div className="hidden md:flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Ordered On</span>
                                            <span className="text-[11px] md:text-sm font-bold text-foreground">
                                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mobile Only: Ordered On (Right Aligned) */}
                                    <div className="flex flex-col items-end md:hidden">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Ordered On</span>
                                        <span className="text-[11px] font-bold text-foreground">
                                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </span>
                                    </div>

                                    {/* Desktop Only: Manage/Invoice */}
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Manage</span>
                                        <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                                            <Download className="h-3.5 w-3.5" />
                                            Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="px-2 md:px-6 pt-2 pb-2">
                                {order.items?.map((item, itemIdx) => (
                                    <div key={item.id} className={cn(
                                        "p-4 rounded-[1.8rem] transition-colors md:hover:bg-secondary/5",
                                        itemIdx !== (order.items?.length ?? 0) - 1 && "mb-2"
                                    )}>
                                        <div className="flex gap-4 md:gap-8 md:items-center">
                                            {/* Image - Exact Mobile Size */}
                                            <div className="relative h-20 w-16 md:h-24 md:w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-secondary/10 border border-secondary/10 shadow-sm">
                                                {item.product?.thumbnail_url ? (
                                                    <Image
                                                        src={item.product.thumbnail_url}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="80px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Package className="h-6 w-6 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Area - Restoring Mobile Row Structure */}
                                            <div className="flex flex-1 flex-col md:flex-row md:items-center md:justify-between py-0.5">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="text-xs md:text-sm font-black uppercase tracking-tight line-clamp-1 leading-tight">{item.product?.name}</h3>
                                                            <p className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                                Qty: <span className="text-foreground">{item.qty}</span> • {formatPrice(item.price)}
                                                            </p>
                                                        </div>

                                                        {/* Mobile Status Tag */}
                                                        <div className="md:hidden">
                                                            {(() => {
                                                                const itemStatus = item.status || 'pending';
                                                                const status = (itemStatus in statusConfig ? itemStatus : 'pending') as keyof typeof statusConfig;
                                                                const Config = statusConfig[status];
                                                                return (
                                                                    <div className={cn(
                                                                        "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border",
                                                                        Config.bg, Config.color, "border-current/10"
                                                                    )}>
                                                                        {itemStatus.replace(/_/g, ' ')}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Desktop Status Label */}
                                                <div className="hidden md:flex flex-col items-center justify-center min-w-[140px] px-4">
                                                    {(() => {
                                                        const itemStatus = item.status || 'pending';
                                                        const status = (itemStatus in statusConfig ? itemStatus : 'pending') as keyof typeof statusConfig;
                                                        const Config = statusConfig[status];
                                                        return (
                                                            <div className={cn(
                                                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2",
                                                                Config.bg, Config.color, "border-current/10"
                                                            )}>
                                                                <Config.icon className="h-3 w-3" />
                                                                {itemStatus.replace(/_/g, ' ')}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Action Buttons - Exact Mobile mt-4 Row */}
                                                <div className="mt-4 md:mt-0 flex flex-wrap gap-2 md:min-w-[200px] md:justify-end">
                                                    {(() => {
                                                        const itemStatus = item.status || order.status;
                                                        const isCancelled = itemStatus === 'cancelled';
                                                        if (isCancelled) return null;

                                                        const isDelivered = itemStatus === 'delivered';
                                                        const canCancel = itemStatus?.toLowerCase() === 'created' || itemStatus?.toLowerCase() === 'pending';

                                                        return (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setTrackingOrder(order);
                                                                        setTrackingItemId(item.id);
                                                                        setIsTrackerOpen(true);
                                                                    }}
                                                                    className="h-9 px-4 rounded-xl border border-primary/10 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary transition-all active:scale-[0.97] hover:bg-primary/10 shadow-sm"
                                                                >
                                                                    Track Now
                                                                </button>

                                                                {isDelivered && (
                                                                    <div className="flex gap-2">
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
                                                                            <button className="h-9 px-4 rounded-xl border border-secondary/20 bg-white text-[10px] font-black uppercase tracking-widest text-foreground/70 transition-all active:scale-[0.97] hover:bg-secondary/5">
                                                                                {userReviews[item.id] ? 'Edit Review' : 'Review'}
                                                                            </button>
                                                                        </ReviewDialog>

                                                                        <Link href={`/return/${order.id}?itemId=${item.id}`}>
                                                                            <button className="h-9 px-4 rounded-xl border border-orange-200 bg-white text-[10px] font-black uppercase tracking-widest text-orange-600 transition-all active:scale-[0.97] hover:bg-orange-50">
                                                                                Return
                                                                            </button>
                                                                        </Link>
                                                                    </div>
                                                                )}

                                                                {canCancel && (
                                                                    <button
                                                                        onClick={() => handleCancelOrder(order.id, item.id)}
                                                                        className="h-9 px-4 rounded-xl border border-red-100 bg-white text-[10px] font-black uppercase tracking-widest text-red-500 transition-all active:scale-[0.97] hover:bg-red-50"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Footer - Preserving Mobile Summary, Enhancing Desktop */}
                            <div className="px-6 md:px-10 py-5 md:py-8 bg-secondary/5 border-t border-secondary/10 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Address Verified</span>
                                        <span className="hidden md:block text-[9px] font-medium text-muted-foreground/60 uppercase">Secure Delivery</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mb-1 shadow-sm px-1">Total Paid</span>
                                    <span className="text-xl md:text-3xl font-black text-primary leading-none">{formatPrice(order.amount)}</span>
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
