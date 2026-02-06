"use client";

import { useEffect, useState, use } from "react";
import { useStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { getOrdersAction } from "@/app/actions/order-actions";
import { createReturnRequestAction } from "@/app/actions/return-actions";
import { Order, OrderItem } from "@/lib/types";
import { formatPrice, compressImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { Package, ArrowLeft, Upload, Check, AlertCircle, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ReturnOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const itemId = searchParams.get("itemId");
    // Unwrap params using React.use()
    const { orderId } = use(params);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [reasonType, setReasonType] = useState<string>("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            const result = await getOrdersAction();
            if (result.success && result.data) {
                const foundOrder = result.data.find((o: Order) => o.id === orderId);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    toast.error("Order not found");
                    router.push("/orders");
                }
            } else {
                router.push("/orders");
            }
            setLoading(false);
        };
        fetchOrder();
    }, [orderId, router]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            toast.promise(
                Promise.all(files.map(file => compressImage(file))),
                {
                    loading: 'Compressing images...',
                    success: (compressedFiles) => {
                        setImages(prev => [...prev, ...compressedFiles]);
                        const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
                        setPreviewUrls(prev => [...prev, ...newPreviews]);
                        return 'Images ready';
                    },
                    error: 'Failed to compress images'
                }
            );
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!selectedItem || !reasonType) {
            toast.error("Please select a reason");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("orderId", orderId);
        formData.append("orderItemId", selectedItem.id);
        formData.append("reasonType", reasonType);
        formData.append("reason", reasonType.replace(/_/g, ' '));
        formData.append("description", description);

        images.forEach((file) => {
            formData.append("images", file);
        });

        const result = await createReturnRequestAction(formData);

        if (result.success) {
            toast.success("Return request submitted successfully");
            setIsModalOpen(false);
            setSelectedItem(null);
            router.push("/orders");
        } else {
            toast.error(result.error || "Failed to submit return request");
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!order) return null;

    const returnFormContent = (
        <div className="flex flex-col h-full max-h-[90vh] md:max-h-[85vh]">
            <div className="flex items-center justify-between p-6 pb-2 md:p-8 md:pb-4 border-b md:border-none">
                <div>
                    <h2 className="text-xl font-serif font-bold">Return Request</h2>
                    <p className="text-xs text-muted-foreground">Select a reason for returning this item.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="md:hidden p-2">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 md:px-8">
                {selectedItem && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border bg-secondary/10 p-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white">
                            {selectedItem.product?.thumbnail_url && (
                                <Image
                                    src={selectedItem.product.thumbnail_url}
                                    alt={selectedItem.product.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold line-clamp-1">{selectedItem.product?.name}</p>
                            <p className="text-[10px] text-muted-foreground">Qty: {selectedItem.qty}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6 pb-10">
                    <div className="space-y-2">
                        <Label>Reason for Return</Label>
                        <Select onValueChange={setReasonType} value={reasonType}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] bg-white">
                                <SelectItem value="size_issue">Size Issue (Exchange)</SelectItem>
                                <SelectItem value="damaged">Damaged Item</SelectItem>
                                <SelectItem value="wrong_item">Wrong Item Received</SelectItem>
                                <SelectItem value="quality_issue">Quality Issue</SelectItem>
                                <SelectItem value="changed_mind">Changed Mind</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {reasonType === 'size_issue' ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
                        >
                            <h4 className="flex items-center gap-2 font-bold text-blue-800 text-sm mb-2">
                                <AlertCircle className="h-4 w-4" />
                                Exchange Available
                            </h4>
                            <p className="text-xs text-blue-600 mb-4">
                                We can exchange this item for a different size. Please check the available sizes below (Mockup).
                            </p>
                            <div className="flex gap-2">
                                {['S', 'M', 'L', 'XL'].map(size => (
                                    <div key={size} className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white font-bold text-sm">
                                        {size}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Label className="text-xs">Additional Note (Optional)</Label>
                                <Textarea
                                    placeholder="Tell us more about the fit..."
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                    className="mt-1.5 h-20 bg-white"
                                />
                            </div>
                        </motion.div>
                    ) : reasonType && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label>Upload Images (Proof)</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border">
                                            <Image src={url} alt="Proof" fill className="object-cover" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <span className="mt-1 text-[10px] font-medium text-muted-foreground">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Please describe the issue..."
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                    className="h-24"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="p-6 md:p-8 pt-2 md:pt-4 border-t md:border-none">
                <Button
                    className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !reasonType}
                >
                    {isSubmitting ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Submitting Request...
                        </>
                    ) : (
                        "Submit Return Request"
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-secondary/5 pb-20 pt-4">
            <div className="container mx-auto max-w-2xl px-4">
                <div className="mb-6 flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h1 className="font-serif text-2xl font-black uppercase tracking-tight">Return Items</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order #{order.order_code || order.id.slice(0, 8)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {order.items?.filter(item => {
                        const isNotCancelled = item.status !== 'cancelled';
                        const matchesItemId = !itemId || item.id === itemId;
                        return isNotCancelled && matchesItemId;
                    }).map((item) => (
                        <div key={item.id} className="overflow-hidden rounded-[2rem] border border-white/60 bg-white p-6 shadow-sm shadow-black/5 hover:shadow-md transition-shadow">
                            <div className="flex gap-6">
                                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl border bg-secondary/10">
                                    {item.product?.thumbnail_url ? (
                                        <Image
                                            src={item.product.thumbnail_url}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-8 w-8 text-muted-foreground/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col justify-between py-1">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1">{item.product?.name}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            Size: {item.selectedSize} • Color: {item.selectedColor}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-black text-primary">{formatPrice(item.price)}</p>
                                        <Button
                                            size="sm"
                                            className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10"
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setIsModalOpen(true);
                                                setReasonType("");
                                                setDescription("");
                                                setImages([]);
                                                setPreviewUrls([]);
                                            }}
                                        >
                                            Return / Exchange
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Sheet */}
            <div className="md:hidden">
                <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <SheetContent side="bottom" className="rounded-t-[2.5rem] p-0 h-[90vh]">
                        {returnFormContent}
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Dialog */}
            <div className="hidden md:block">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-xl p-0 overflow-hidden border-none bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh]">
                        {returnFormContent}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
