"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import {
    Package,
    MapPin,
    Heart,
    LogOut,
    Settings,
    User,
    ChevronRight,
    CreditCard,
    Bell,
    Pencil,
    ShieldCheck,
    Truck,
    Clock,
    UserCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from "@/app/actions/user-actions";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BackButton } from "@/components/common/BackButton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface UserProfile {
    id: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
    phone: string | null;
}

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
    const [saving, setSaving] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const result = await getUserProfile();
            if (!result.success || !result.data) {
                router.push("/login");
                return;
            }

            const profile = result.data;
            setUser(profile);
            setFormData({
                name: profile.name || "",
                phone: profile.phone || "",
                email: profile.email || ""
            });
            if (profile.avatar_url) setPreviewUrl(profile.avatar_url);
            setLoading(false);
        };

        getUser();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await createClient().auth.signOut();
            useStore.getState().clearCart();
            useStore.getState().setIsLoggedIn(false);
            router.refresh();
            router.push("/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setSaving(true);
        try {
            let avatar_url = user.avatar_url;

            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);
                const uploadResult = await uploadProfilePhoto(uploadFormData);
                if (uploadResult.success && uploadResult.data) {
                    avatar_url = uploadResult.data;
                } else {
                    toast.error("Failed to upload photo: " + uploadResult.error);
                    setSaving(false);
                    return;
                }
            }

            const updates = {
                full_name: formData.name,
                phone_number: formData.phone,
                profile_image: avatar_url,
                email: formData.email
            };

            const result = await updateUserProfile(updates);

            if (result.success) {
                const updatedProfileData = {
                    name: formData.name || null,
                    avatar_url: avatar_url || null
                };
                setUser(prev => prev ? ({ ...prev, ...updatedProfileData, phone: formData.phone || null }) : null);
                setPreviewUrl(avatar_url || null);
                setSelectedFile(null);
                setIsEditOpen(false);
                useStore.getState().setUserProfile(updatedProfileData as { name: string; avatar_url: string | null });
                toast.success("Profile updated successfully!");
                router.refresh();
            } else {
                toast.error("Failed to update profile. Please try again.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setSaving(false);
        }
    };

    const menuItems = [
        {
            icon: Package,
            label: "My Orders",
            desc: "Track, return or buy items again",
            href: "/orders",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            icon: Heart,
            label: "Wishlist",
            desc: "View your saved favorites",
            href: "/wishlist",
            color: "text-pink-600",
            bg: "bg-pink-50"
        },
        {
            icon: MapPin,
            label: "Saved Addresses",
            desc: "Manage your delivery locations",
            href: "/addresses",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        // {
        //     icon: Settings,
        //     label: "Account Settings",
        //     desc: "Privacy, security and more",
        //     href: "#",
        //     color: "text-slate-600",
        //     bg: "bg-slate-50"
        // },
    ];

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="animate-pulse text-sm text-muted-foreground font-serif">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/5 pb-20 pt-4 md:pb-12 md:pt-10">
            <div className="container mx-auto max-w-6xl px-4">
                {/* Header for Desktop */}
                <div className="hidden md:block mb-10">
                    <h1 className="font-serif text-4xl font-black text-foreground uppercase tracking-tight">Your Account</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Manage your profile, orders, and addresses from one place.</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Profile Card (Sidebar on Desktop) */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                        >
                            <div className="p-8">
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-6">
                                        <div className="h-28 w-28 overflow-hidden rounded-3xl border-4 border-secondary/20 bg-white shadow-lg ring-4 ring-white">
                                            {previewUrl ? (
                                                <Image
                                                    src={previewUrl}
                                                    alt={user?.name || "User"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                                                    <User className="h-12 w-12 opacity-30" />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setIsEditOpen(true)}
                                            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">{user?.name}</h2>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{user?.email}</p>
                                </div>

                                <div className="mt-10 space-y-5">
                                    <div className="flex items-center gap-4 group cursor-default">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Bell className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block leading-none mb-1">Email Address</span>
                                            <span className="text-sm font-bold text-foreground line-clamp-1">{user?.email}</span>
                                        </div>
                                    </div>

                                    {user?.phone && (
                                        <div className="flex items-center gap-4 group cursor-default">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/10 text-primary group-hover:scale-110 transition-transform">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block leading-none mb-1">Phone Number</span>
                                                <span className="text-sm font-bold text-foreground">{user.phone}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 group cursor-default">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/10 text-primary group-hover:scale-110 transition-transform">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block leading-none mb-1">Member Since</span>
                                            <span className="text-sm font-bold text-foreground">Feb 2026</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-secondary/10 hidden md:block">
                                    <Button
                                        variant="outline"
                                        onClick={handleLogout}
                                        className="w-full h-12 rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold uppercase tracking-widest text-[10px] transition-all"
                                        loading={isLoggingOut}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out Account
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Dashboard (Grid on Desktop, List on Mobile) */}
                    <div className="lg:col-span-8">
                        <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                            {menuItems.map((item, idx) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className="group relative flex h-full items-center gap-5 overflow-hidden rounded-[2.5rem] border border-white/60 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1"
                                    >
                                        <div className={cn(
                                            "flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] shadow-sm transition-transform group-hover:scale-110 duration-500",
                                            item.bg,
                                            item.color
                                        )}>
                                            <item.icon className="h-7 w-7" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                                            <p className="text-xs font-medium text-muted-foreground/80 mt-1">{item.desc}</p>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Additional Dashboard Info for Desktop */}
                        <div className="mt-8 hidden lg:grid grid-cols-3 gap-6">
                            <div className="p-6 rounded-[2rem] bg-secondary/10 border border-white/40 flex flex-col items-center text-center">
                                <Truck className="h-8 w-8 text-primary mb-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Free Shipping</span>
                                <span className="text-xs font-bold mt-1">On All Orders</span>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-secondary/10 border border-white/40 flex flex-col items-center text-center">
                                <Clock className="h-8 w-8 text-primary mb-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fast Delivery</span>
                                <span className="text-xs font-bold mt-1">2-4 Business Days</span>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-secondary/10 border border-white/40 flex flex-col items-center text-center">
                                <ShieldCheck className="h-8 w-8 text-primary mb-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure Payment</span>
                                <span className="text-xs font-bold mt-1">Safe Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Logout Button */}
                <div className="mt-12 flex justify-center md:hidden">
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full h-14 rounded-2xl border-red-50 text-red-500 hover:bg-red-50 hover:text-red-600 font-black uppercase tracking-[0.2em] text-[11px]"
                        loading={isLoggingOut}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
                    <div className="bg-secondary/10 px-8 py-6 border-b border-secondary/10 shrink-0">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Profile</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">Update your personal information</DialogDescription>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="relative h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-3xl border-2 border-white bg-secondary/5 shadow-lg">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <User className="h-8 w-8 m-auto text-muted-foreground" />
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest"
                                onClick={() => document.getElementById('modal-avatar-input')?.click()}
                            >
                                <Pencil className="h-3 w-3 mr-1" /> Change Photo
                            </Button>
                            <input
                                id="modal-avatar-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Full Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 rounded-xl border-secondary/20 focus:border-primary/50 transition-colors"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Phone Number</label>
                                <Input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-12 rounded-xl border-secondary/20 focus:border-primary/50 transition-colors"
                                    placeholder="+91 00000 00000"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Email Address</label>
                                <Input
                                    value={formData.email}
                                    disabled
                                    className="h-12 rounded-xl bg-secondary/5 border-none opacity-60"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 pt-4 border-t border-secondary/5 shrink-0">
                        <Button
                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                            onClick={handleSaveChanges}
                            loading={saving}
                        >
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
