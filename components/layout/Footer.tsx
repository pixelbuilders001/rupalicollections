"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="hidden lg:block bg-secondary/20 border-t border-border/40 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-1">
                        <div className="mb-6">
                            <span className="font-serif text-2xl font-black leading-tight text-primary tracking-tight block">
                                Rupali
                            </span>
                            <span className="font-serif text-[10px] font-bold uppercase tracking-[0.3em] leading-tight text-primary/80 block">
                                Collections
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            Experience the elegance of traditional Indian fashion. We bring you the finest collection of Sarees, Kurtis, and Lehengas, crafted with love and tradition.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                                <Facebook className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                                <Instagram className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                                <Twitter className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Shop Section */}
                    <div className="col-span-1">
                        <h4 className="font-bold text-foreground mb-6">Shop</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/shop?sort=newest" className="text-sm text-muted-foreground hover:text-primary transition-colors">New Arrivals</Link>
                            </li>
                            <li>
                                <Link href="/shop?category=sarees" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sarees</Link>
                            </li>
                            <li>
                                <Link href="/shop?category=kurtis" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kurtis</Link>
                            </li>
                            <li>
                                <Link href="/shop?category=lehengas" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lehengas</Link>
                            </li>
                            <li>
                                <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">View All</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div className="col-span-1">
                        <h4 className="font-bold text-foreground mb-6">Customer Care</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/account" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Account</Link>
                            </li>
                            <li>
                                <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">Track Order</Link>
                            </li>
                            <li>
                                <Link href="/wishlist" className="text-sm text-muted-foreground hover:text-primary transition-colors">Wishlist</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shipping Policy</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Returns & Exchanges</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-1">
                        <h4 className="font-bold text-foreground mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span>123 Fashion Street, Ethnic Market,<br />New Delhi, India 110001</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 text-primary shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 text-primary shrink-0" />
                                <span>hello@rupalicollection.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border/40 pt-8 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Rupali Collection. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
