"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/lib/types";
import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrderTrackerProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const steps = [
    {
        id: "pending",
        label: "Order Placed",
        description: "Your order has been placed successfully.",
        icon: Package,
    },
    {
        id: "processing",
        label: "Processing",
        description: "We are preparing your beautiful collection.",
        icon: Clock,
    },
    {
        id: "shipped",
        label: "Shipped",
        description: "Your order is on its way to you.",
        icon: Truck,
    },
    {
        id: "delivered",
        label: "Delivered",
        description: "Order has been delivered. Enjoy!",
        icon: CheckCircle2,
    },
];

const cancelledStep = {
    id: "cancelled",
    label: "Cancelled",
    description: "This order has been cancelled.",
    icon: XCircle,
};

export function OrderTracker({ order, open, onOpenChange }: OrderTrackerProps) {
    if (!order) return null;

    const currentStatus = order.status || "pending";
    const history = order.history || [];
    const hasHistory = history.length > 0;

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return Package;
            case 'processing': return Clock;
            case 'shipped': return Truck;
            case 'delivered': return CheckCircle2;
            case 'cancelled': return XCircle;
            default: return Package;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Track Order</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Order #{order.order_code || order.id.slice(0, 8).toUpperCase()}
                    </p>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    {hasHistory ? (
                        history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((item, index) => {
                            const Icon = getStatusIcon(item.status);
                            const isFirst = index === 0;
                            return (
                                <div key={item.id} className="relative flex gap-4">
                                    {/* Line connecting steps */}
                                    {index !== history.length - 1 && (
                                        <div className="absolute left-[15px] top-6 h-full w-[2px] bg-primary/10" />
                                    )}

                                    {/* Step Icon */}
                                    <div className="relative flex flex-col items-center">
                                        <div className={cn(
                                            "z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ring-black/5 transition-all text-white",
                                            isFirst ? "bg-primary scale-110" : "bg-muted text-muted-foreground"
                                        )}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                    </div>

                                    {/* Step Content */}
                                    <div className="flex flex-1 flex-col gap-0.5 pb-2">
                                        <div className="flex items-center justify-between">
                                            <p className={cn(
                                                "text-sm font-bold capitalize leading-tight",
                                                isFirst ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {item.status.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-[10px] font-bold text-primary/60">
                                                {new Date(item.created_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short"
                                                })}
                                            </p>
                                        </div>
                                        <p className="text-[12px] text-muted-foreground leading-snug pr-4">
                                            {item.note || `Order status updated to ${item.status.replace(/_/g, ' ')}`}
                                        </p>
                                        <p className="mt-1 text-[10px] font-medium text-muted-foreground/60">
                                            {new Date(item.created_at).toLocaleTimeString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <Package className="mx-auto h-12 w-12 opacity-20" />
                            <p className="mt-2 text-sm">No tracking history available yet.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
