"use client";

import { useEffect, useState } from "react";
import { getOrdersAction } from "@/app/actions/order-actions";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

    useEffect(() => {
        const fetchOrders = async () => {
            const result = await getOrdersAction();
            if (result.success && result.data) {
                setOrders(result.data);
            }
            setLoading(false);
        };
        fetchOrders();
    }, []);

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
                                        <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
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
                                            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusConfig[order.status || 'pending'].bg} ${statusConfig[order.status || 'pending'].color}`}>
                                                {(() => {
                                                    const Config = statusConfig[order.status || 'pending'];
                                                    return <Config.icon className="h-3 w-3" />;
                                                })()}
                                                {statusConfig[order.status || 'pending'].label}
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
                            <div className="bg-gray-50/30 p-4 sm:p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                                        <p className="line-clamp-1 italic">{order.address}</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-6 border-t border-gray-100 pt-4 sm:border-0 sm:pt-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment</p>
                                            <p className="text-xs font-medium uppercase">{order.payment_method}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Paid</p>
                                            <p className="text-lg font-black text-primary">{formatPrice(order.amount)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
