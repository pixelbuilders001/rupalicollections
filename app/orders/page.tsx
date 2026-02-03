"use client";

import { useEffect, useState } from "react";
import { getOrdersAction, cancelOrderAction } from "@/app/actions/order-actions";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { OrderTracker } from "@/components/orders/OrderTracker";

const statusConfig = {
    pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
    processing: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Processing" },
    shipped: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50", label: "Shipped" },
    delivered: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Delivered" },
    cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Cancelled" },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
    const [isTrackerOpen, setIsTrackerOpen] = useState(false);
    const fetchOrders = async () => {
        setLoading(true);
        const result = await getOrdersAction();
        if (result.success && result.data) {
            setOrders(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderCode: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;

        const result = await cancelOrderAction(orderCode);
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
                                    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-tight ${statusConfig[order.status in statusConfig ? order.status : 'pending'].bg} ${statusConfig[order.status in statusConfig ? order.status : 'pending'].color}`}>
                                        {(() => {
                                            const status = order.status in statusConfig ? order.status : 'pending';
                                            const Config = statusConfig[status];
                                            return <Config.icon className="h-3 w-3" />;
                                        })()}
                                        {statusConfig[order.status in statusConfig ? order.status : 'pending'].label}
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
                                            <h3 className="text-xs font-bold leading-tight line-clamp-1">{item.product?.name}</h3>
                                            <p className="text-[10px] font-medium text-muted-foreground">
                                                Qty: {item.qty} • {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <div className="flex items-center text-xs font-bold text-foreground">
                                            {formatPrice(item.price * item.qty)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Footer - App Summary Style */}
                            <div className="bg-gray-50/20 p-4">
                                <div className="mb-4 flex items-center justify-between border-t border-gray-100 pt-3">
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

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 flex-1 rounded-xl border-primary/20 bg-primary/5 text-[11px] font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white"
                                        onClick={() => {
                                            setTrackingOrder(order);
                                            setIsTrackerOpen(true);
                                        }}
                                    >
                                        Track Order
                                    </Button>
                                    {order.status?.toLowerCase() === 'created' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 flex-1 rounded-xl border-red-100 bg-red-50 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-600 hover:text-white"
                                            onClick={() => handleCancelOrder(order.id)}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <OrderTracker
                    order={trackingOrder}
                    open={isTrackerOpen}
                    onOpenChange={setIsTrackerOpen}
                />
            </div>
        </div>
    );
}
