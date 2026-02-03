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

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;

        const result = await cancelOrderAction(orderId);
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
        <div className="min-h-screen bg-secondary/5 pb-20 pt-8 mt-16">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="font-serif text-3xl font-bold">My Orders</h1>
                </div>

                <div className="space-y-6">
                    {orders.map((order, idx) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="overflow-hidden rounded-2xl border border-white/40 bg-white shadow-md"
                        >
                            {/* Order Header */}
                            <div className="border-b border-gray-100 bg-gray-50/50 p-4 sm:p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order ID</p>
                                        <p className="font-mono text-sm font-medium">#{order.order_code || order.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:block">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Placed On</p>
                                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                                            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusConfig[order.status in statusConfig ? order.status : 'pending'].bg} ${statusConfig[order.status in statusConfig ? order.status : 'pending'].color}`}>
                                                {(() => {
                                                    const status = order.status in statusConfig ? order.status : 'pending';
                                                    const Config = statusConfig[status];
                                                    return <Config.icon className="h-3 w-3" />;
                                                })()}
                                                {statusConfig[order.status in statusConfig ? order.status : 'pending'].label}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="divide-y divide-gray-50">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 sm:p-6">
                                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-muted sm:h-24 sm:w-24">
                                            {item.product?.thumbnail_url ? (
                                                <Image
                                                    src={item.product.thumbnail_url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center">
                                            <h3 className="text-sm font-bold sm:text-base">{item.product?.name}</h3>
                                            <div className="mt-1 flex items-center gap-4 text-xs font-medium text-muted-foreground sm:text-sm">
                                                <span>Qty: {item.qty}</span>
                                                <span>•</span>
                                                <span>{formatPrice(item.price)} each</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm font-bold sm:text-base">
                                            {formatPrice(item.price * item.qty)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Footer */}
                            <div className="bg-gray-50/30 p-4 sm:p-6 w-full">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-2 text-xs text-muted-foreground mb-4">
                                            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                                            <p className="italic">{order.address}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-between">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 rounded-full border-primary/20 bg-primary/5 px-6 text-xs font-bold text-primary hover:bg-primary hover:text-white"
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
                                                    className="h-9 rounded-full border-red-200 bg-red-50 px-6 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white"
                                                    onClick={() => handleCancelOrder(order.id)}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-6 border-t border-gray-100 pt-4 sm:border-0 sm:pt-0 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-nowrap">Payment</p>
                                            <p className="text-xs font-medium uppercase text-nowrap">{order.payment_method}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-nowrap">Total Paid</p>
                                            <p className="text-lg font-black text-primary text-nowrap">{formatPrice(order.amount)}</p>
                                        </div>
                                    </div>
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
